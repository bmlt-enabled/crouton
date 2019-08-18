var crouton_Handlebars = Handlebars.noConflict();
function Crouton(config) {
	var self = this;
	self.mutex = false;
	self.max_filters = 10;  // TODO: needs to be refactored so that dropdowns are treated dynamically
	self.config = {
		placeholder_id: "bmlt-tabs",  // The DOM id that will be used for rendering
		map_max_zoom: 15,		      // Maximum zoom for the display map
		time_format: "h:mm a",        // The format for time
		language: "en-US",            // Default language translation, available translations listed here: https://github.com/bmlt-enabled/crouton/blob/master/croutonjs/src/js/crouton-localization.js
		has_tabs: true,               // Shows the day tabs
		header: true,                 // Shows the dropdowns and buttons
		include_weekday_button: true, // Shows the weekday button
		button_filters: [
			{'title': 'City', 'field': 'location_municipality'},
		],
		show_map: false,              // Shows the map with pins
		has_cities: true,             // Shows the cities dropdown
		has_formats: true,            // Shows the formats dropdown
		has_groups: true,             // Shows the groups dropdown
		has_locations: true,          // Shows the locations dropdown
		has_zip_codes: true,          // Shows the zip codes dropdown
		has_areas: false,             // Shows the areas dropdown
		has_states: false,            // Shows the states dropdown
		has_sub_province: false,      // Shows the sub province dropdown (counties)
		show_distance: false,         // Determines distance on page load
		distance_search: 0,			  // Makes a distance based search with results either number of / or distance from coordinates
		recurse_service_bodies: false,// Recurses service bodies when making service bodies request
		service_body: [],             // Array of service bodies to return data for.
		exclude_zip_codes: [],        // List of zip codes to exclude
		extra_meetings: [],           // List of id_bigint of meetings to include
		auto_tz_adjust: false,        // Will auto adjust the time zone, by default will assume the timezone is local time
		base_tz: null,                // In conjunction with auto_tz_adjust the timezone to base from.  Choices are listed here: https://github.com/bmlt-enabled/crouton/blob/master/croutonjs/src/js/moment-timezone.js#L623
		custom_query: null,			  // Enables overriding the services related queries for a custom one
		google_api_key: null,		  // Required if using the show_map option.  Be sure to add an HTTP restriction as well.
		sort_keys: "start_time",	  // Controls sort keys on the query
		int_start_day_id: 1,          // Controls the first day of the week sequence.  Sunday is 1.
		view_by: "weekday"            // TODO: replace with using the first choice in button_filters as the default view_by.
	};

	self.setConfig(config);
	self.localization = new CroutonLocalization(self.config['language']);
	self.getMeetings = function(url) {
		jQuery.getJSON(this.config['root_server'] + url + '&callback=?', function (data) {
			if (data === null || JSON.stringify(data) === "{}") {
				console.error("Could not find any meetings for the criteria specified.");
				return;
			}
			data.exclude(self.config['exclude_zip_codes'], "location_postal_code_1");
			self.meetingData = data;

			if (self.config['extra_meetings'].length > 0) {
				var extra_meetings_query = "";
				for (var i = 0; i < self.config['extra_meetings'].length; i++) {
					extra_meetings_query += "&meeting_ids[]=" + self.config["extra_meetings"][i];
				}
				jQuery.getJSON(self.config['root_server'] + url + '&callback=?' + extra_meetings_query, function (data) {
					self.meetingData = self.meetingData.concat(data);
					self.mutex = false;
				});
			} else {
				self.mutex = false;
			}
		});
	};
	self.mutex = true;
	var url = '/client_interface/jsonp/?switcher=GetSearchResults&data_field_key=location_postal_code_1,duration_time,' +
		'start_time,weekday_tinyint,service_body_bigint,longitude,latitude,location_province,location_municipality,' +
		'location_street,location_info,location_text,formats,format_shared_id_list,comments,meeting_name,' +
		'location_sub_province,worldid_mixed,root_server_uri';

	if (self.config['distance_search'] !== 0) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position) {
				url += '&lat_val=' + position.coords.latitude
					+ '&long_val=' + position.coords.longitude
					+ '&sort_results_by_distance=1';

				url += (self.config['distance_units'] === "km" ? '&geo_width_km=' : '&geo_width=') + self.config['distance_search'];
				self.getMeetings(url);
			}, self.errorHandler);
		}
	} else if (self.config['custom_query'] != null) {
		url += self.config['custom_query'] + '&sort_keys='  + self.config['sort_keys'];
		self.getMeetings(url);
	} else if (self.config['service_body'].length > 0) {
		for (var i = 0; i < self.config['service_body'].length; i++) {
			url += '&services[]=' + self.config['service_body'][i];
		}

		if (self.config['recurse_service_bodies']) {
			url += '&recursive=1';
		}

		url += '&sort_keys=' + self.config['sort_keys'];

		self.getMeetings(url);
	}

	self.lock = function(callback) {
		var self = this;
		var lock_id = setInterval(function() {
			if (!self.mutex) {
				clearInterval(lock_id);
				callback();
			}
		}, 100)
	};

	self.showPage = function (id) {
		jQuery(id).removeClass("hide").addClass("show");
	};

	self.showView = function (viewName) {
		if (viewName === "byday") {
			self.byDayView();
		} else if (viewName === "day" || viewName === "weekday") {
			self.dayView();
		} else if (viewName === "city") {
			self.filteredView("location_municipality");
		} else {
			self.filteredView(viewName);
		}
	};

	self.byDayView = function () {
		self.resetFilter();
		for (var a = 1; a < self.max_filters; a++) {
			if (jQuery("#e" + a).length) {
				jQuery("#e" + a).select2("val", null);
			}
		}

		self.lowlightButton(".filterButton");
		self.highlightButton("#day");
		jQuery('.bmlt-page').each(function (index) {
			self.hidePage("#" + this.id);
			self.showPage("#byday");
			self.showPage("#nav-days");
			return;
		});
	};

	self.dayView = function () {
		self.resetFilter();
		for (var a = 1; a < self.max_filters; a++) {
			if (jQuery("#e" + a).length) {
				jQuery("#e" + a).select2("val", null);
			}
		}

		self.lowlightButton(".filterButton");
		self.highlightButton("#day");
		jQuery('.bmlt-page').each(function (index) {
			self.hidePage("#" + this.id);
			self.showPage("#days");
			self.showPage("#nav-days");
			self.showPage("#tabs-content");
			return;
		});
	};

	self.filteredView = function (field) {
		self.resetFilter();
		for (var a = 1; a < self.max_filters; a++) {
			if (jQuery("#e" + a).length) {
				jQuery("#e" + a).select2("val", null);
			}
		}

		self.lowlightButton("#day");
		self.lowlightButton(".filterButton");
		self.highlightButton("#filterButton_" + field);
		jQuery('.bmlt-page').each(function (index) {
			self.hidePage("#" + this.id);
			self.showPage("#byfield_" + field);
			return;
		});
	};

	self.lowlightButton = function (id) {
		jQuery(id).removeClass("buttonHighlight").addClass("buttonLowlight");
	};

	self.highlightButton = function (id) {
		jQuery(id).removeClass("buttonLowlight").addClass("buttonHighlight");
	};

	self.hidePage = function (id) {
		jQuery(id).removeClass("show").addClass("hide");
	};

	self.filteredPage = function (id, dataType, dataValue) {
		self.resetFilter();
		self.showPage(id);
		jQuery(".bmlt-data-row").removeClass("hide");
		if (dataType !== "formats") {
			jQuery(".bmlt-data-row").not("[data-" + dataType + "='" + dataValue + "']").addClass("hide");
		} else {
			jQuery(".bmlt-data-row").not("[data-" + dataType + "*='" + dataValue + "']").addClass("hide");
		}

		jQuery(".bmlt-data-rows").each(function (index, value) {
			if (jQuery(value).find(".bmlt-data-row.hide").length === jQuery(value).find(".bmlt-data-row").length) {
				jQuery(value).find(".meeting-header").addClass("hide");
			}
		})
	};

	self.resetFilter = function () {
		jQuery(".meeting-header").removeClass("hide");
		jQuery(".bmlt-data-row").removeClass("hide");
	};

	self.renderView = function (selector, context, callback) {
		hbs_Crouton['localization'] = self.localization;
		crouton_Handlebars.registerPartial('meetings', hbs_Crouton.templates['meetings']);
		crouton_Handlebars.registerPartial('bydays', hbs_Crouton.templates['byday']);
		crouton_Handlebars.registerPartial('weekdays', hbs_Crouton.templates['weekdays']);
		crouton_Handlebars.registerPartial('header', hbs_Crouton.templates['header']);
		crouton_Handlebars.registerPartial('byfields', hbs_Crouton.templates['byfield']);
		var template = hbs_Crouton.templates['master'];
		jQuery(selector).append(template(context));
		callback();
	};

	self.getFormats = function (callback) {
		var getAllIds = arrayColumn(self.meetingData, 'format_shared_id_list');
		var joinIds = getAllIds.join(',');
		var idsArray = joinIds.split(',');
		var uniqueIds = arrayUnique(idsArray);
		jQuery.getJSON(self.config['root_server'] + '/client_interface/jsonp/?switcher=GetFormats&callback=?', function (data) {
			var formats = [];
			for (var i = 0; i < data.length; i++) {
				var format = data[i];
				if (inArray(format['id'], uniqueIds)) {
					formats.push(format);
				}
			}

			callback(formats.sortByKey('name_string'));
		});
	};

	self.getServiceBodies = function (callback) {
		jQuery.getJSON(this.config['root_server'] + '/client_interface/jsonp/?switcher=GetServiceBodies&callback=?', callback);
	};

	self.showLocation = function(position) {
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
		var distanceUnit;
		var distanceCalculation;

		if (self.config['distance_units'] === "km") {
			distanceUnit = "km";
			distanceCalculation = "K";
		} else if (self.config['distance_units'] === "nm") {
			distanceUnit = "nm";
			distanceCalculation = "N";
		} else {
			distanceUnit = "mi";
			distanceCalculation = "M";
		}

		jQuery( ".geo" ).each(function() {
			var target = jQuery( this ).html();
			var arr = target.split(',');
			var distance_result = self.distance(latitude, longitude, arr[0], arr[1], distanceCalculation);
			jQuery( this ).removeClass("hide").addClass("show").html(distance_result.toFixed(1) + ' ' + distanceUnit);
		});
	};

	self.errorHandler = function(msg) {
		jQuery('.geo').removeClass("hide").addClass("show").html('');
	};

	self.distance = function(lat1, lon1, lat2, lon2, unit) {
		if ((lat1 === lat2) && (lon1 === lon2)) {
			return 0;
		} else {
			var radlat1 = Math.PI * lat1/180;
			var radlat2 = Math.PI * lat2/180;
			var theta = lon1-lon2;
			var radtheta = Math.PI * theta/180;
			var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
			if (dist > 1) {
				dist = 1;
			}
			dist = Math.acos(dist);
			dist = dist * 180/Math.PI;
			dist = dist * 60 * 1.1515;
			if (unit === "K") {
				return dist * 1.609344;
			} else if (unit === "N") {
				return dist * 0.8684;
			} else {
				return dist;
			}
		}
	};

	self.enrichMeetings = function (meetingData, filter) {
		var meetings = [];

		for (var m = 0; m < meetingData.length; m++) {
			meetingData[m]['formatted_comments'] = meetingData[m]['comments'];
			var duration = meetingData[m]['duration_time'].split(":");
			meetingData[m]['start_time_raw'] = this.getNextInstanceOfDay(meetingData[m]['weekday_tinyint'] - 1, meetingData[m]['start_time']);
			meetingData[m]['start_time_formatted'] = meetingData[m]['start_time_raw'].format(self.config['time_format']);
			meetingData[m]['end_time_formatted'] = this.getNextInstanceOfDay(meetingData[m]['weekday_tinyint'] - 1, meetingData[m]['start_time'])
				.add(duration[0], 'hours')
				.add(duration[1], 'minutes')
				.format(self.config['time_format']);
			meetingData[m]['day_of_the_week'] = meetingData[m]['start_time_raw'].get('day') + 1;
			meetingData[m]['formatted_day'] = self.localization.getDayOfTheWeekWord(meetingData[m]['start_time_raw'].get('day') + 1);
			meetingData[m]['is_virtual'] = meetingData[m]['root_server_uri'].indexOf('virtual') >= 0;

			var formats = meetingData[m]['formats'].split(",");
			var formats_expanded = [];
			for (var f = 0; f < formats.length; f++) {
				for (var g = 0; g < self.formatsData.length; g++) {
					if (formats[f] === self.formatsData[g]['key_string']) {
						formats_expanded.push(
							{
								"key": formats[f],
								"name": self.formatsData[g]['name_string'],
								"description": self.formatsData[g]['description_string']
							}
						)
					}
				}
			}

			meetingData[m]['formats_expanded'] = formats_expanded;
			var addressParts = [
				meetingData[m]['location_street'],
				meetingData[m]['location_municipality'].trim(),
				meetingData[m]['location_province'].trim(),
				meetingData[m]['location_postal_code_1'].trim()
			];
			addressParts.clean();
			meetingData[m]['formatted_address'] = addressParts.join(", ");
			meetingData[m]['formatted_location_info'] =
				meetingData[m]['location_info'] != null
					? meetingData[m]['location_info'].replace('/(http|https):\/\/([A-Za-z0-9\._\-\/\?=&;%,]+)/i', '<a style="text-decoration: underline;" href="$1://$2" target="_blank">$1://$2</a>')
					: "";
			meetingData[m]['map_word'] = self.localization.getWord('map').toUpperCase();
			meetings.push(meetingData[m])
		}

		return meetings;
	};

	self.showMessage = function(message) {
		jQuery("#" + self.config['placeholder_id']).html("crouton: " + message);
		jQuery("#" + self.config['placeholder_id']).removeClass("hide");
	};

	self.isEmpty = function(obj) {
		for (var key in obj) {
			if(obj.hasOwnProperty(key))
				return false;
		}
		return true;
	}
}

