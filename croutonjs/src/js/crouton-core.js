var crouton_Handlebars = Handlebars.noConflict();

function Crouton(config) {
	var self = this;
	self.mutex = false;
	self.map = null;
	self.geocoder = null;
	self.map_objects = [];
	self.map_clusters = [];
	self.oms = null;
	self.markerClusterer = null;
	self.masterFormatCodes = [];
	self.max_filters = 10;  // TODO: needs to be refactored so that dropdowns are treated dynamically
	self.config = {
		on_complete: null,            // Javascript function to callback when data querying is completed.
		root_server: null,			  // The root server to use.
		placeholder_id: "bmlt-tabs",  // The DOM id that will be used for rendering
		map_max_zoom: 15,		      // Maximum zoom for the display map
		time_format: "h:mm a",        // The format for time
		language: "en-US",            // Default language translation, available translations listed here: https://github.com/bmlt-enabled/crouton/blob/master/croutonjs/src/js/crouton-localization.js
		has_tabs: true,               // Shows the day tabs
		filter_tabs: false,   		  // Whether to show weekday tabs on filtering.
		header: true,                 // Shows the dropdowns and buttons
		include_weekday_button: true, // Shows the weekday button
		int_include_unpublished: 0,	  // Includes unpublished meeting
		button_filters: [
			{'title': 'City', 'field': 'location_municipality'},
		],
		default_filter_dropdown: "",  // Sets the default format for the dropdowns, the names will match the `has_` fields dropdowns without `has_.  Example: `formats=closed`.
		show_map: false,              // Shows the map with pins
		map_search: null, 			  // Start search with map click (ex {"latitude":x,"longitude":y,"width":-10,"zoom":10}
		has_cities: true,             // Shows the cities dropdown
		has_formats: true,            // Shows the formats dropdown
		has_groups: true,             // Shows the groups dropdown
		has_locations: true,          // Shows the locations dropdown
		has_zip_codes: true,          // Shows the zip codes dropdown
		has_areas: false,             // Shows the areas dropdown
		has_states: false,            // Shows the states dropdown
		has_sub_province: false,      // Shows the sub province dropdown (counties)
		has_neighborhoods: false,     // Shows the neighborhood dropdown
		has_languages: false,		  // Shows the language dropdown
		has_venues: true,		      // Shows the venue types dropdown
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
		view_by: "weekday",           // TODO: replace with using the first choice in button_filters as the default view_by.
		show_qrcode: false,  		  // Determines whether or not to show the QR code for virtual / phone meetings if they exist.
		theme: "jack",                // Allows for setting pre-packaged themes.  Choices are listed here:  https://github.com/bmlt-enabled/crouton/blob/master/croutonjs/dist/templates/themes
		meeting_data_template: "{{#isTemporarilyClosed this}}<div class='temporarilyClosed'><span class='glyphicon glyphicon-flag'></span> {{temporarilyClosed this}}</div>{{/isTemporarilyClosed}}<div class='meeting-name'>{{this.meeting_name}}</div><div class='location-text'>{{this.location_text}}</div><div class='meeting-address'>{{this.formatted_address}}</div><div class='location-information'>{{this.formatted_location_info}}</div>{{#if this.virtual_meeting_additional_info}}<div class='meeting-additional-info'>{{this.virtual_meeting_additional_info}}</div>{{/if}}",
		metadata_template: "{{#isVirtual this}}{{#isHybrid this}}<div class='meetsVirtually'><span class='glyphicon glyphicon-cloud-upload'></span> {{meetsHybrid this}}</div>{{else}}<div class='meetsVirtually'><span class='glyphicon glyphicon-cloud'></span> {{meetsVirtually this}}</div>{{/isHybrid}}{{#if this.virtual_meeting_link}}<div><span class='glyphicon glyphicon-globe'></span> {{webLinkify this.virtual_meeting_link}}</div>{{#if this.show_qrcode}}<div class='qrcode'>{{qrCode this.virtual_meeting_link}}</div>{{/if}}{{/if}}{{#if this.phone_meeting_number}}<div><span class='glyphicon glyphicon-earphone'></span> {{phoneLinkify this.phone_meeting_number}}</div>{{#if this.show_qrcode}}<div class='qrcode'>{{qrCode this.phone_meeting_number}}</div>{{/if}}{{/if}}{{/isVirtual}}{{#isNotTemporarilyClosed this}}{{#unless (hasFormats 'VM' this)}}<div><a id='map-button' class='btn btn-primary btn-xs' href='https://www.google.com/maps/search/?api=1&query={{this.latitude}},{{this.longitude}}&q={{this.latitude}},{{this.longitude}}' target='_blank' rel='noopener noreferrer'><span class='glyphicon glyphicon-map-marker'></span> {{this.map_word}}</a></div><div class='geo hide'>{{this.latitude}},{{this.longitude}}</div>{{/unless}}{{/isNotTemporarilyClosed}}",
		observer_template: "<div class='observerLine'>{{this.contact_name_1}} {{this.contact_phone_1}} {{this.contact_email_1}}</div><div class='observerLine'>{{this.contact_name_2}} {{this.contact_phone_2}} {{this.contact_email_2}}</div>"
	};

	self.setConfig(config);
	self.loadGapi = function(callbackFunctionName) {
		var tag = document.createElement('script');
		tag.src = "https://maps.googleapis.com/maps/api/js?key=" + self.config['google_api_key'] + "&callback=" + callbackFunctionName;
		tag.defer = true;
		tag.async = true;
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	};
	self.getCurrentLocation = function(callback) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(callback, self.errorHandler);
		} else {
			$('.geo').removeClass("hide").addClass("show").html('<p>Geolocation is not supported by your browser</p>');
		}
	};

	self.searchByCoordinates = function(latitude, longitude) {
		var width = self.config['map_search']['width'] || -50;

		self.config['custom_query'] = self.config['custom_query'] + "&lat_val=" + latitude + "&long_val=" + longitude
			+ (self.config['distance_units'] === "km" ? '&geo_width_km=' : '&geo_width=') + width;
		self.meetingSearch(function() {
			self.reset();
			self.render();
			self.initMap(function() {
				self.addCurrentLocationPin(latitude, longitude);
			});
		});
	};

	self.addCurrentLocationPin = function(latitude, longitude) {
		var latlng = new google.maps.LatLng(latitude, longitude);
		self.map.setCenter(latlng);

		var currentLocationMarker = new google.maps.Marker({
			"map": self.map,
			"position": latlng,
		});

		self.addToMapObjectCollection(currentLocationMarker);

		// TODO: needs to show on click only
		/*var infowindow = new google.maps.InfoWindow({
			"content": 'Current Location',
			"position": latlng,
		}).open(self.map, currentLocationMarker);*/
	};

	self.findMarkerById = function(id) {
		for (var m = 0; m < self.map_objects.length; m++) {
			var map_object = self.map_objects[m];
			if (parseInt(map_object['id']) === id) {
				return map_object;
			}
		}

		return null;
	};

	self.rowClick = function(id) {
		var map_marker = self.findMarkerById(id);
		self.map.setCenter(map_marker.getPosition());
		self.map.setZoom(17);
		google.maps.event.trigger(map_marker, "click");
	};

	self.addToMapObjectCollection = function(obj) {
		self.map_objects.push(obj);
	};

	self.clearAllMapClusters = function() {
		while (self.map_clusters.length > 0) {
			self.map_clusters[0].setMap(null);
			self.map_clusters.splice(0, 1);
		}

		if (self.oms !== null) {
			self.oms.removeAllMarkers();
		}

		if (self.markerClusterer !== null) {
			self.markerClusterer.clearMarkers();
		}
	};

	self.clearAllMapObjects = function() {
		while (self.map_objects.length > 0) {
			self.map_objects[0].setMap(null);
			self.map_objects.splice(0, 1);
		}

		//infoWindow.close();
	};

	self.getMeetings = function(url, callback) {
		jQuery.getJSON(this.config['root_server'] + url + '&callback=?', function (data) {
			if (data === null || JSON.stringify(data['meetings']) === "{}") {
				var fullUrl = self.config['root_server'] + url
				jQuery('#' + self.config['placeholder_id']).html("Could not find any meetings for the criteria specified with the query <a href=\"" + fullUrl + "\" target=_blank>" + fullUrl + "</a>");
				return;
			}
			data['meetings'].exclude(self.config['exclude_zip_codes'], "location_postal_code_1");
			self.meetingData = data['meetings'];
			self.formatsData = data['formats'];

			if (self.config['extra_meetings'].length > 0) {
				var extra_meetings_query = "";
				for (var i = 0; i < self.config['extra_meetings'].length; i++) {
					extra_meetings_query += "&meeting_ids[]=" + self.config["extra_meetings"][i];
				}
				jQuery.getJSON(self.config['root_server'] + url + '&callback=?' + extra_meetings_query, function (data) {
					self.meetingData = self.meetingData.concat(data);
					self.mutex = false;
					callback();
				});
			} else {
				self.mutex = false;
				callback();
			}
		});
	};
	self.mutex = true;

	self.meetingSearch = function(callback) {
		var data_field_keys = [
			'location_postal_code_1',
			'duration_time',
			'start_time',
			'time_zone',
			'weekday_tinyint',
			'service_body_bigint',
			'longitude',
			'latitude',
			'location_province',
			'location_municipality',
			'location_street',
			'location_info',
			'location_text',
			'location_neighborhood',
			'formats',
			'format_shared_id_list',
			'comments',
			'meeting_name',
			'location_sub_province',
			'worldid_mixed',
			'root_server_uri',
			'id_bigint',
		];

		var extra_fields_regex = /this\.([A-Za-z0-9_]*)}}/gi;
		while (arr = extra_fields_regex.exec(self.config['meeting_data_template'])) {
			data_field_keys.push(arr[1]);
		}
		while (arr = extra_fields_regex.exec(self.config['metadata_template'])) {
			data_field_keys.push(arr[1]);
		}
		while (arr = extra_fields_regex.exec(self.config['observer_template'])) {
			data_field_keys.push(arr[1]);
		}
		var url = '/client_interface/jsonp/?switcher=GetSearchResults&get_used_formats&lang_enum=' + self.config['short_language'] +
			'&data_field_key=' + data_field_keys.join(',')

		if (self.config['int_include_unpublished'] === 1) {
			url += "&advanced_published=0"
		} else if (self.config['int_include_unpublished'] === -1) {
			url += "&advanced_published=-1"
		}

		if (self.config['distance_search'] !== 0) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					url += '&lat_val=' + position.coords.latitude
						+ '&long_val=' + position.coords.longitude
						+ '&sort_results_by_distance=1';

					url += (self.config['distance_units'] === "km" ? '&geo_width_km=' : '&geo_width=') + self.config['distance_search'];
					self.getMeetings(url, callback);
				}, self.errorHandler);
			}
		} else if (self.config['custom_query'] != null) {
			url += self.config['custom_query'] + '&sort_keys='  + self.config['sort_keys'];
			self.getMeetings(url, callback);
		} else if (self.config['service_body'].length > 0) {
			for (var i = 0; i < self.config['service_body'].length; i++) {
				url += '&services[]=' + self.config['service_body'][i];
			}

			if (self.config['recurse_service_bodies']) {
				url += '&recursive=1';
			}

			url += '&sort_keys=' + self.config['sort_keys'];

			self.getMeetings(url, callback);
		}
	};

	if (self.config['map_search'] !== null) {
		self.loadGapi('crouton.renderMap');
	} else {
		self.meetingSearch(function() {});
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

	self.dayTab = function(day_id) {
		self.hideAllPages();
		jQuery('.nav-tabs a[href="#tab' + day_id + '"]').tab('show');
		self.showPage("#" + day_id);
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

	self.hideAllPages = function (id) {
		jQuery("#tab-pane").removeClass("show").addClass("hide");
	};

	self.filteredPage = function (dataType, dataValue) {
		jQuery(".meeting-header").removeClass("hide");
		jQuery(".bmlt-data-row").removeClass("hide");
		if (dataType !== "formats" && dataType !== "languages" && dataType !== "venues") {
			jQuery(".bmlt-data-row").not("[data-" + dataType + "='" + dataValue + "']").addClass("hide");
		} else {
			jQuery(".bmlt-data-row").not("[data-" + dataType + "~='" + dataValue + "']").addClass("hide");
		}

		if (self.config['filter_tabs']) {
			self.showPage("#nav-days");
			self.showPage("#tabs-content");
		} else {
			self.lowlightButton(".filterButton");
			self.lowlightButton("#day");
			self.showPage("#byday");

			jQuery(".bmlt-data-rows").each(function (index, value) {
				if (jQuery(value).find(".bmlt-data-row.hide").length === jQuery(value).find(".bmlt-data-row").length) {
					jQuery(value).find(".meeting-header").addClass("hide");
				}
			});
		}
	};

	self.resetFilter = function () {
		jQuery(".filter-dropdown").val(null).trigger("change");
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
		var template = hbs_Crouton.templates['main'];
		jQuery(selector).html(template(context));
		jQuery(".meeting-data-template").children().attr("tabindex", "0")
		callback();
	};

	self.getServiceBodies = function (service_bodies_id, callback) {
		jQuery.getJSON(this.config['root_server'] + '/client_interface/jsonp/?switcher=GetServiceBodies'
			+ getServiceBodiesQueryString(service_bodies_id) + '&callback=?', callback);
	};

	self.getMasterFormats = function (callback) {
		jQuery.getJSON(this.config['root_server'] + '/client_interface/jsonp/?switcher=GetFormats&lang_enum=en&callback=?', function(masterFormats) {
			self.masterFormatCodes = masterFormats;
			callback();
		});
	}

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

		crouton_Handlebars.registerPartial("meetingDataTemplate", self.config['meeting_data_template']);
		crouton_Handlebars.registerPartial("metaDataTemplate", self.config['metadata_template']);
		crouton_Handlebars.registerPartial("observerTemplate", self.config['observer_template']);

		for (var m = 0; m < meetingData.length; m++) {
			meetingData[m]['formatted_comments'] = meetingData[m]['comments'];
			var duration = meetingData[m]['duration_time'].split(":");
			// convert from bmlt day to iso day
			meetingData[m]['start_time_raw'] = this.getAdjustedDateTime(
				parseInt(meetingData[m]['weekday_tinyint']) === 1 ? 7 : parseInt(meetingData[m]['weekday_tinyint']) - 1,
				meetingData[m]['start_time'],
				meetingData[m]['time_zone']
			);
			meetingData[m]['start_time_formatted'] = meetingData[m]['start_time_raw'].format(self.config['time_format']);
			meetingData[m]['end_time_formatted'] = meetingData[m]['start_time_raw']
				.clone()
				.add(duration[0], 'hours')
				.add(duration[1], 'minutes')
				.format(self.config['time_format']);

			// back to bmlt day
			meetingData[m]['day_of_the_week'] = meetingData[m]['start_time_raw'].isoWeekday() === 7 ? 1 : meetingData[m]['start_time_raw'].isoWeekday() + 1;
			meetingData[m]['formatted_day'] = self.localization.getDayOfTheWeekWord(meetingData[m]['day_of_the_week']);

			var formats = meetingData[m]['formats'].split(",");
			var formats_expanded = [];
			for (var f = 0; f < formats.length; f++) {
				for (var g = 0; g < self.formatsData.length; g++) {
					if (formats[f] === self.formatsData[g]['key_string']) {
						formats_expanded.push(
							{
								"id": self.formatsData[g]['id'],
								"key": formats[f],
								"name": self.formatsData[g]['name_string'],
								"description": self.formatsData[g]['description_string']
							}
						)
					}
				}
			}

			meetingData[m]['venue_type'] = getVenueType(meetingData[m]);
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
			meetingData[m]['show_qrcode'] = self.config['show_qrcode'];
			for (var k in meetingData[m]) {
				if (meetingData[m].hasOwnProperty(k) && typeof meetingData[m][k] === 'string') {
					if (meetingData[m][k].indexOf('#@-@#') !== -1) {
						var split = meetingData[m][k].split('#@-@#');
						meetingData[m][k] = split[split.length - 1];
					}
				}
			}
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
	};
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

	if (self.config["template_path"] == null) {
		self.config["template_path"] = "templates"
	}

	// https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
	// We hardcode override Dansk because of a legacy issue in the root server that doesn't follow ISO 639 standards.
	self.config['short_language'] = self.config['language'] === "da-DK" ? "dk" : self.config['language'].substring(0, 2);
	self.localization = new CroutonLocalization(self.config['language']);
};

Crouton.prototype.reset = function() {
	var self = this;
	jQuery("#custom-css").remove();
	jQuery("#" + self.config["placeholder_id"]).html("");
	self.clearAllMapObjects();
	self.clearAllMapClusters();
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

Crouton.prototype.serviceBodyNames = function(callback) {
	var self = this;
	self.lock(function() {
		var ids = getUniqueValuesOfKey(self.meetingData, 'service_body_bigint');
		self.getServiceBodies(ids, function (service_bodies) {
			var n = service_bodies.length;
			var names = [];
			for (var i = 0; i < n; i++) {
				names.push(service_bodies[i]['name']);
			}
			names.sort();
			if (n===1) {
				callback(names[0]);
			}
			else if (n===2) {
				callback(names[0] + ' and ' + names[1]);
			}
			else {
				var str = '';
				for (var j = 0; j < n-1; j++) {
					str += names[j];
					str += ', ';
				}
				callback(str + ' and ' + names[n-1]);
			}
		});
	});
};

Crouton.prototype.render = function(callback) {
	var self = this;
	self.lock(function() {
		var body = jQuery("body");
		if (self.config['theme'] !== '') {
			body.append("<div id='custom-css'><link rel='stylesheet' type='text/css' href='" + self.config['template_path'] + '/themes/' + self.config['theme'] + ".css'>");
		}

		body.append("<div id='custom-css'><style type='text/css'>" + self.config['custom_css'] + "</style></div>");

		if (self.isEmpty(self.meetingData)) {
			self.showMessage("No meetings found for parameters specified.");
			return;
		}
		self.uniqueData = {
			'groups': getUniqueValuesOfKey(self.meetingData, 'meeting_name').sort(),
			'cities': getUniqueValuesOfKey(self.meetingData, 'location_municipality').sort(),
			'locations': getUniqueValuesOfKey(self.meetingData, 'location_text').sort(),
			'sub_provinces': getUniqueValuesOfKey(self.meetingData, 'location_sub_province').sort(),
			'neighborhoods': getUniqueValuesOfKey(self.meetingData, 'location_neighborhood').sort(),
			'states': getUniqueValuesOfKey(self.meetingData, 'location_province').sort(),
			'zips': getUniqueValuesOfKey(self.meetingData, 'location_postal_code_1').sort(),
			'unique_service_bodies_ids': getUniqueValuesOfKey(self.meetingData, 'service_body_bigint').sort(),
			'venue_types': getValuesFromObject(crouton.localization.getWord("venue_type_choices")).sort()
		};
		if (callback !== undefined) callback();
		self.getMasterFormats(function() {
			self.getServiceBodies(self.uniqueData['unique_service_bodies_ids'], function (service_bodies) {
				var active_service_bodies = [];
				for (var i = 0; i < service_bodies.length; i++) {
					for (var j = 0; j < self.uniqueData['unique_service_bodies_ids'].length; j++) {
						if (service_bodies[i]["id"] === self.uniqueData['unique_service_bodies_ids'][j]) {
							active_service_bodies.push(service_bodies[i]);
						}
					}
				}

				self.uniqueData['areas'] = active_service_bodies.sortByKey('name');
				if (!jQuery.isEmptyObject(self.formatsData)) {
					self.formatsData = self.formatsData.sortByKey('name_string');
				}
				self.uniqueData['formats'] = self.formatsData;
				self.uniqueData['languages'] = [];

				for (var l = 0; l < self.formatsData.length; l++) {
					var format = self.formatsData[l];
					if (format['format_type_enum'] === "LANG") {
						self.uniqueData['languages'].push(format);
					}
				}

				var weekdaysData = [];
				var enrichedMeetingData = self.enrichMeetings(self.meetingData);

				enrichedMeetingData.sort(function (a, b) {
					if (a['start_time_raw'] < b['start_time_raw']) {
						return -1;
					}

					if (a['start_time_raw'] > b['start_time_raw']) {
						return 1;
					}

					return 0;
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
						"hide": self.config["hide_byday_headers"],
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

				var buttonFiltersDataSorted = {};
				for (var b = 0; b < self.config.button_filters.length; b++) {
					var sortKey = [];
					var groupByName = self.config.button_filters[b]['field'];
					for (var buttonFiltersDataItem in buttonFiltersData[groupByName]) {
						sortKey.push(buttonFiltersDataItem);
					}

					sortKey.sort();

					buttonFiltersDataSorted[groupByName] = {};
					for (var s = 0; s < sortKey.length; s++) {
						buttonFiltersDataSorted[groupByName][sortKey[s]] = buttonFiltersData[groupByName][sortKey[s]]
					}
				}

				self.renderView("#" + self.config['placeholder_id'], {
					"config": self.config,
					"meetings": {
						"weekdays": weekdaysData,
						"buttonFilters": buttonFiltersDataSorted,
						"bydays": byDayData
					},
					"uniqueData": self.uniqueData
				}, function () {
					if (self.config['map_search'] != null || self.config['show_map']) {
						jQuery(".bmlt-data-row").css({cursor: "pointer"});
						jQuery(".bmlt-data-row").click(function () {
							self.rowClick(parseInt(this.id.replace("meeting-data-row-", "")));
						});
					}

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

					jQuery('.filter-dropdown').on('select2:select', function (e) {
						jQuery(this).parent().siblings().children(".filter-dropdown").val(null).trigger('change');

						var val = jQuery(this).val();
						jQuery('.bmlt-page').each(function () {
							self.hidePage(this);
							self.filteredPage(e.target.getAttribute("data-pointer").toLowerCase(), val.replace("a-", ""));
							return;
						});
					});

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

					if (self.config['default_filter_dropdown'] !== "") {
						var filter = self.config['default_filter_dropdown'].toLowerCase().split("=");
						jQuery("#filter-dropdown-" + filter[0]).val('a-' + filter[1]).trigger('change').trigger('select2:select');
					}

					if (self.config['show_distance']) {
						self.getCurrentLocation(self.showLocation);
					}

					if (self.config['show_map']) {
						self.loadGapi('crouton.initMap');
					}

					if (self.config['on_complete'] != null && isFunction(self.config['on_complete'])) {
						self.config['on_complete']();
					}
				});
			});
		});
	});
};

Crouton.prototype.mapSearchClickMode = function() {
	var self = this;
	self.mapClickSearchMode = true;
	self.map.setOptions({
		draggableCursor: 'crosshair',
		zoomControl: false,
		gestureHandling: 'none'
	});
};

Crouton.prototype.mapSearchPanZoomMode = function() {
	var self = this;
	self.mapClickSearchMode = false;
	self.map.setOptions({
		draggableCursor: 'default',
		zoomControl: true,
		gestureHandling: 'auto'
	});
};

Crouton.prototype.mapSearchNearMeMode = function() {
	var self = this;
	self.mapSearchPanZoomMode();
	jQuery("#panzoom").prop("checked", true);
	self.getCurrentLocation(function(position) {
		self.searchByCoordinates(position.coords.latitude, position.coords.longitude);
	});
};

Crouton.prototype.mapSearchTextMode = function(location) {
	var self = this;
	self.mapSearchPanZoomMode();
	jQuery("#panzoom").prop("checked", true);
	if (location !== undefined && location !== null && location !== "") {
		self.geocoder.geocode({'address': location}, function (results, status) {
			if (status === 'OK') {
				self.searchByCoordinates(results[0].geometry.location.lat(), results[0].geometry.location.lng());
			} else {
				console.log('Geocode was not successful for the following reason: ' + status);
			}
		});
	}
};

Crouton.prototype.renderMap = function() {
	var self = this;
	jQuery("#bmlt-tabs").before("<div id='bmlt-map' class='bmlt-map'></div>");

	self.geocoder = new google.maps.Geocoder();
	self.map = new google.maps.Map(document.getElementById('bmlt-map'), {
		zoom: self.config['map_search']['zoom'] || 10,
		center: {
			lat: self.config['map_search']['latitude'],
			lng: self.config['map_search']['longitude'],
		},
		mapTypeControl: false,
	});

	var controlDiv = document.createElement('div');

	// Set CSS for the control border
	var controlUI = document.createElement('div');
	controlUI.className = 'mapcontrolcontainer';
	controlUI.title = 'Click to recenter the map';
	controlDiv.appendChild(controlUI);

	// Set CSS for the control interior
	var clickSearch = document.createElement('div');
	clickSearch.className = 'mapcontrols';
	clickSearch.innerHTML = '<label for="nearme" class="mapcontrolslabel"><input type="radio" id="nearme" name="mapcontrols"> ' + self.localization.getWord('near_me') + '</label><label for="textsearch" class="mapcontrolslabel"><input type="radio" id="textsearch" name="mapcontrols"> ' + self.localization.getWord('text_search') + '</label><label for="clicksearch" class="mapcontrolslabel"><input type="radio" id="clicksearch" name="mapcontrols"> ' + self.localization.getWord('click_search') + '</label><label for="panzoom" class="mapcontrolslabel"><input type="radio" id="panzoom" name="mapcontrols" checked> ' + self.localization.getWord('pan_and_zoom') + '</label>';
	controlUI.appendChild(clickSearch);
	controlDiv.index = 1;

	google.maps.event.addDomListener(clickSearch, 'click', function() {
		var controlsButtonSelections = jQuery("input:radio[name='mapcontrols']:checked").attr("id");
		if (controlsButtonSelections === "textsearch") {
			self.mapSearchTextMode(prompt("Enter a location or postal code:"));
		} else if (controlsButtonSelections === "nearme") {
			self.mapSearchNearMeMode();
		} else if (controlsButtonSelections === "clicksearch") {
			self.mapSearchClickMode();
		} else if (controlsButtonSelections === "panzoom") {
			self.mapSearchPanZoomMode();
		}
	});

	self.map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);
	self.map.addListener('click', function (data) {
		if (self.mapClickSearchMode) {
			self.mapSearchPanZoomMode();
			jQuery("#panzoom").prop("checked", true);
			self.searchByCoordinates(data.latLng.lat(), data.latLng.lng());
		}
	});

	if (self.config['map_search']['auto']) {
		self.mapSearchNearMeMode();
	} else if (self.config['map_search']['location'] !== undefined) {
		self.mapSearchTextMode(self.config['map_search']['location']);
	} else if (self.config['map_search']['coordinates_search']) {
		self.searchByCoordinates(self.config['map_search']['latitude'], self.config['map_search']['longitude']);
	}
};

Crouton.prototype.initMap = function(callback) {
	var self = this;
	if (self.map == null) {
		jQuery("#bmlt-tabs").before("<div id='bmlt-map' class='bmlt-map'></div>");
		self.map = new google.maps.Map(document.getElementById('bmlt-map'), {
			zoom: 3,
		});
	}

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
	self.map.fitBounds(bounds);

	var infoWindow = new google.maps.InfoWindow();

	// Create OverlappingMarkerSpiderfier instance
	self.oms = new OverlappingMarkerSpiderfier(self.map, {
		markersWontMove: true,
		markersWontHide: true,
	});

	self.oms.addListener('format', function (marker, status) {
		var iconURL;
		if (status === OverlappingMarkerSpiderfier.markerStatus.SPIDERFIED
			|| status === OverlappingMarkerSpiderfier.markerStatus.SPIDERFIABLE
			|| status === OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIED) {
			iconURL = self.config['template_path'] + '/NAMarkerR.png';
		} else if (status === OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIABLE) {
			iconURL = self.config['template_path'] + '/NAMarkerB.png';
		} else {
			iconURL = null;
		}

		var iconSize = new google.maps.Size(22, 32);
		marker.setIcon({
			url: iconURL,
			size: iconSize,
			scaledSize: iconSize
		});
	});

	self.map.addListener('zoom_changed', function() {
		self.map.addListener('idle', function() {
			var spidered = self.oms.markersNearAnyOtherMarker();
			for (var i = 0; i < spidered.length; i ++) {
				spidered[i].icon.url = self.config['template_path'] + '/NAMarkerR.png';
			}
		});
	});

	// This is necessary to make the Spiderfy work
	self.oms.addListener('click', function (marker) {
		marker.zIndex = 999;
		infoWindow.setContent(marker.desc);
		infoWindow.open(self.map, marker);
	});
	// Add some markers to the map.
	// Note: The code uses the JavaScript Array.prototype.map() method to
	// create an array of markers based on a given "locations" array.
	// The map() method here has nothing to do with the Google Maps API.
	self.meetingData.map(function (location, i) {
		var marker_html = '<dl><dt><strong>';
		marker_html += location.meeting_name;
		marker_html += '</strong></dt>';
		marker_html += '<dd><em>';
		marker_html += self.localization.getDayOfTheWeekWord(location.weekday_tinyint);
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
		var url = 'https://maps.google.com/maps?q=' + location.latitude + ',' + location.longitude + '&hl=' + self.config['short_language'];
		marker_html += '<a target=\"_blank\" href="' + url + '">';
		marker_html += self.localization.getWord('map');
		marker_html += '</a>';
		marker_html += '</dd></dl>';

		var latLng = {"lat": parseFloat(location.latitude), "lng": parseFloat(location.longitude)};

		var marker = new google.maps.Marker({
			position: latLng
		});

		marker['id'] = location['id_bigint'];
		marker['day_id'] = location['weekday_tinyint'];

		self.addToMapObjectCollection(marker);
		self.oms.addMarker(marker);

		self.map_clusters.push(marker);
		google.maps.event.addListener(marker, 'click', function (evt) {
			jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
			jQuery("#meeting-data-row-" + marker['id'] + " > td").addClass("rowHighlight");
			self.dayTab(marker['day_id']);
			infoWindow.setContent(marker_html);
			infoWindow.open(self.map, marker);
		});
		return marker;
	});

	// Add a marker clusterer to manage the markers.
	self.markerClusterer = new MarkerClusterer(self.map, self.map_clusters, {
		imagePath: self.config['template_path'] + '/m',
		maxZoom: self.config['map_max_zoom'],
		zoomOnClick: false
	});

	if (callback !== undefined && isFunction(callback)) callback();
};

function getTrueResult(options, ctx) {
	return options.fn !== undefined ? options.fn(ctx) : true;
}

function getFalseResult(options, ctx) {
	return options.inverse !== undefined ? options.inverse(ctx) : false;
}

function getMasterFormatId(code, data) {
	for (var f = 0; f < crouton.masterFormatCodes.length; f++) {
		var format = crouton.masterFormatCodes[f];
		if (format['key_string'] === code && format['root_server_uri'] === data['root_server_uri']) {
			return format['id'];
		}
	}
}

const venueType = {
	IN_PERSON: "IN_PERSON",
	VIRTUAL: "VIRTUAL",
}

function getVenueType(data) {
	if (inArray(getMasterFormatId('HY', data), getFormats(data))) {
		return [crouton.localization.getVenueType(venueType.VIRTUAL), crouton.localization.getVenueType(venueType.IN_PERSON)];
	} else if (inArray(getMasterFormatId('VM', data), getFormats(data))) {
		return [crouton.localization.getVenueType(venueType.VIRTUAL)];
	} else {
		return [crouton.localization.getVenueType(venueType.IN_PERSON)];
	}
}

// TODO: Change this logic when https://github.com/bmlt-enabled/bmlt-root-server/issues/353 is released and rolled out everywhere.
function getFormats(data) {
	return data['formats'] !== "" ? data['format_shared_id_list'].split(",") : [];
}

crouton_Handlebars.registerHelper('getDayOfTheWeek', function(day_id) {
	return hbs_Crouton.localization.getDayOfTheWeekWord(day_id);
});

crouton_Handlebars.registerHelper('getWord', function(word) {
	return hbs_Crouton.localization.getWord(word);
});

crouton_Handlebars.registerHelper('formatDataPointer', function(str) {
	return convertToPunyCode(str)
});

crouton_Handlebars.registerHelper('isVirtual', function(data, options) {
	return ((inArray(getMasterFormatId('HY', data), getFormats(data)) && !inArray(getMasterFormatId('TC', data), getFormats(data)))
		|| inArray(getMasterFormatId('VM', data), getFormats(data)))
	&& (data['virtual_meeting_link'] || data['phone_meeting_number']) ? getTrueResult(options, this) : getFalseResult(options, this);
});

crouton_Handlebars.registerHelper('isHybrid', function(data, options) {
	return inArray(getMasterFormatId('HY', data), getFormats(data))
	&& (data['virtual_meeting_link'] || data['phone_meeting_number']) ? getTrueResult(options, this) : getFalseResult(options, this);
});

crouton_Handlebars.registerHelper('isTemporarilyClosed', function(data, options) {
	return inArray(getMasterFormatId('TC', data), getFormats(data)) ? getTrueResult(options, this) : getFalseResult(options, this);
});

crouton_Handlebars.registerHelper('isNotTemporarilyClosed', function(data, options) {
	return !inArray(getMasterFormatId('TC', data), getFormats(data)) ? getTrueResult(options, this) : getFalseResult(options, this);
});

crouton_Handlebars.registerHelper('hasFormats', function(formats, data, options) {
	var allFound = false;
	var formatsResponse = data['formats'].split(",")
	var formatsParam = formats.split(",");
	for (var i = 0; i < formatsParam.length; i++) {
		allFound = inArray(formatsParam[i], formatsResponse);
	}

	return allFound ? getTrueResult(options, this) : getFalseResult(options, this);
});

crouton_Handlebars.registerHelper('temporarilyClosed', function(data, options) {
	if (data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('TC', data)) !== undefined) {
		return data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('TC', data))['description'];
	} else {
		return "FACILITY IS TEMPORARILY CLOSED";
	}
});

crouton_Handlebars.registerHelper('meetsVirtually', function(data, options) {
	if (data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('VM', data)) !== undefined) {
		return data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('VM', data))['description'];
	} else {
		return "MEETS VIRTUALLY";
	}
});

