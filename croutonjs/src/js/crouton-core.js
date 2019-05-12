function Crouton(config) {
	var self = this;
	self.serviceBodyData = [];
	self.config = {
		template_path: "templates/",
		placeholder_id: "#bmlt-tabs",
		map_max_zoom: 15,
		time_format: "h:mm a",
		language: "en-US",
		has_tabs: "1",
		header: "1",
		include_city_button: "1",
		include_weekday_button: "1",
		has_meetings: "1",
		show_map: "0",
		has_cities: "1",
		has_formats: "1",
		has_groups: "1",
		has_locations: "1",
		has_zip_codes: "1",
		show_distance: "0",
		recurse_service_bodies: "0",
		service_body: [],
	};

	for (var propertyName in config) {
		self.config[propertyName] = config[propertyName];
	}

	if (self.config["has_meetings"] === "0") {
		self.config["has_tabs"] = "0";
	}

	if (self.config["view_by"] === "city") {
		self.config["include_city_button"] = "1";
	}

	if (self.config["view_by"] === "weekday") {
		self.config["include_weekday_button"] = "1";
	}

	if (self.config["has_tabs"] === "0") {
		self.config["view_by"] = "byday";
	}

	self.localization = new CroutonLocalization(self.config['language']);
	self.dropdownConfiguration = [
		{
			placeholder: "Cities",
			dropdownAutoWidth: true,
			dropdownMaxWidth: '100px',
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass: 'bmlt-drop'
		},
		{
			placeholder: "Groups",
			dropdownAutoWidth: true,
			dropdownMaxWidth: '100px',
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass: 'bmlt-drop'
		},
		{
			placeholder: "Locations",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass: 'bmlt-drop'
		},
		{
			placeholder: "Zips",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass: 'bmlt-drop-zip'
		},
		{
			placeholder: "Formats",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass: 'bmlt-drop-format'
		},
		{
			placeholder: "Counties",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass: 'bmlt-drop'
		},
		{
			placeholder: "Areas",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass: 'bmlt-drop'
		},
		{
			placeholder: "States",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass: 'bmlt-drop'
		}
	];

	self.showPage = function (id) {
		jQuery(id).removeClass("hide").addClass("show");
	};

	self.showView = function (viewName) {
		if (viewName === "city") {
			self.cityView();
		} else if (viewName === "byday") {
			self.byDayView();
		} else {
			self.dayView();
		}
	};

	self.byDayView = function () {
		self.resetFilter();
		for (var a = 2; a <= self.dropdownConfiguration.length + 1; a++) {
			if (jQuery("#e" + a).length) {
				jQuery("#e" + a).select2("val", null);
			}
		}
		self.highlightButton("#day");
		self.lowlightButton("#city");
		jQuery('.bmlt-page').each(function (index) {
			self.hidePage("#" + this.id);
			self.showPage("#byday");
			self.showPage("#nav-days");
			return;
		});
	};

	self.dayView = function () {
		self.resetFilter();
		for (var a = 2; a <= self.dropdownConfiguration.length + 1; a++) {
			if (jQuery("#e" + a).length) {
				jQuery("#e" + a).select2("val", null);
			}
		}
		self.highlightButton("#day");
		self.lowlightButton("#city");
		jQuery('.bmlt-page').each(function (index) {
			self.hidePage("#" + this.id);
			self.showPage("#days");
			self.showPage("#nav-days");
			self.showPage("#tabs-content");
			return;
		});
	};

	self.cityView = function () {
		self.resetFilter();
		for (var a = 2; a <= self.dropdownConfiguration.length + 1; a++) {
			if (jQuery("#e" + a).length) {
				jQuery("#e" + a).select2("val", null);
			}
		}

		self.highlightButton("#city");
		self.lowlightButton("#day");
		jQuery('.bmlt-page').each(function (index) {
			self.hidePage("#" + this.id);
			self.showPage("#cities");
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
		jQuery.get(self.config['template_path'] + 'template.html', function (data) {
			if (jQuery("#crouton-template").length == 0) {
				jQuery("body").append("<div id='crouton-template'></div>");
				jQuery('#crouton-template').html(data);
				Handlebars.registerPartial('meetings', jQuery('#crouton-template > #meetings-template').html());
				Handlebars.registerPartial('bydays', jQuery('#crouton-template > #byday-template').html());
				Handlebars.registerPartial('weekdays', jQuery('#crouton-template > #weekdays-template').html());
				Handlebars.registerPartial('cities', jQuery('#crouton-template > #cities-template').html());
				Handlebars.registerPartial('header', jQuery('#crouton-template > #header-template').html());
			}

			var template = Handlebars.compile(jQuery("#crouton-template > #master-template").html());
			jQuery(selector).append(template(context));
			callback();
		});
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

	self.getMeetings = function (callback) {
		if (self.meetingData == null) {
			var url;
			if (self.config['custom_query_postfix'] != null) {
				url = '/client_interface/jsonp/?switcher=GetSearchResults' + self.config['custom_query_postfix'] + '&sort_key=time';
			} else {
				url = '/client_interface/jsonp/?switcher=GetSearchResults&sort_key=time' +
					(self.config['recurse_service_bodies'] === "1" ? "&recursive=1" : "")
			}

			if (self.config['service_body'].length > 0) {
				for (var i = 0; i < self.config['service_body'].length; i++) {
					url += "&services[]=" + self.config['service_body'][i];
				}
			}

			//if (self.config['format_key'] !== '') url += '&formats[]=' . format_id";
			jQuery.getJSON(this.config['root_server'] + url + '&callback=?', function (data) {
				self.meetingData = data;
				callback(data);
			});
		} else {
			callback(self.meetingData);
		}
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
		}

		else {
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
		meetingData.exclude(self.config['exclude_zip_codes'], "location_postal_code_1");
		for (var m = 0; m < meetingData.length; m++) {
			if (filter(meetingData[m])) {
				meetingData[m]['formatted_day'] = self.localization.getDayOfTheWeekWord(meetingData[m]['weekday_tinyint']);
				meetingData[m]['formatted_comments'] =
					meetingData[m]['comments'] != null
						? meetingData[m]['comments'].replace('/(http|https):\/\/([A-Za-z0-9\._\-\/\?=&;%,]+)/i', '<a style="text-decoration: underline;" href="$1://$2" target="_blank">$1://$2</a>')
						: "";
				var duration = meetingData[m]['duration_time'].split(":");
				meetingData[m]['start_time_formatted'] =
					moment(meetingData[m]['start_time'], "HH:mm:ss")
						.format(self.config['time_format']);
				meetingData[m]['end_time_formatted']
					= moment(meetingData[m]['start_time'], "HH:mm:ss")
					.add(duration[0], 'hours')
					.add(duration[1], 'minutes')
					.format(self.config['time_format']);

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
		}

		return meetings;
	};

	self.showMessage = function(message) {
		jQuery(self.config['placeholder_id']).html("crouton: " + message);
		jQuery(self.config['placeholder_id']).removeClass("hide");
	};

	self.isEmpty = function(obj) {
		for (var key in obj) {
			if(obj.hasOwnProperty(key))
				return false;
		}
		return true;
	}
}

Crouton.prototype.reset = function() {
	var self = this;
	jQuery("#custom-css").remove();
	jQuery(self.config["placeholder_id"]).html("");
};

Crouton.prototype.meetingCount = function(callback) {
	var self = this;
	self.getMeetings(function(data) {
		callback(data.length);
	});
};

Crouton.prototype.groupCount = function(callback) {
	var self = this;
	var groups = [];
	self.getMeetings(function(data) {
		for (var i = 0; i < data.length; i++) {
			groups.push(data[i]['worldid_mixed'] !== "" ? data[i]['worldid_mixed'] : data[i]['meeting_name']);
		}
		callback(arrayUnique(groups).length);
	});
};

Crouton.prototype.render = function() {
	var self = this;
	jQuery("body").append("<div id='custom-css'><style type='text/css'>" + self.config['custom_css'] + "</style></div>");
	self.getMeetings(function (data) {
		if (self.isEmpty(data)) {
			self.showMessage("No meetings found for parameters specified.");
			return;
		}
		self.uniqueData = {
			'groups': getUniqueValuesOfKey(data, 'meeting_name').sort(),
			'cities': getUniqueValuesOfKey(data, 'location_municipality').sort(),
			'areas': getUniqueValuesOfKey(data, 'meeting_name').sort(),
			'locations': getUniqueValuesOfKey(data, 'location_text').sort(),
			'sub_provinces': getUniqueValuesOfKey(data, 'location_sub_province').sort(),
			'states': getUniqueValuesOfKey(data, 'location_province').sort(),
			'zips': getUniqueValuesOfKey(data, 'location_postal_code_1').sort(),
		};
		self.getServiceBodies(function (data) {
			self.serviceBodyData = data;
			self.getFormats(function (data) {
				self.formatsData = data;
				self.uniqueData['formats'] = data;

				var weekdaysData = [];
				for (var day = 1; day <= 7; day++) {
					weekdaysData.push({
						"day": day,
						"meetings": self.enrichMeetings(self.meetingData, function (item) {
							return item['weekday_tinyint'] === day.toString();
						})
					});
				}

				var citiesData = [];
				var cities = getUniqueValuesOfKey(self.meetingData, 'location_municipality').sort();
				for (var i = 0; i < cities.length; i++) {
					citiesData.push({
						"city": cities[i],
						"meetings": self.enrichMeetings(self.meetingData, function (item) {
							return item['location_municipality'] === cities[i];
						})
					});
				}

				var byDayData = [];
				for (var day = 1; day <= 7; day++) {
					byDayData.push({
						"day": self.localization.getDayOfTheWeekWord(day),
						"meetings": self.enrichMeetings(self.meetingData, function (item) {
							return item['weekday_tinyint'] === day.toString();
						})
					});
				}

				if (self.config['show_map'] === "1") {
					var tag = document.createElement('script');
					tag.src = "https://maps.googleapis.com/maps/api/js?key=" + self.config['google_api_key'] + "&callback=crouton.initMap";
					tag.defer = true;
					tag.async = true;
					var firstScriptTag = document.getElementsByTagName('script')[0];
					firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
				}

				self.renderView(self.config['placeholder_id'], {
					"config": self.config,
					"meetings": {
						"weekdays": weekdaysData,
						"cities": citiesData,
						"bydays": byDayData
					},
					"uniqueData": self.uniqueData,
					"words": self.localization.words
				}, function () {
					jQuery(self.config['placeholder_id']).addClass("bootstrap-bmlt");
					for (var a = 2; a <= self.dropdownConfiguration.length + 1; a++) {
						jQuery("#e" + a).select2(self.dropdownConfiguration[a - 2]);
					}
					jQuery('[data-toggle="popover"]').popover();
					jQuery('html').on('click', function (e) {
						if (jQuery(e.target).data('toggle') !== 'popover') {
							jQuery('[data-toggle="popover"]').popover('hide');
						}
					});

					//TODO: this was removed
					/*if (jQuery.browser.mobile) {
						jQuery("#e2").prop("readonly", true);
						jQuery(".select2-search").css({"display": "none"});
						jQuery(".select2-search").remove();
						for (var j = 2; j <= this.dropdownConfiguration.length + 1; j++) {
							jQuery("#s2id_e" + j).css({"width": "99%", "margin-bottom": "3px"});
						}
						jQuery(".bmlt-tabs .bmlt-button-weekdays").css({"width": "98%", "margin-bottom": "3px"});
						jQuery(".bmlt-tabs .bmlt-button-cities").css({"width": "98%", "margin-bottom": "3px"});
					}*/

					for (var a = 2; a <= self.dropdownConfiguration.length + 1; a++) {
						jQuery("#e" + a).on('select2:select', function (e) {
							for (var j = 2; j <= self.dropdownConfiguration.length + 1; j++) {
								if (this.id !== "e" + j) {
									if (jQuery("#e" + j).length) {
										jQuery("#e" + j).select2("val", null);
									}
								}
							}

							//TODO: this was removed
							/*if (jQuery.browser.mobile) {
								jQuery("#" + this.id).prop("readonly", true);
								jQuery(".select2-search").css({"display": "none"});
								jQuery(".select2-search").remove();
							}*/

							var val = jQuery("#" + this.id).val();
							jQuery('.bmlt-page').each(function (index) {
								self.hidePage("#" + this.id);
								self.lowlightButton("#city");
								self.lowlightButton("#day");
								self.filteredPage("#byday", e.target.getAttribute("data-pointer").toLowerCase(), val.replace("a-", ""));
								return;
							});
						});
					}

					jQuery("#day").on('click', function () {
						self.showView(self.config['view_by'] === 'byday' ? 'byday' : 'day');
					});
					jQuery("#city").on('click', function () {
						self.showView('city');
					});

					jQuery('.custom-ul').on('click', 'a', function (event) {
						jQuery('.bmlt-page').each(function (index) {
							self.hidePage("#" + this.id);
							self.showPage("#" + event.target.id);
							return;
						});
					});

					if (self.config['has_tabs'] !== "0") {
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

					if (self.config['show_distance'] === "1") {
						if (navigator.geolocation) {
							navigator.geolocation.getCurrentPosition(self.showLocation, self.errorHandler);
						} else {
							$('.geo').removeClass("hide").addClass("show").html('<p>Geolocation is not supported by your browser</p>');
						}
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
	new MarkerClusterer(map, clusterMarker, {imagePath: self.config['template_path'] + '/m', maxZoom: self.config['map_max_zoom']});
};

Handlebars.registerHelper('formatDataPointer', function(str) {
	return convertToPunyCode(str)
});

Handlebars.registerHelper('formatDataPointerFormats', function(formatsExpanded) {
	var finalFormats = [];
	for (var i = 0; i < formatsExpanded.length; i++) {
		finalFormats.push(convertToPunyCode(formatsExpanded[i]['name']));
	}
	return finalFormats.join(" ");
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
	return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('times', function(n, block) {
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

function arrayUnique(a, b, c) {
	b = a.length;
	while (c = --b)
		while (c--) a[b] !== a[c] || a.splice(c, 1);
	return a
}

function inArray(needle, haystack) {
	return haystack.indexOf(needle) !== -1;
}

Array.prototype.clean = function() {
	for (var i = 0; i < this.length; i++) {
		if (this[i] === "") {
			this.splice(i, 1);
			i--;
		}
	}
	return this;
};

Array.prototype.exclude = function(csv, mappedField) {
	if (csv == null) return;
	var excludedValues = csv.split(",");
	for (var i = 0; i < this.length; i++) {
		for (var j = 0; j < excludedValues.length; j++) {
			if (i < this.length && excludedValues[j] === this[i][mappedField]) {
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