Crouton.prototype.setConfig = function(config) {
	var self = this;
	for (var propertyName in config) {
		if (propertyName.indexOf("int_") === -1) {
			if (config[propertyName] === "1" || config[propertyName] === 1) {
				self.config[propertyName] = true;
			} else if (config[propertyName] === "0" || config[propertyName] === 0) {
				self.config[propertyName] = false;
			} else {
				self.config[propertyName] = config[propertyName];
			}
		} else {
			self.config[propertyName] = parseInt(config[propertyName] || 0);
		}
	}

	self.config["distance_search"] = parseInt(self.config["distance_search"] || 0);
	self.config["day_sequence"] = [];
	self.config.day_sequence.push(self.config.int_start_day_id);
	for (var i = 1; i < 7; i++) {
		var next_day = self.config.day_sequence[i - 1] + 1;
		if (next_day > 7) {
			self.config.day_sequence.push(next_day - 7);
		} else {
			self.config.day_sequence.push(next_day);
		}
	}

	if (self.config["view_by"] === "weekday") {
		self.config["include_weekday_button"] = true;
	}

	if (!self.config["has_tabs"]) {
		self.config["view_by"] = "byday";
	}
};

Crouton.prototype.reset = function() {
	var self = this;
	jQuery("#custom-css").remove();
	jQuery("#" + self.config["placeholder_id"]).html("");
};