crouton_Handlebars.registerHelper('meetsHybrid', function(data, options) {
	if (data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('HY', data)) !== undefined) {
		return data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('HY', data))['description'];
	} else {
		return "MEETS VIRTUALLY AND IN PERSON";
	}
});

crouton_Handlebars.registerHelper('qrCode', function(link, options) {
	return new crouton_Handlebars.SafeString("<img alt='qrcode' src='https://chart.googleapis.com/chart?chs=100x100&cht=qr&chl=" + link + "&choe=UTF-8&chld=L|0'>");
});

crouton_Handlebars.registerHelper('formatDataFromArray', function(arr) {
	var finalValues = [];
	for (var i = 0; i < arr.length; i++) {
		finalValues.push(convertToPunyCode(arr[i]));
	}

	return finalValues.join(" ");
});

crouton_Handlebars.registerHelper('formatDataPointerFormats', function(formatsExpanded) {
	var finalFormats = [];
	for (var i = 0; i < formatsExpanded.length; i++) {
		finalFormats.push(convertToPunyCode(formatsExpanded[i]['name']));
	}
	return finalFormats.join(" ");
});

crouton_Handlebars.registerHelper('formatDataKeyFormats', function(formatsExpanded) {
	var finalFormats = [];
	for (var i = 0; i < formatsExpanded.length; i++) {
		finalFormats.push(convertToPunyCode(formatsExpanded[i]['key']));
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

crouton_Handlebars.registerHelper('webLinkify', function(text) {
	return new crouton_Handlebars.SafeString("<a href='" + text + "' target='_blank'>" + text + "</a>");
});

crouton_Handlebars.registerHelper('phoneLinkify', function(text) {
	return new crouton_Handlebars.SafeString("<a href='tel:" + text + "' target='_blank'>" + text + "</a>");
});

crouton_Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
	return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

crouton_Handlebars.registerHelper('greaterThan', function (arg1, arg2, options) {
	return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
});

crouton_Handlebars.registerHelper('lessThan', function (arg1, arg2, options) {
	return (arg1 < arg2) ? options.fn(this) : options.inverse(this);
});

crouton_Handlebars.registerHelper('times', function(n, block) {
	var accum = '';
	for(var i = 1; i <= n; ++i)
		accum += block.fn(i);
	return accum;
});

function convertToPunyCode(str) {
	return str !== undefined ? punycode.toASCII(str.toLowerCase()).replace(/\W|_/g, "-") : "";
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

function getValuesFromObject(o) {
	var arr = [];
	for (key in o) {
		if (o.hasOwnProperty(key)) {
			arr.push(o[key]);
		}
	}

	return arr;
}

Crouton.prototype.getAdjustedDateTime = function(meeting_day, meeting_time, meeting_time_zone) {
	var timeZoneAware = this.config['auto_tz_adjust'] === true || this.config['auto_tz_adjust'] === "true";
	var meeting_date_time_obj;
	if (timeZoneAware) {
		if (!meeting_time_zone) {
			meeting_time_zone = "UTC";
		}
    	// Get an object that represents the meeting in its time zone
    	meeting_date_time_obj = moment.tz(meeting_time_zone).set({
    		hour: meeting_time.split(":")[0],
    		minute: meeting_time.split(":")[1],
    		second: 0
    	}).isoWeekday(meeting_day);

    	// Convert meeting to target (local) time zone
    	meeting_date_time_obj = meeting_date_time_obj.clone().tz(moment.tz.guess());
	} else {
    	meeting_date_time_obj = moment().set({
    		hour: meeting_time.split(":")[0],
    		minute: meeting_time.split(":")[1],
    		second: 0
    	}).isoWeekday(meeting_day);
	}

	var now = timeZoneAware ? moment.tz(moment.tz.guess()) : moment();
	if (now > meeting_date_time_obj) {
		meeting_date_time_obj.add(1, 'weeks');
	} else if (now.isoWeekday() == meeting_date_time_obj.isoWeekday() && meeting_date_time_obj.diff(now, 'days') == 0) {
		meeting_date_time_obj.add(1, 'weeks');
	}

	return meeting_date_time_obj;
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

function isFunction(functionToCheck) {
	return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function getServiceBodiesQueryString(service_bodies_id) {
	var service_bodies_query = "";
	for (var x = 0; x < service_bodies_id.length; x++) {
		service_bodies_query += "&services[]=" + service_bodies_id[x];
	}
	return service_bodies_query;
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