Crouton.prototype.meetingCount = function(callback) {
	var self = this;
	self.lock(function() {
		callback(self.meetingData.length);
	});
};

Crouton.prototype.groupCount = function(callback) {
	var self = this;
	self.lock(function() {
		var groups = [];
		for (var i = 0; i < self.meetingData.length; i++) {
			groups.push(self.meetingData[i]['worldid_mixed'] !== "" ? self.meetingData[i]['worldid_mixed'] : self.meetingData[i]['meeting_name']);
		}
		callback(arrayUnique(groups).length);
	});
};

Crouton.prototype.render = function(callback) {
	var self = this;
	self.lock(function() {
		jQuery("body").append("<div id='custom-css'><style type='text/css'>" + self.config['custom_css'] + "</style></div>");
		if (self.isEmpty(self.meetingData)) {
			self.showMessage("No meetings found for parameters specified.");
			return;
		}
		self.uniqueData = {
			'groups': getUniqueValuesOfKey(self.meetingData, 'meeting_name').sort(),
			'cities': getUniqueValuesOfKey(self.meetingData, 'location_municipality').sort(),
			'locations': getUniqueValuesOfKey(self.meetingData, 'location_text').sort(),
			'sub_provinces': getUniqueValuesOfKey(self.meetingData, 'location_sub_province').sort(),
			'states': getUniqueValuesOfKey(self.meetingData, 'location_province').sort(),
			'zips': getUniqueValuesOfKey(self.meetingData, 'location_postal_code_1').sort(),
			'unique_service_bodies_ids': getUniqueValuesOfKey(self.meetingData, 'service_body_bigint').sort()
		};
		if (callback !== undefined) callback();
		self.getServiceBodies(function (service_bodies) {
			var active_service_bodies = [];
			for (var i = 0; i < service_bodies.length; i++) {
				for (var j = 0; j < self.uniqueData['unique_service_bodies_ids'].length; j++) {
					if (service_bodies[i]["id"] === self.uniqueData['unique_service_bodies_ids'][j]) {
						active_service_bodies.push(service_bodies[i]);
					}
				}
			}

			self.uniqueData['areas'] = active_service_bodies.sortByKey('name');
			self.getFormats(function (data) {
				self.formatsData = data;
				self.uniqueData['formats'] = data;
				var weekdaysData = [];
				var enrichedMeetingData = self.enrichMeetings(self.meetingData);

				enrichedMeetingData.sort(function (a, b) {
					return a['start_time_raw'] - b['start_time_raw'];
				});

				var day_counter = 0;
				var byDayData = [];
				var buttonFiltersData = {};
				while (day_counter < 7) {
					var day = self.config.day_sequence[day_counter];
					var daysOfTheWeekMeetings = enrichedMeetingData.filterByObjectKeyValue('day_of_the_week', day);
					weekdaysData.push({
						"day": day,
						"meetings": daysOfTheWeekMeetings
					});

					byDayData.push({
						"day": self.localization.getDayOfTheWeekWord(day),
						"meetings": daysOfTheWeekMeetings
					});

					for (var f = 0; f < self.config.button_filters.length; f++) {
						var groupByName = self.config.button_filters[f]['field'];
						var groupByData = getUniqueValuesOfKey(daysOfTheWeekMeetings, groupByName).sort();
						for (var i = 0; i < groupByData.length; i++) {
							var groupByMeetings = daysOfTheWeekMeetings.filterByObjectKeyValue(groupByName, groupByData[i]);
							if (buttonFiltersData.hasOwnProperty(groupByName) && buttonFiltersData[groupByName].hasOwnProperty(groupByData[i])) {
								buttonFiltersData[groupByName][groupByData[i]] = buttonFiltersData[groupByName][groupByData[i]].concat(groupByMeetings);
							} else if (buttonFiltersData.hasOwnProperty(groupByName)) {
								buttonFiltersData[groupByName][groupByData[i]] = groupByMeetings;
							} else {
								buttonFiltersData[groupByName] = {};
								buttonFiltersData[groupByName][groupByData[i]] = groupByMeetings;
							}

						}
					}

					day_counter++;
				}

				self.renderView("#" + self.config['placeholder_id'], {
					"config": self.config,
					"meetings": {
						"weekdays": weekdaysData,
						"buttonFilters": buttonFiltersData,
						"bydays": byDayData
					},
					"uniqueData": self.uniqueData
				}, function () {
					jQuery("#" + self.config['placeholder_id']).addClass("bootstrap-bmlt");
					jQuery(".crouton-select").select2({
						dropdownAutoWidth: true,
						allowClear: false,
						width: "resolve",
						minimumResultsForSearch: 1,
						dropdownCssClass: 'bmlt-drop'
					});

					jQuery('[data-toggle="popover"]').popover();
					jQuery('html').on('click', function (e) {
						if (jQuery(e.target).data('toggle') !== 'popover') {
							jQuery('[data-toggle="popover"]').popover('hide');
						}
					});

					for (var a = 1; a < self.max_filters; a++) {
						jQuery("#e" + a).on('select2:select', function (e) {
							for (var j = 1; j < self.max_filters; j++) {
								if (this.id !== "e" + j) {
									if (jQuery("#e" + j).length) {
										jQuery("#e" + j).select2("val", null);
									}
								}
							}

							var val = jQuery("#" + this.id).val();
							jQuery('.bmlt-page').each(function (index) {
								self.hidePage("#" + this.id);
								self.lowlightButton(".filterButton");
								self.lowlightButton("#day");
								self.filteredPage("#byday", e.target.getAttribute("data-pointer").toLowerCase(), val.replace("a-", ""));
								return;
							});
						});
					}

					jQuery("#day").on('click', function () {
						self.showView(self.config['view_by'] === 'byday' ? 'byday' : 'day');
					});
					jQuery(".filterButton").on('click', function (e) {
						self.filteredView(e.target.attributes['data-field'].value);
					});

					jQuery('.custom-ul').on('click', 'a', function (event) {
						jQuery('.bmlt-page').each(function (index) {
							self.hidePage("#" + this.id);
							self.showPage("#" + event.target.id);
							return;
						});
					});

					if (self.config['has_tabs']) {
						jQuery('.nav-tabs a').on('click', function (e) {
							e.preventDefault();
							jQuery(this).tab('show');
						});

						var d = new Date();
						var n = d.getDay();
						n++;
						jQuery('.nav-tabs a[href="#tab' + n + '"]').tab('show');
						jQuery('#tab' + n).show();
					}

					self.showPage(".bmlt-header");
					self.showPage(".bmlt-tabs");
					self.showView(self.config['view_by']);

					if (self.config['show_distance']) {
						if (navigator.geolocation) {
							navigator.geolocation.getCurrentPosition(self.showLocation, self.errorHandler);
						} else {
							$('.geo').removeClass("hide").addClass("show").html('<p>Geolocation is not supported by your browser</p>');
						}
					}

					if (self.config['show_map']) {
						var tag = document.createElement('script');
						tag.src = "https://maps.googleapis.com/maps/api/js?key=" + self.config['google_api_key'] + "&callback=crouton.initMap";
						tag.defer = true;
						tag.async = true;
						var firstScriptTag = document.getElementsByTagName('script')[0];
						firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
					}
				});
			})
		});
	});
};

Crouton.prototype.initMap = function() {
	var self = this;
	var map = new google.maps.Map(document.getElementById('bmlt-map'), {
		zoom: 3
	});

	jQuery("#bmlt-map").removeClass("hide");
	var bounds = new google.maps.LatLngBounds();
	// We go through all the results, and get the "spread" from them.
	for (var c = 0; c < self.meetingData.length; c++) {
		var lat = self.meetingData[c].latitude;
		var lng = self.meetingData[c].longitude;
		// We will set our minimum and maximum bounds.
		bounds.extend(new google.maps.LatLng(lat, lng));
	}
	// We now have the full rectangle of our meeting search results. Scale the map to fit them.
	map.fitBounds(bounds);

	var clusterMarker = [];

	var infoWindow = new google.maps.InfoWindow();

	// Create OverlappingMarkerSpiderfier instance
	var oms = new OverlappingMarkerSpiderfier(map, {markersWontMove: true, markersWontHide: true});

	oms.addListener('format', function (marker, status) {
		var iconURL = status == OverlappingMarkerSpiderfier.markerStatus.SPIDERFIED ? self.config['template_path'] + '/NAMarkerR.png' :
			status == OverlappingMarkerSpiderfier.markerStatus.SPIDERFIABLE ? self.config['template_path'] + '/NAMarkerB.png' :
				status == OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIED ? self.config['template_path'] + '/NAMarkerB.png' :
					status == OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIABLE ? self.config['template_path'] + '/NAMarkerR.png' :
						null;
		var iconSize = new google.maps.Size(22, 32);
		marker.setIcon({
			url: iconURL,
			size: iconSize,
			scaledSize: iconSize
		});
	});


	// This is necessary to make the Spiderfy work
	oms.addListener('click', function (marker) {
		infoWindow.setContent(marker.desc);
		infoWindow.open(map, marker);
	});
	// Add some markers to the map.
	// Note: The code uses the JavaScript Array.prototype.map() method to
	// create an array of markers based on a given "locations" array.
	// The map() method here has nothing to do with the Google Maps API.
	self.meetingData.map(function (location, i) {
		var weekdays = [null, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
		var marker_html = '<dl><dt><strong>';
		marker_html += location.meeting_name;
		marker_html += '</strong></dt>';
		marker_html += '<dd><em>';
		marker_html += weekdays[parseInt(location.weekday_tinyint)];
		var time = location.start_time.toString().split(':');
		var hour = parseInt(time[0]);
		var minute = parseInt(time[1]);
		var pm = 'AM';
		if (hour >= 12) {
			pm = 'PM';
			if (hour > 12) {
				hour -= 12;
			}
		}
		hour = hour.toString();
		minute = (minute > 9) ? minute.toString() : ('0' + minute.toString());
		marker_html += ' ' + hour + ':' + minute + ' ' + pm;
		marker_html += '</em><br>';
		marker_html += location.location_text;
		marker_html += '<br>';

		if (typeof location.location_street !== "undefined") {
			marker_html += location.location_street + '<br>';
		}
		if (typeof location.location_municipality !== "undefined") {
			marker_html += location.location_municipality + ' ';
		}
		if (typeof location.location_province !== "undefined") {
			marker_html += location.location_province + ' ';
		}
		if (typeof location.location_postal_code_1 !== "undefined") {
			marker_html += location.location_postal_code_1;
		}

		marker_html += '<br>';
		var url = 'https://maps.google.com/maps?q=' + location.latitude + ',' + location.longitude;
		marker_html += '<a href="' + url + '">';
		marker_html += 'Map to Meeting';
		marker_html += '</a>';
		marker_html += '</dd></dl>';

		var latLng = {"lat": parseFloat(location.latitude), "lng": parseFloat(location.longitude)};

		var marker = new google.maps.Marker({
			position: latLng,
			map: map
		});

		// needed to make Spiderfy work
		oms.addMarker(marker);

		// needed to cluster marker
		clusterMarker.push(marker);
		google.maps.event.addListener(marker, 'click', function (evt) {
			infoWindow.setContent(marker_html);
			infoWindow.open(map, marker);
		});
		return marker;
	});

	// Add a marker clusterer to manage the markers.
	new MarkerClusterer(map, clusterMarker, {
		imagePath: self.config['template_path'] + '/m',
		maxZoom: self.config['map_max_zoom']
	});
};

crouton_Handlebars.registerHelper('getDayOfTheWeek', function(day_id) {
	return hbs_Crouton.localization.getDayOfTheWeekWord(day_id);
});

crouton_Handlebars.registerHelper('getWord', function(word) {
	return hbs_Crouton.localization.getWord(word);
});

crouton_Handlebars.registerHelper('formatDataPointer', function(str) {
	return convertToPunyCode(str)
});

crouton_Handlebars.registerHelper('formatDataPointerFormats', function(formatsExpanded) {
	var finalFormats = [];
	for (var i = 0; i < formatsExpanded.length; i++) {
		finalFormats.push(convertToPunyCode(formatsExpanded[i]['name']));
	}
	return finalFormats.join(" ");
});

crouton_Handlebars.registerHelper('formatLink', function(text) {
	if (text.indexOf('tel:') === 0 || text.indexOf('http') === 0) {
		return new crouton_Handlebars.SafeString("<a href='" + text + "' target='_blank'>" + text + "</a>");
	} else {
		return text;
	}
});

crouton_Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
	return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

crouton_Handlebars.registerHelper('times', function(n, block) {
	var accum = '';
	for(var i = 1; i <= n; ++i)
		accum += block.fn(i);
	return accum;
});

function convertToPunyCode(str) {
	return punycode.toASCII(str.toLowerCase()).replace(/\W|_/g, "-")
}

function arrayColumn(input, columnKey) {
	var newArr = [];
	for (var i = 0; i < input.length; i++) {
		newArr.push(input[i][columnKey]);
	}

	return newArr;
}

function getUniqueValuesOfKey(array, key){
	return array.reduce(function(carry, item){
		if(item[key] && !~carry.indexOf(item[key])) carry.push(item[key]);
		return carry;
	}, []);
}

Crouton.prototype.getNextInstanceOfDay = function(day_id, time_stamp) {
	if (this.config['base_tz'] != null) {
		moment.tz.setDefault(this.config['base_tz']);
	}

	var today = moment().isoWeekday();
	var time = moment(time_stamp, "HH:mm");
	var date_stamp = today <= day_id ? moment().isoWeekday(day_id) : moment().add(1, 'weeks').isoWeekday(day_id);

	if (this.config['auto_tz_adjust']) {
		var guessed_time_zone_date_stamp = date_stamp.set({hour: time.get('hour'), minute: time.get('minute')}).tz(moment.tz.guess());
		return moment() > guessed_time_zone_date_stamp
			&& today !== guessed_time_zone_date_stamp.isoWeekday() ? guessed_time_zone_date_stamp.add(1, 'weeks') : guessed_time_zone_date_stamp;
	} else {
		return date_stamp.set({hour: time.get('hour'), minute: time.get('minute')});
	}
};

function arrayUnique(a, b, c) {
	b = a.length;
	while (c = --b)
		while (c--) a[b] !== a[c] || a.splice(c, 1);
	return a
}

function inArray(needle, haystack) {
	return haystack.indexOf(needle) !== -1;
}

Array.prototype.filterByObjectKeyValue = function(key, value) {
	var ret = [];
	for (var i = 0; i < this.length; i++) {
		if (this[i][key] === value) {
			ret.push(this[i])
		}
	}

	return ret;
};

Array.prototype.getArrayItemByObjectKeyValue = function(key, value) {
	for (var i = 0; i < this.length; i++) {
		if (this[i][key] === value) {
			return this[i];
		}
	}
};

Array.prototype.clean = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === "") {
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};

Array.prototype.exclude = function(excludedValues, mappedField) {
	for (var i = this.length; i--;) {
		for (var j = 0; j < excludedValues.length; j++) {
			if (excludedValues[j] === this[i][mappedField]) {
				this.splice(i, 1);
			}
		}
	}
	return this;
};

Array.prototype.sortByKey = function (key) {
	this.sort(function (a, b) {
		if (a[key] < b[key])
			return -1;
		if (a[key] > b[key])
			return 1;
		return 0;
	});
	return this;
};
