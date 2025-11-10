var crouton_Handlebars = Handlebars.noConflict();
// These are extension points
crouton_Handlebars.registerHelper("startup", () => '');
crouton_Handlebars.registerHelper("enrich", () => '');
crouton_Handlebars.registerHelper("log", (x) => console.log(x));
crouton_Handlebars.registerHelper('selectFormatPopup', () => "formatPopup");
crouton_Handlebars.registerHelper('selectObserver', () => "observerTemplate");


function Crouton(config) {
	var self = this;
	self.mutex = false;
	self.filtering = false;
	self.masterFormatCodes = [];
	self.currentView = "weekday";
	self.distanceTabAllowed = false;
	self.config = {
		version: '3.25.1',            // CroutonJS version for debugging
		on_complete: null,            // Javascript function to callback when data querying is completed.
		root_server: null,			  // The root server to use.
		placeholder_id: "bmlt-tabs",  // The DOM id that will be used for rendering
		map_max_zoom: 15,		      // Maximum zoom for the display map
		time_format: "h:mm a",        // The format for time
		language: "en-US",            // Default language translation, available translations listed here: https://github.com/bmlt-enabled/crouton/blob/master/croutonjs/src/js/crouton-localization.js
		has_tabs: true,               // Shows the day tabs
		filter_tabs: 20,   		  // Whether to show weekday tabs on filtering.
		filter_visible: 0,		  // whether entries in table should be limited to those visible in map
		header: true,                 // Shows the dropdowns and buttons
		include_weekday_button: true, // Shows the weekday button
		int_include_unpublished: 0,	  // Includes unpublished meeting
		grouping_buttons: [
			{'title': 'City', 'field': 'location_municipality'},
			{'title': 'Distance', 'field': 'distance_in_km'},
		],
		formattype_grouping_buttons: [],
		default_filter_dropdown: "",  // Sets the default format for the dropdowns, the names will match the `has_` fields dropdowns without `has_.  Example: `formats=closed`.
		show_map: "embed",            // Shows the map with pins
		map_search: null, 			  // Start search with map click (ex {"latitude":x,"longitude":y,"width":-10,"zoom":10}
		has_days: false,			  // Shows the days of the week dropdown
		has_cities: true,             // Shows the cities dropdown
		has_formats: true,            // Shows the formats dropdown
		has_groups: false,            // Shows the groups dropdown
		has_locations: true,          // Shows the locations dropdown
		has_zip_codes: false,         // Shows the zip codes dropdown
		has_areas: false,             // Shows the areas dropdown
		has_regions: false,			  // Shows the regions dropdown
		has_states: false,            // Shows the states dropdown
		has_sub_province: false,      // Shows the sub province dropdown (counties)
		has_neighborhoods: false,     // Shows the neighborhood dropdown
		has_languages: false,		  // Shows the language dropdown
		has_common_needs: false, 	  // Shows the Common Needs dropdown
		has_venues: true,		      // Shows the venue types dropdown
		has_meeting_count: false,	  // Shows the meeting count
		recurse_service_bodies: false,// Recurses service bodies when making service bodies request
		service_body: [],             // Array of service bodies to return data for.
		formats: '',		  		  // Return only meetings with these formats (format shared-id, not key-string)
		venue_types: [],			  // Return only meetings with this venue type (1, 2 or 3)
		strict_datafields: true,	  // Only get the datafields that are mentioned in the templates
		meeting_details_href: '',	  // Link to the meeting details page
		virtual_meeting_details_href: '', // Link to the virtual meeting details page
		bmlt2ics: '',				  // URL of feed to generate ICS files from meetings
		exclude_zip_codes: [],        // List of zip codes to exclude
		extra_meetings: [],           // List of id_bigint of meetings to include
		native_lang: '',				  // The implied language of meetings with no explicit language specied.  May be there as second language, but it still doesn't make sense to search for it.
		auto_tz_adjust: false,        // Will auto adjust the time zone, by default will assume the timezone is local time
		base_tz: null,                // In conjunction with auto_tz_adjust the timezone to base from.  Choices are listed here: https://github.com/bmlt-enabled/crouton/blob/master/croutonjs/src/js/moment-timezone.js#L623
		custom_query: null,			  // Enables overriding the services related queries for a custom one
		sort_keys: "start_time",	  // Controls sort keys on the query
		int_start_day_id: 1,          // Controls the first day of the week sequence.  Sunday is 1.
		view_by: "weekday",           // TODO: replace with using the first choice in grouping_buttons as the default view_by.
		show_qrcode: false,  		  // Determines whether or not to show the QR code for virtual / phone meetings if they exist.
		force_rootserver_in_querystring: true, // Set to false to shorten generated meeting detail query strings
		force_timeformat_in_querystring: true, // Set to false to shorten generated meeting detail query strings
		force_language_in_querystring: true, // Set to false to shorten generated meeting detail query strings
		theme: "jack",                // Allows for setting pre-packaged themes.  Choices are listed here:  https://github.com/bmlt-enabled/crouton/blob/master/croutonjs/src/templates/themes
		report_update_url: "",   	  // URL to edit a meeting for BMLT-workflow plugin
		meeting_data_template: croutonDefaultTemplates.meeting_data_template,
		metadata_template: croutonDefaultTemplates.metadata_template,
		observer_template: croutonDefaultTemplates.observer_template,
		meeting_count_template: croutonDefaultTemplates.meeting_count_template,
		meeting_link_template: croutonDefaultTemplates.meeting_link_template,
		meeting_modal_template: croutonDefaultTemplates.meeting_modal_template,
		meetingpage_title_template: croutonDefaultTemplates.meetingpage_title_template,
		meetingpage_contents_template: croutonDefaultTemplates.meetingpage_contents_template,
		meetingpage_frame_template: croutonDefaultTemplates.meetingpage_frame_template,
		lat: 0,
		lng: 0,
		zoom: 10,
		clustering: 12,
		nominatimUrl: 'https://nominatim.openstreetmap.org/',
		tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		tileOptions: {
			attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
			maxZoom: 18
		},
		minZoom: 6,
		maxZoom: 17,
		distance_units: 'miles',
		noMap: false,
		maxTomatoWidth: 160,
		caption: false,
		groups: false,
	};

	self.setConfig(config);
	Crouton.prototype.searchByCoordinates = function(latitude, longitude, width, fitBounds=true) {
		const original_query = self.config['custom_query'];
		self.config['custom_query'] = (self.config['custom_query'] !== null ? self.config['custom_query'] : "")
			+ "&lat_val=" + latitude + "&long_val=" + longitude
			+ (self.config['distance_units'] === "km" ? '&geo_width_km=' : '&geo_width=') + width;
		self.meetingSearch(function() {
				self.config.refresh_map=1;
				self.config.show_map = 1;
				self.reset();
				self.render(false, fitBounds);
		});
		self.config['custom_query'] = original_query;
	};
	self.registerPartial = function(name, template) {
		crouton_Handlebars.registerPartial(name, crouton_Handlebars.compile(template));
	};
	self.getMeetings = function(url,cb=null) {
		var promises = [fetchJsonp(this.config['root_server'] + url).then(function(response) { return response.json(); })];

		if (self.config['extra_meetings'].length > 0) {
			var extra_meetings_query = "";
			for (var i = 0; i < self.config['extra_meetings'].length; i++) {
				extra_meetings_query += "&meeting_ids[]=" + self.config["extra_meetings"][i];
			}
			const regex = /&services\[\]=\d+/;
			url = url.replace(regex, '');
			promises.push(fetchJsonp(self.config['root_server'] + url + extra_meetings_query).then(function (response) { return response.json(); }));
		}

		return Promise.all(promises)
			.then(function(data) {
				var mainMeetings = data[0];
				var extraMeetings;
				var jsonMeetings = JSON.stringify(mainMeetings['meetings']);
				if (data.length === 2) {
					extraMeetings = data[1];
				}
				if (jsonMeetings === "{}" || jsonMeetings === "[]") {
					var fullUrl = self.config['root_server'] + url
					console.log("Could not find any meetings for the criteria specified with the query <a href=\"" + fullUrl + "\" target=_blank>" + fullUrl + "</a>");
					jQuery('#' + self.config['placeholder_id']).html("No meetings found.");
					self.meetingData = [];
					self.formatsData = [];
					self.mutex = false;
					cb && cb();
					return;
				}
				if (self.config['exclude_zip_codes'].length > 0) {
					mainMeetings['meetings'] = mainMeetings['meetings'].filter(function(m) { return !inArray(m['location_postal_code_1'], self.config['exclude_zip_codes']); } );
				}
				self.meetingData = mainMeetings['meetings'];
				self.formatsData = mainMeetings['formats'];
				if (extraMeetings) {
					self.meetingData = self.meetingData.concat(extraMeetings['meetings']);
				}
				cb && cb();
				self.mutex = false;
			});
	};
	self.addDatafieldsToQuery = function() {
		if (!self.config.strict_datafields) {
			self.all_data_keys = [];
			self.queryable_data_keys = [];
			return '';
		}
		var base_data_field_keys = [
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
			'venue_type',
		];

		var calculated_keys = [
			"serviceBodyName",
			"serviceBodyUrl",
			"serviceBodyPhone",
			"serviceBodyDescription",
			"serviceBodyType",
			"parentServiceBodyName",
			"parentServiceBodyUrl",
			"parentServiceBodyPhone",
			"parentServiceBodyDescription",
			"parentServiceBodyType",
			"map_word",
			"share_word",
			"report_update_word",
			"show_qrcode",
			"formatted_day",
			"formatted_address",
			"formats_expanded",
			"formatted_location_info",
			"end_time_formatted",
			"start_time_formatted",
			"formatted_comments",
			"start_time_raw",
			"venue_type_name",
			"day_of_the_week",
		];

		self.all_data_keys = base_data_field_keys.clone();
		self.queryable_data_keys = base_data_field_keys.clone();

		self.collectDataKeys = function(template) {
			var extra_fields_regex = /this\.([A-Za-z0-9_]*)}}/gi;
			while (arr = extra_fields_regex.exec(template)) {
				self.all_data_keys.push(arr[1]);
				if (!inArray(arr[1], calculated_keys)) {
					self.queryable_data_keys.push(arr[1]);
				}
			}
		}

		if (self.config.map_search) {
			self.queryable_data_keys.push('distance_in_km');
			self.queryable_data_keys.push('distance_in_miles');
		}
		self.collectDataKeys(self.config['meeting_data_template']);
		self.collectDataKeys(self.config['metadata_template']);
		self.collectDataKeys(self.config['observer_template']);

		var unique_data_field_keys = arrayUnique(self.queryable_data_keys);
		return '&data_field_key=' + unique_data_field_keys.join(',');
	}
	self.mutex = true;

	self.meetingSearch = function(cb=null) {
		var url = '/client_interface/jsonp/?switcher=GetSearchResults&get_used_formats&lang_enum=' + self.config['short_language'] +
			self.addDatafieldsToQuery();

		if (self.config['formats']) {
			url += self.config['formats'].reduce(function(prev,id) {
				return prev +'&formats[]='+id;
			}, '');
		}
		if (self.config.map_search && !Array.isArray(self.config['venue_types'])) {
			self.config['venue_types'] = [];
		}
		if (self.config.map_search && self.config['venue_types'].length === 0) {
			self.config['venue_types'].push('-2');
		}
		if (self.config['venue_types']) {
			url += self.config['venue_types'].reduce(function(prev,id) {
				return prev +'&venue_types[]='+id;
			}, '');
		}
		if (self.config['int_include_unpublished'] === 1) {
			url += "&advanced_published=0"
		} else if (self.config['int_include_unpublished'] === -1) {
			url += "&advanced_published=-1"
		}

		if (self.config['custom_query'] != null) {
			url += self.config['custom_query'] + '&sort_keys='  + self.config['sort_keys'];
			return self.getMeetings(url,cb);
		} else if (self.config['service_body'].length > 0) {
			for (var i = 0; i < self.config['service_body'].length; i++) {
				url += '&services[]=' + self.config['service_body'][i];
			}

			if (self.config['recurse_service_bodies']) {
				url += '&recursive=1';
			}

			url += '&sort_keys=' + self.config['sort_keys'];

			return self.getMeetings(url,cb);
		} else {
			return new Promise(function(resolve, reject) {
				resolve();
			});
		}
	};

	self.lock = function(callback) {
		var self = this;
		var lock_id = setInterval(function() {
			if (!self.mutex) {
				clearInterval(lock_id);
				callback();
			}
		}, 100);
	};

	self.dayTab = function(day_id) {
		self.hideAllPages();
		jQuery('.nav-tabs a[href="#tab' + day_id + '"]').tab('show');
		jQuery("#" + day_id).removeClass("hide").addClass("show");
	};
	self.dayTabFromId = function(id) {
		day_id = self.meetingData.find((m)=>m.id_bigint == id).weekday_tinyint;
		self.dayTab(day_id);
	};
	self.showPage = function (id) {
		jQuery(id+" .bmlt-data-row-placeholder").each(function() {
			const meetingId = this.dataset.meetingid;
			const placeHolder = jQuery(this);
			const placeholderText = this.outerHTML;
			const meetingRow = jQuery("#"+meetingId);
			meetingRow.before(placeholderText);
			placeHolder.replaceWith(meetingRow);
		});
		self.addStripes();
		jQuery(id).removeClass("hide").addClass("show");
	};

	self.showView = function (viewName, showingNow=0) {
		self.currentView = viewName;
		if (showingNow > 0) {
			self.showingNow = showingNow;
		} else showingNow = self.showingNow ? self.showingNow : self.meetingData.length; ;

		if (viewName.endsWith('day')) {
			if (!self.config['has_tabs'] || (self.config['filter_tabs'] && self.config['filter_tabs'] >= showingNow)) {
				self.byDayView();

				jQuery("#byday").find('.meeting-group').each(function(index) {
					if (jQuery(this).find(".bmlt-data-row.hide").length === jQuery(this).find(".bmlt-data-row").length)
						jQuery(this).addClass("hide");
					else jQuery(this).removeClass('hide');
				});
			} else {
				self.dayView();
			}
		} else if (viewName=='map') {
			self.mapView();
		} else if (jQuery('#groupingButton_'+viewName.toUpperCase()).length == 0) {
			self.groupedView(self.config.grouping_buttons.find((bf) => bf.title.toLowerCase() === viewName).field);
		} else {
			self.groupedView(viewName.toUpperCase());
		}
	};

	self.byDayView = function () {
		self.lowlightButton(".groupingButton");
		self.highlightButton("#day");
		jQuery('.bmlt-page').each(function (index) {
			self.hidePage("#" + this.id);
			return;
		});
		self.hidePage("#days");
		self.showPage("#byday");
		self.hidePage("#nav-days");
		self.hidePage("#tabs-content");
	};

	self.dayView = function () {
		self.lowlightButton(".groupingButton");
		self.highlightButton("#day");
		jQuery('.bmlt-page').each(function (index) {
			self.hidePage("#" + this.id);
			return;
		});
		jQuery("#days").removeClass("hide").addClass("show");
		jQuery("#nav-days").removeClass("hide").addClass("show")
		self.showPage("#tabs-content");
	};

	self.groupedView = function (field) {
		if (field.includes('distance') && !self.distanceTabAllowed) {
			self.dayView();
			return;
		}
		self.lowlightButton("#day");
		self.lowlightButton(".groupingButton");
		self.highlightButton("#groupingButton_" + field);
		jQuery('.bmlt-page').each(function (index) {
			self.hidePage("#" + this.id);
			self.showPage("#byfield_" + field);
			jQuery("#byfield_" + field).find('.meeting-group').each(function(index) {
				if (jQuery(this).find(".bmlt-data-row.hide").length === jQuery(this).find(".bmlt-data-row").length)
					jQuery(this).addClass("hide");
				else jQuery(this).removeClass('hide');
			});
		});
	}
	self.mapView = function() {
		self.lowlightButton("#day");
		self.lowlightButton(".groupingButton");
		self.highlightButton("#groupingButton_embeddedMapPage");
		self.groupedView("embeddedMapPage", false);
		croutonMap.showMap(false,false);
	}
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
	self.addStripes = function() {
		jQuery(".bmlt-data-row").removeClass("evenRow");
		jQuery(".bmlt-data-row").removeClass("oddRow");
		jQuery(".bmlt-data-row:not(.hide)").each(function (index, value) {
			jQuery(value).addClass((index % 2) ? 'oddRow' : 'evenRow');
		});
	}
	self.calcShowingNow = function() {
		var showingNow = [];
		jQuery(".bmlt-data-row:not(.hide)").each(function (index, value) {
			const rowId = value.id.split("-");
			showingNow.push(rowId[rowId.length-1]);
		});
		showingNow = [...new Set(showingNow)];
		return showingNow;
	}
	self.filterMeetingsFromView = function () {
		jQuery(".group-header").removeClass("hide");
		jQuery(".meeting-group").removeClass("hide");
		jQuery(".bmlt-data-row").removeClass("hide");
		jQuery(".filter-dropdown").each(function(index, filter) {
			const dataValue = filter.value.replace("a-", "");
			if (dataValue === "") return;
			const dataType = filter.getAttribute("data-pointer").toLowerCase();
			if (dataType !== "formats" && dataType !== "languages" && dataType !== "venues" && dataType !== "common_needs") {
				jQuery(".bmlt-data-row").not("[data-" + dataType + "='" + dataValue + "']").addClass("hide");
			} else {
				jQuery(".bmlt-data-row").not("[data-" + dataType + "~='" + dataValue + "']").addClass("hide");
			}
		});
		this.addStripes();
		var showingNow = this.calcShowingNow();
		self.updateMeetingCount(showingNow);
		self.updateFilters();
		if (croutonMap) croutonMap.fillMap(showingNow);
		self.showView(self.currentView, showingNow.length);
	};
	self.resetFilter = function () {
		croutonMap.filterVisible(false);
		if ((self.config.map_page && self.filtering) || self.config.show_map) croutonMap.fillMap();
		self.filtering = false;
		self.updateFilters();
		self.updateMeetingCount();
		jQuery(".filter-dropdown").val(null).trigger("change");
		jQuery(".group-header").removeClass("hide");
		jQuery(".meeting-group").removeClass("hide");
		jQuery(".bmlt-data-row").removeClass("hide");
		jQuery(".evenRow").removeClass("evenRow");
		jQuery(".oddRow").removeClass("oddRow");
	};
	self.updateFilters = function() {
		if (!self.dropdownData) return;
		const getId = function (row) {return row.id.replace("meeting-data-row-", "")};
		// The options available for this filter have to take into account all other filters, but ignore the
		// filter itself (otherwise there's only one option!)
		self.dropdownData.forEach(function(dropdown, index) {
			let hidden = [];
			jQuery(".filter-dropdown").each(function(index, filter) {
				if (filter.id === dropdown.elementId) return;
				const dataValue = filter.value.replace("a-", "");
				if (dataValue === "") return;
				filteringDropdown = true;
				const dataType = filter.getAttribute("data-pointer").toLowerCase();
				if (dataType !== "formats" && dataType !== "languages" && dataType !== "venues" && dataType !== "common_needs") {
					jQuery(".bmlt-data-row").not("[data-" + dataType + "='" + dataValue + "']").each((i,item) => hidden.push(getId(item)));
				} else {
					jQuery(".bmlt-data-row").not("[data-" + dataType + "~='" + dataValue + "']").each((i,item) => hidden.push(getId(item)));
				}
			});
			hidden = [...new Set(hidden)];
			let showing = self.meetingData.filter((m) => !(hidden.includes(m.id_bigint)));
			dropdown.optionsShowing = dropdown.uniqueData(showing).map((o) => dropdown.optionName(o));
		});
	}
	self.renderStandaloneMap = function (selector, context, callback=null, fitBounds=true) {
		hbs_Crouton['localization'] = self.localization;
		crouton_Handlebars.registerPartial('meetings', hbs_Crouton.templates['meetings']);
		crouton_Handlebars.registerPartial('meetingsPlaceholders', hbs_Crouton.templates['meetingsPlaceholders']);
		crouton_Handlebars.registerPartial('bydays', hbs_Crouton.templates['byday']);
		crouton_Handlebars.registerPartial('formatPopup', hbs_Crouton.templates['formatPopup']);
		window.crouton = self;
		croutonMap.initialize(self.createBmltMapElement(),self.meetingData,context,null,fitBounds,callback,self.config['noMap']);
	}
	self.retrieveGeolocation = function() {
		return new Promise((resolve, reject) => {
			if (window.storedGeolocation) {
				resolve(window.storedGeolocation);
			} else if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition((position) => {
					window.storedGeolocation = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					};
					resolve(window.storedGeolocation);
				}, (error) => {
					reject(new Error('Error getting geolocation: ' + error.message));
				});
			} else {
				reject(new Error('Geolocation is not supported by this browser.'));
			}
		});
	};
	self.getCurrentLocation = function(callback) {
		self.gretrieveGeolocation().then(position => {
			callback(position);
		}).catch(error => {
			jQuery('.geo').removeClass("hide").addClass("show").html(`<p>${error.message}</p>`);
		});
	};
	self.renderView = function (selector, context, callback, fitBounds) {
		hbs_Crouton['localization'] = self.localization;
		if (self.config.groups) {
			crouton_Handlebars.registerPartial('group', hbs_Crouton.templates['group']);
			crouton_Handlebars.registerPartial('groupRows', hbs_Crouton.templates['groupRows']);
		} else {
			crouton_Handlebars.registerPartial('meetings', hbs_Crouton.templates['meetings']);
			crouton_Handlebars.registerPartial('bydays', hbs_Crouton.templates['byday']);
			crouton_Handlebars.registerPartial('weekdays', hbs_Crouton.templates['weekdays']);
		}
		crouton_Handlebars.registerPartial('meetingsPlaceholders', hbs_Crouton.templates['meetingsPlaceholders']);
		crouton_Handlebars.registerPartial('header', hbs_Crouton.templates['header']);
		crouton_Handlebars.registerPartial('byfields', hbs_Crouton.templates['byfield']);
		crouton_Handlebars.registerPartial('formatPopup', hbs_Crouton.templates['formatPopup']);
		var template = self.config.groups ? hbs_Crouton.templates['groupMain'] : hbs_Crouton.templates['main'];
		jQuery(selector).html(template(context));
		callback();
	};
	self.updateMeetingCount = function(showingNow=null) {
		var self = this;
		let meetingCount = self.meetingData.length;
		if (self.meetingCountCallback) self.meetingCountCallback(meetingCount);
		if (self.groupCountCallback) self.groupCountCallback(
			self.config.groups ? self.config.meetingData.length : self.convertToGroups(self.config.meetingData).length
		);
		addLive = function(id) {return id+", "+id+"-live"};
		if (showingNow !== null) {
			meetingCount = showingNow.length;
			addLive = function(id) {return id+"-live"};
		}
		self.showingNowCount = meetingCount;
		jQuery(".crouton_root_service_body").each(function() {
			var text = "";
			var field = 'name';
			if (this.dataset.field) field = this.dataset.field;
			if (self.config['service_body'].length > 0) {
				const sb = self.getServiceBodyDetails(self.config['service_body'][0]);
				if (sb) text = sb[field] ? sb[field] : "";
			}
			jQuery(this).text(text);
		});
		jQuery(addLive('#bmlt_tabs_meeting_count')).text(meetingCount);
		jQuery(addLive('#bmlt_tabs_group_count')).each(function(){
			var filteredMeetings = self.meetingData;
			if (showingNow!==null) filteredMeetings = self.meetingData.filter((m) => showingNow.includes(m.id_bigint));
			const groups = self.config.groups ? filteredMeetings : self.convertToGroups(filteredMeetings);
			jQuery(this).text(arrayUnique(groups).length);
		});
		jQuery(addLive('#bmlt_tabs_service_body_names')).each(function() {
			var filteredMeetings = self.meetingData;
			if (showingNow!==null) filteredMeetings = self.meetingData.filter((m) => showingNow.includes(m.id_bigint));
			var ids = getUniqueValuesOfKey(filteredMeetings, 'service_body_bigint');
			var me = this;
			self.getServiceBodies(ids, false).then(function (service_bodies) {
				var n = service_bodies.length;
				var names = service_bodies.map((m)=>m['name']);
				names.sort();
				var ret = "";
				if (n===1) {
					ret = names[0];
				}
				else {
					ret = names[0];
					for (var j = 1; j < n-1; j++) {
						ret += ', ';
						ret += names[j];
					}
					ret += ' and ' + names[n-1];
				}
				jQuery(me).text(ret);
			});
		});
	}
	self.getServiceBodies = function(service_bodies_id, requires_parents=true) {
		var url = this.config['root_server'] + '/client_interface/jsonp/?switcher=GetServiceBodies'
			+ (requires_parents ? '&parents=1' : '') + getServiceBodiesQueryString(service_bodies_id);
		return fetchJsonp(url)
			.then(function(response) {
				return response.json();
			});
	};

	self.getMasterFormats = function() {
		var url = this.config['root_server'] + '/client_interface/jsonp/?switcher=GetFormats&lang_enum=en&key_strings[]=TC&key_strings[]=VM&key_strings[]=HY';
		return fetchJsonp(url)
			.then(function(response) {
				return response.json();
			});
	}

	self.errorHandler = function(msg) {
		jQuery('.geo').removeClass("hide").addClass("show").html('');
	};

	self.handlebars = function(meetingDetailsData, elements) {
		var mustDoMap = false;
		handlebarMapOptions = [];
		crouton_Handlebars.registerHelper('crouton_map', function(options) {
			mustDoMap = true;
			self.handlebarMapOptions = options.hash;
			if (!self.handlebarMapOptions.zoom) self.handlebarMapOptions.zoom = 14;
			self.handlebarMapOptions.lat = parseFloat(meetingDetailsData.latitude);
			self.handlebarMapOptions.lng = parseFloat(meetingDetailsData.longitude);
			return "<div id='bmlt-handlebars-map' class='bmlt-map'></div>"
		});
		var parser = new DOMParser();

		while (elements.length > 0) {
			var element = elements.item(0);
			if (!element.firstChild) {
				console.log('<bmlt-handlebar> tag must have at least one child');
				element.remove();
				continue;
			}
			var templateString = '';
			if (element.firstChild.nodeType === 1) {
				if (!element.firstChild.firstChild || element.firstChild.firstChild.nodeType !== 3) {
					console.log('<bmlt-handlebar> tag: cannot find textnode');
					element.remove();
					continue;
				}
				templateString = element.firstChild.firstChild.textContent;
			} else if (element.firstChild.nodeType === 3) {
				templateString = element.firstChild.textContent;
			}
			var handlebarResult;
			try {
				var template = crouton_Handlebars.compile(templateString);
				handlebarResult = template(meetingDetailsData);
			} catch (e) {
				console.log(e);
				handlebarResult = e.message;
			}
			var htmlDecode = parser.parseFromString('<body>'+handlebarResult+'</body>', "text/html");
			if (!htmlDecode.body || !htmlDecode.body.firstChild) {
				console.log('<bmlt-handlebar> tag: could not parse the Handlebars result');
				element.replaceWith('<bmlt-handlebar> tag: could not parse the Handlebars result');
				continue;
			}
			var firstPart = htmlDecode.body.firstChild;
			var brothers = [];
			var thisPart = firstPart;
			var nextPart = null;
			while (nextPart = thisPart.nextSibling) {
				thisPart = nextPart;
				brothers.push(thisPart);
			}
			element.replaceWith(firstPart);
			if (brothers) firstPart.after(...brothers);
		}
		if (mustDoMap) {
			croutonMap.loadPopupMap("bmlt-handlebars-map", meetingDetailsData, self.handlebarMapOptions);
		}
	}
	self.meetingCountCallback = null;
	self.grouoCountCallback = null;
	Crouton.prototype.meetingCount = function(f) {
		self.meetingCountCallback = f;
	}
	Crouton.prototype.groupCount = function(f) {
		self.groupCountCallback = f;
	}
	Crouton.prototype.filterNext24 = function(filterNow = true) {
		if (!filterNow) {
			jQuery("#filter-dropdown-next24").val('a-');
			self.filterMeetingsFromView();
			return;
		}
		const date = new Date();
		const dayNow = date.getDay();
		const hour = date.getHours();
		const mins = date.getMinutes();
		const next24 = self.meetingData.filter(function(meeting) {
			var weekday = meeting.weekday_tinyint - 1;
			if (weekday == dayNow) {
				var time = meeting.start_time.toString().split(':');
				var meetingHour = parseInt(time[0]);
				if (meetingHour > hour) {
					return true;
				}
				if (meetingHour == hour) {
					if (parseInt(time[1]) > mins) {
						return true;
					}
				}
			} else if (weekday == (dayNow + 1) % 7) {
				return true;
			}
			return false;
		}).map((m)=>m.id_bigint);
		jQuery(".bmlt-data-row").each(function(index,row) {
			row.dataset.next24 = (next24.includes(row.id.split('-').pop())) ? '1' : '0';
		});
		jQuery("#filter-dropdown-next24").val('a-1');
		self.filterMeetingsFromView();
	}

	self.toFarsinNumber = function( n ) {
		const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
		const ampm = {'AM':'صبح', 'PM':'بعدازظهر'};
		n = n.replace(/\d/g, x => farsiDigits[x]);
		n = n.replace(/AM|am/g, ampm['AM']);
		n = n.replace(/PM|pm/g, x => ampm['PM']);
		return n;
	}
	self.enrichMeetings = function (meetingData) {
		var meetings = [];

		let queryStringChar = '?';
		if (self.config.meeting_details_href) {
			if (self.config.meeting_details_href.indexOf('?') >= 0) queryStringChar = '&';
		}
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
			if (self.config.language === 'fa-IR') {
				meetingData[m]['start_time_formatted'] = self.toFarsinNumber(meetingData[m]['start_time_formatted']);
				meetingData[m]['end_time_formatted'] = self.toFarsinNumber(meetingData[m]['end_time_formatted']);
			}

			// back to bmlt day
			meetingData[m]['day_of_the_week'] = meetingData[m]['start_time_raw'].isoWeekday() === 7 ? 1 : meetingData[m]['start_time_raw'].isoWeekday() + 1;
			meetingData[m]['formatted_day'] = self.localization.getDayOfTheWeekWord(meetingData[m]['day_of_the_week']);

			var formats = meetingData[m]['formats'].split(",");
			var formats_expanded = [];
			let formatRootServer = self.formatsData.filter((f)=>f['root_server_uri'] == meetingData[m]['root_server_uri']);
			meetingData[m]['wheelchair'] = false;
			for (var f = 0; f < formats.length; f++) {
				for (var g = 0; g < formatRootServer.length; g++) {
					if (formats[f] === formatRootServer[g]['key_string']) {
						if (formatRootServer[g]['world_id'] == 'WCHR') meetingData[m]['wheelchair'] = true;
						formats_expanded.push(
							{
								"id": formatRootServer[g]['id'],
								"key": formats[f],
								"name": formatRootServer[g]['name_string'],
								"description": formatRootServer[g]['description_string'],
								"type": formatRootServer[g]['format_type_enum'],
							}
						)
					}
				}
			}

			meetingData[m]['venue_type'] = parseInt(meetingData[m]['venue_type']);
			meetingData[m]['venue_type_name'] = getVenueTypeName(meetingData[m]);
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
			meetingData[m]['share_word'] = self.localization.getWord('share').toUpperCase();
			meetingData[m]['report_update_word'] = self.localization.getWord('report update');
			meetingData[m]['show_qrcode'] = self.config['show_qrcode'];
			for (var k in meetingData[m]) {
				if (meetingData[m].hasOwnProperty(k) && typeof meetingData[m][k] === 'string') {
					if (meetingData[m][k].indexOf('#@-@#') !== -1) {
						var split = meetingData[m][k].split('#@-@#');
						meetingData[m][k] = split[split.length - 1];
					}
				}
			}

			var serviceBodyInfo = self.getServiceBodyDetails(meetingData[m]['service_body_bigint'])
			meetingData[m]['serviceBodyUrl'] = serviceBodyInfo["url"];
			meetingData[m]['serviceBodyPhone'] = serviceBodyInfo["helpline"];
			meetingData[m]['serviceBodyName'] = serviceBodyInfo["name"];
			meetingData[m]['serviceBodyDescription'] = serviceBodyInfo["description"];
			meetingData[m]['serviceBodyContactEmail'] = serviceBodyInfo["contact_email"];
			meetingData[m]['serviceBodyType'] = self.localization.getServiceBodyType(serviceBodyInfo["type"]);

			var parentBodyInfo = self.getServiceBodyDetails(serviceBodyInfo["parent_id"]);
			if (parentBodyInfo !== undefined) {
				meetingData[m]['parentServiceBodyId'] = serviceBodyInfo["parent_id"];
				meetingData[m]['parentServiceBodyUrl'] = parentBodyInfo["url"];
				meetingData[m]['parentServiceBodyPhone'] = parentBodyInfo["helpline"];
				meetingData[m]['parentServiceBodyName'] = parentBodyInfo["name"];
				meetingData[m]['parentServiceBodyDescription'] = parentBodyInfo["description"];
				meetingData[m]['parentServiceBodyType'] = self.localization.getServiceBodyType(parentBodyInfo["type"]);
			}

			meetingData[m]['meeting_details_url'] = '';
			if (self.config.meeting_details_href) {
				meetingData[m]['meeting_details_url'] = self.config.meeting_details_href;
				if (meetingData[m]['venue_type'] === 2 && self.config.virtual_meeting_details_href ) {
					meetingData[m]['meeting_details_url'] = self.config.virtual_meeting_details_href;
				}
				meetingData[m]['meeting_details_url'] += queryStringChar + ('meeting-id=' + meetingData[m]['id_bigint']
													   + '&language=' + self.config.language
													   + '&time_format=' + encodeURIComponent(self.config.time_format)
													   + (self.config.force_rootserver_in_querystring ? '&root_server=' + encodeURIComponent(self.config.root_server) : '')
													);
			}
			this.calculateDistance(meetingData[m]);
			meetings.push(meetingData[m])
		}
		if (self.config.groups) {
			return self.convertToGroups(meetings);
		}
		return meetings;
	};
	self.convertToGroups = function(meetings) {
		if (!meetings || !meetings.length) return [];
		if (meetings[0].hasOwnProperty('membersOfGroup')) return meetings;
		if (!meetings[0].hasOwnProperty('group_id')) {
			meetings.forEach((meeting) =>
				meeting['group_id'] = meeting['service_body_bigint'] + '|' + meeting['meeting_name'] +
					((meeting['venue_type'] != 2) ? ('|' + parseFloat(meeting['latitude']).toFixed(6) + '|' + parseFloat(meeting['longitude']).toFixed(6))
												 : ''));
		}
		// There are so many, I think this is faster than using reduce.
		const sorted = meetings.sort((a,b) => {
			if (a['group_id'] < b['group_id']) return -1;
			if (a['group_id'] > b['group_id']) return 1;
			return 0;
		});
		const groups = [];
		let last = null;
		sorted.forEach(function (meeting) {
			if (!meeting['group_id']) {
				groups.push(meeting);
				meeting['membersOfGroup'] = [meeting];
			} else if (!last || meeting['group_id'] != last['group_id']) {
				groups.push(meeting);
				last = meeting;
				last['membersOfGroup'] = [Object.assign({}, last)];
			} else {
				last['membersOfGroup'].push(meeting);
			}
		});
		groups.forEach(function(group) {
			if (group['membersOfGroup'].length > 1) {
				let commonFormats = group['formats'].split(',');
				group['membersOfGroup'].forEach(function(member) {
					const memberFormats = member['formats'].split(',');
					commonFormats = commonFormats.filter(value => memberFormats.includes(value));
				});
				group['formats'] = commonFormats.join(',');
				group['formats_expanded'] = group['formats_expanded'].filter((format) => commonFormats.includes(format['key']));
				group['membersOfGroup'].forEach(function(member) {
					member['formats'] = member['formats'].split(',').filter((f) => !commonFormats.includes(f)).join(',');
					member['formats_expanded'] = member['formats_expanded'].filter((format) => !commonFormats.includes(format['key']));
				});
			}
		});
		return groups;
	}
	Crouton.prototype.updateDistances = function() {
		const self = this;
		var knt = 0;
		jQuery('.meeting-distance').each(function(index) {
			const jThis = jQuery(this);
			const id = jQuery(this).data('id');
			if (!id) return;
			knt++;
			const m = self.meetingData.find((m) => m.id_bigint==id);
			self.calculateDistance(m);
			if (m['distance'] == '') {
				if (!jThis.hasClass('hide')) jThis.addClass('hide');
			} else {
				jThis.removeClass('hide');
				jQuery(this).html(self.localization.getWord('Distance')+': '+m['distance']);
				jQuery(this).closest('tr').data('distance', m['distance_in_km']);
			}
		});
		const parent = jQuery('#byfield_distance_in_km tbody');
		if (parent.length == 0) return;
		if (knt === 0) {
			parent.children().each(function (index) {
				if (!this.id) return;
				const id = this.id.replace("meeting-data-row-", "");
				const m = self.meetingData.find((m) => m.id_bigint==id);
				if (!m) return;
				self.calculateDistance(m);
				if (m['distance'] != '') {
					jQuery(this).data('distance', m['distance_in_km']);
					knt++;
				}
			});
		}
		const sorted = parent.children().sort(function (a, b) {
			const distanceA =parseFloat( jQuery(a).data('distance'));
			const distanceB =parseFloat( jQuery(b).data('distance'));
      		return (distanceA < distanceB) ? -1 : (distanceA > distanceB) ? 1 : 0;
   		});
		parent.html(sorted);
		jQuery("#byfield_distance_in_km tbody .bmlt-data-row").css({cursor: "pointer"});
		jQuery("#byfield_distance_in_km tbody .bmlt-data-row").click(function (e) {
			if (e.target.tagName !== 'A')
				croutonMap.rowClick(parseInt(this.id.replace("meeting-data-row-", "")));
		});
		if (knt > 0) {
			jQuery('#groupingButton_distance_in_km').removeClass('hide');
			self.distanceTabAllowed = true;
		}
	}
	self.setUpPartials = function() {
		crouton_Handlebars.registerHelper('hasBMLT2ics', function() {return crouton.config['bmlt2ics'].length>0;});
		crouton_Handlebars.registerHelper('BMLT2ics', function() {return crouton.config['bmlt2ics'];});
		self.registerPartial('icsButton',
    		'<a href="{{BMLT2ics}}?meeting-id={{id_bigint}}" download="{{meeting_name}}.ics" class="share-button btn btn-primary btn-xs" ><span class="glyphicon glyphicon-download-alt"></span> {{getWord "bmlt2ics"}}</a>');
		self.registerPartial('offerIcsButton', "{{#if (hasBMLT2ics)}}{{> icsButton}}<br/>{{/if}}");
		crouton_Handlebars.registerPartial('directionsButton', hbs_Crouton.templates['directionsButton']);
		crouton_Handlebars.registerPartial('meetingDetailsButton', hbs_Crouton.templates['meetingDetailsButton']);
		self.registerPartial('distance',`
<div class='meeting-distance{{#unless this.distance}} hide{{/unless}}' data-id='{{this.id_bigint}}'>
{{getWord 'Distance'}}: {{this.distance}}
</div>`);
		crouton_Handlebars.registerHelper('hasObserverLine', function(name, phone, email) {
    		if (name && name.length > 0) return true;
			if (phone && phone.length > 0) return true;
			if (email && email.length > 0) return true;
			return false;
	});
		self.registerPartial('observerLine',`
{{#if (hasObserverLine name phone email) }}
<div class='observerLine'>Kontact: {{name}} <a href='tel:{{phone}}'>{{phone}}</a> <a href='mailto:{{email}}'>{{email}}</a></div>
</div>{{/if}}`);
			self.registerPartial("meetingDataTemplate", self.config['meeting_data_template']);
			self.registerPartial("metaDataTemplate", self.config['metadata_template']);
			self.registerPartial("observerTemplate", self.config['observer_template']);
			self.registerPartial("meetingpageTitleTemplate", self.config['meetingpage_title_template']);
			self.registerPartial("meetingpageContentsTemplate", self.config['meetingpage_contents_template']);
			self.registerPartial("meetingCountTemplate", self.config['meeting_count_template']);
			self.registerPartial("meetingLink", self.config['meeting_link_template']);
			self.registerPartial("meetingModal", self.config['meeting_modal_template']);
			self.registerPartial('group_map', "<div id='bmlt-group-map' class='bmlt-map'></div>")
	}
	self.calculateDistance = function(meetingData) {
		meetingData['distance'] = '';
		if (meetingData['venue_type'] != 2) {
			const point = {"lat": meetingData['latitude'], "lng": meetingData['longitude']};
			const distances = croutonMap.getDistanceFromSearch(point);
			if (distances) {
				meetingData['distance_in_km'] = distances.km;
				meetingData['distance_in_miles'] = distances.miles;

				if (self.config['distance_units'] === "km") {
					if (meetingData['distance_in_km']) {
						const d = meetingData['distance_in_km'];
						if (d < 1) {
							meetingData['distance'] = Math.round( d * 1000) + 'm';
						}
						else {
							meetingData['distance'] = (Math.round(d * 10) / 10).toFixed(1) + 'km';
						}
					}
				} else if (meetingData['distance_in_miles']) {
					const d = meetingData['distance_in_miles'];
					meetingData['distance'] = (Math.round(d * 100) / 100).toFixed(2) + ' miles';
				}
			}
		}
	}
	self.showMessage = function(message) {
		jQuery("#" + self.config['placeholder_id']).html("crouton: " + message);
		jQuery("#" + self.config['placeholder_id']).removeClass("hide");
	};
	self.getUsedVenueType = function(meetings) {
		let venueTypes = getUniqueValuesOfKey(meetings, 'venue_type');
		if (venueTypes.includes(3)) return Object.values(self.localization.getWord("venue_type_choices"));
		if (venueTypes.length === 2) return Object.values(self.localization.getWord("venue_type_choices"));
		if (venueTypes[0] === 1) return [self.localization.getWord("venue_type_choices").IN_PERSON];
		return [self.localization.getWord("venue_type_choices").VIRTUAL];
	}
	self.getUsedVisibility = function(meetings) {
		return [{name: 'Visible', value: 1}];
	}
	self.getUsedNext24 = function(meetings) {
		return [{name: 'Next24', value: 1}];
	}
	self.isEmpty = function(obj) {
		for (var key in obj) {
			if(obj.hasOwnProperty(key))
				return false;
		}
		return true;
	};
	self.createBmltMapElement = function() {
		if (!document.getElementById('bmlt-map')) {
			jQuery("#bmlt-tabs").before("<div id='bmlt-map' class='bootstrap-bmlt bmlt-map "+self.localization.getWord('css-direction')+" bmlt_map_container_div'></div>");
		}
		return 'bmlt-map';
	}
	if (typeof window.croutonMap === 'undefined') {
		window.croutonMap = new MeetingMap(self.config);
		if (self.config['map_search']) self.searchMap();
		else self.meetingSearch();
	}
	else if (!window.croutonMap.hasMapSearch()) self.meetingSearch();
}

Crouton.prototype.setConfig = function(config) {
	var self = this;
	const deprecatedNames = {
		button_filters: 'grouping_buttons',
		button_format_filters: 'formattype_grouping_buttons',
	}
	for (var propertyName in deprecatedNames) {
		if (config.hasOwnProperty(propertyName)) {
			config[deprecatedNames[propertyName]] = config[propertyName];
			delete config[deprecatedNames[propertyName]];
		}
	}
	for (var propertyName in config) {
		if (propertyName.indexOf("_template") > 0 && config[propertyName].trim() === "") {
			continue;
		} else if (propertyName.indexOf("int_") === -1) {
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
	if (self.config.show_map === "embed") {
		self.config.show_map = false;
		self.config.map_page = true;
	}
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
	if (self.config.groups) {
		self.config["view_by"] = "city";
		self.config["include_weekday_button"] = false;
		self.config["has_tabs"] = false;
	}
	if (self.config["view_by"].endsWith('day')) {
		self.config["include_weekday_button"] = true;
	}
	self.currentView = self.config["view_by"];

	if (self.config["template_path"] == null) {
		self.config["template_path"] = "templates"
	}
	if (self.config["BMLTPlugin_images"] == null) {
		self.config["BMLTPlugin_images"] = self.config["template_path"];
	}
	if (self.config["BMLTPlugin_throbber_img_src"] == null) {
		self.config["BMLTPlugin_throbber_img_src"] = self.config["template_path"]+'/Throbber.gif';
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
};

Crouton.prototype.doFilters = function() {
	return this.filterMeetingsFromView();
}
Crouton.prototype.getServiceBodyDetails = function(serviceBodyId) {
	var self = this;
	for (var s = 0; s < self.all_service_bodies.length; s++) {
		var service_body = self.all_service_bodies[s];
		if (service_body['id'] === serviceBodyId) {
			return service_body;
		}
	}
}

Crouton.prototype.doHandlebars = function() {
	var elements = document.getElementsByTagName('bmlt-handlebar');
	if (elements.length === 0) {
		console.log('No <bmlt-handlebar> tags found');
		return;
	};
	var self = this;
	self.lock(function() {
		if (self.isEmpty(self.meetingData)) {
			for (let i = 0; i < elements.length; i++) {
				var element = elements.item(i);
				element.innerHTML = "Meeting not found!";
			}
			return;
		}
		var promises = [self.getServiceBodies([self.meetingData[0]['service_body_bigint']])];
		Promise.all(promises)
			.then(function(data) {
				hbs_Crouton['localization'] = self.localization;
				self.all_service_bodies = [];
				var service_bodies = data[0];
				for (var i = 0; i < service_bodies.length; i++) {
					self.all_service_bodies.push(service_bodies[i]);
				}
				var enrichedMeetingData = self.enrichMeetings(self.meetingData);
				self.setUpPartials();
				var customStartupTemplate = crouton_Handlebars.compile('{{startup}}');
				customStartupTemplate(enrichedMeetingData);
				var customEnrichTemplate = crouton_Handlebars.compile('{{enrich this}}');
				customEnrichTemplate(enrichedMeetingData[0]);

				self.handlebars(enrichedMeetingData[0], elements);
				jQuery('.get-directions-modal').on('click', openDirectionsModal);
			});
	});
};

Crouton.prototype.meetingModal = function(meetingId) {
	let self = this;
	let meeting = self.meetingData.find((m) => m.id_bigint == meetingId);
	if (self.config.groups) {
		croutonMap.openGroupModal(meeting);
		return;
	}
	const tabs = document.getElementById('bmlt-tabs');

	let el = document.createElement('bmlt-handlebar');
	tabs.appendChild(el);
	let span = document.createElement('span');
	el.appendChild(span);
	span.textContent = self.config.meetingpage_frame_template;
	self.handlebars(meeting, tabs.getElementsByTagName('bmlt-handlebar'));
	[...tabs.getElementsByClassName('modal-close')].forEach((elem)=>elem.addEventListener('click', (e)=>{croutonMap.closeModalWindow(e.target); document.getElementById('meeting_modal').remove()}));
	let mm = document.getElementById('meeting_modal');
	document.body.appendChild(mm);
	jQuery('#meeting_modal .get-directions-modal').on('click', openDirectionsModal);
	croutonMap.openModalWindow(mm, true);
	croutonMap.showMap(true);
	let visibleMeetings = jQuery('.bmlt-data-row:visible');
	let index = -1;
	const prefix = "meeting-data-row-";
	for (k=0; k<visibleMeetings.length; k++) {
		if (visibleMeetings[k].id===prefix+meetingId) {
			index = k;
			break;
		}
	};
	let doSwipe = function(swipedir) {
		switch(swipedir) {
			case 'left':
				index = index+1;
				break;
			case 'right':
				index = index-1;
				break;
			default:
				index = -1;
		}
		if (index >= 0 && index < visibleMeetings.length) {
			const newMeeting = visibleMeetings[index];
			meetingId = newMeeting.id.substring(prefix.length);
			mm.getElementsByClassName('modal-close').item(0).dispatchEvent(new MouseEvent("click"));
			self.meetingModal(meetingId);
		}
	}
	swipedetect(mm, doSwipe);
	if (index <= 0) {
		jQuery(".modal-left").addClass("hide");
	} else {
		mm.getElementsByClassName('modal-left').item(0).addEventListener("click", ev=>doSwipe("right"));
	}
	if (index >= visibleMeetings.length-1) {
		jQuery(".modal-right").addClass("hide");
	} else {
		mm.getElementsByClassName('modal-right').item(0).addEventListener("click", ev=>doSwipe("left"));
	}
}
Crouton.prototype.searchMap = function() {
	var self = this;
	self.distanceTabAllowed = true;
	if (!self.config.map_search || typeof self.config.map_search !== 'object') {
		self.config.map_search = {
			width: -50,
			auto: true,
			zoom: 14
		};
	} else {
		if (!self.config.map_search.width) self.config.map_search.width = -50;
		if (!self.config.map_search.location && !self.config.map_search.coordinates_search)
			self.config.map_search.auto = true;
		if (!self.config.map_search.zoom) {
			self.config.map_search.zoom = 14;
		}
	}
	self.config['map_page'] = false;
	self.config['show_map'] = false;
	var body = jQuery("body");
	if (self.config['theme'] !== '') {
		body.append("<div id='custom-css'><link rel='stylesheet' type='text/css' href='" + self.config['template_path'] + '/themes/' + self.config['theme'] + ".css'>");
	}

	body.append("<div id='custom-css'><style type='text/css'>" + self.config['custom_css'] + "</style></div>");

	self.meetingData = null;
	self.renderStandaloneMap("#" + self.config['placeholder_id'], {
		"config": self.config,
		"meetings": {
			"weekdays": [],
			"groupingButtons": [],
			"formattypeGroupingButtons": [],
			"bydays": [],
			"meetingCount": 0,
			"meetingData": []
		},
		"dropdownData": [],
		"location": {'latitude':0,'longitude':0,'zoom':10}  // TODO: Where is this used?
	});
}
Crouton.prototype.render = function(doMeetingMap = false, fitBounds=true) {
	var self = this;

	self.lock(function() {
		var body = jQuery("body");
		if (self.config['theme'] !== '') {
			body.append("<div id='custom-css'><link rel='stylesheet' type='text/css' href='" + self.config['template_path'] + '/themes/' + self.config['theme'] + ".css'>");
		}

		body.append("<div id='custom-css'><style type='text/css'>" + self.config['custom_css'] + "</style></div>");

		if (self.isEmpty(self.meetingData)) {
			self.showMessage("No meetings found for parameters specified.");
			if (self.config['refresh_map']) {
				croutonMap.refreshMeetings(self.meetingData, fitBounds, true);
			}
			return;
		}

		self.unique_service_bodies_ids = getUniqueValuesOfKey(self.meetingData, 'service_body_bigint').sort();
		var promises = [self.getMasterFormats(), self.getServiceBodies(self.unique_service_bodies_ids)];
		Promise.all(promises)
			.then(function(data) {
				self.all_service_bodies = [];
				self.masterFormatCodes = data[0];
				var service_bodies = data[1];
				//TODO: why does he do this???
				for (var i = 0; i < service_bodies.length; i++) {
					self.all_service_bodies.push(service_bodies[i]);
				}
				if (!jQuery.isEmptyObject(self.formatsData)) {
					self.formatsData = self.formatsData.sortByKey('name_string');
				}

				var enrichedMeetingData = self.enrichMeetings(self.meetingData);
				if (self.config.groups) self.meetingData = enrichedMeetingData;
				self.setUpPartials();

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
				var groupingButtonsData = {};
				var formattypeGroupingButtonsData = {};
				var weekdaysData = [];
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

					for (var f = 0; f < self.config.grouping_buttons.length; f++) {
						var groupByName = self.config.grouping_buttons[f]['field'];
						if (groupByName.startsWith('distance')) continue;
						var groupByData = getUniqueValuesOfKey(daysOfTheWeekMeetings, groupByName).sort();
						for (var i = 0; i < groupByData.length; i++) {
							var groupByMeetings = daysOfTheWeekMeetings.filterByObjectKeyValue(groupByName, groupByData[i]);
							if (groupingButtonsData.hasOwnProperty(groupByName) && groupingButtonsData[groupByName].hasOwnProperty(groupByData[i])) {
								groupingButtonsData[groupByName][groupByData[i]] = groupingButtonsData[groupByName][groupByData[i]].concat(groupByMeetings);
							} else if (groupingButtonsData.hasOwnProperty(groupByName)) {
								groupingButtonsData[groupByName][groupByData[i]] = groupByMeetings;
							} else {
								groupingButtonsData[groupByName] = {};
								groupingButtonsData[groupByName][groupByData[i]] = groupByMeetings;
							}

						}
					}

					for (var f = 0; f < self.config.formattype_grouping_buttons.length; f++) {
						const groupByName = self.config.formattype_grouping_buttons[f]['field'];
						const accordionState = self.config.formattype_grouping_buttons[f].hasOwnProperty('accordionState')
							? self.config.grouping_buttons[b]['accordionState'] : '';
						var groupByData = getUniqueFormatsOfType(daysOfTheWeekMeetings, groupByName);
						if (groupByName=='LANG' && self.config.native_lang && self.config.native_lang.length > 0) {
							groupByData = groupByData.filter((f) => f.key != self.config.native_lang);
						}
						for (var i = 0; i < groupByData.length; i++) {
							var groupByMeetings = daysOfTheWeekMeetings.filter((item) => item.formats_expanded.map(f => f.key).indexOf(groupByData[i].key) >= 0);
							if (formattypeGroupingButtonsData.hasOwnProperty(groupByName) && formattypeGroupingButtonsData[groupByName].hasOwnProperty(groupByData[i].description)) {
								formattypeGroupingButtonsData[groupByName][groupByData[i].description].group = formattypeGroupingButtonsData[groupByName][groupByData[i].description].group.concat(groupByMeetings);
							} else if (formattypeGroupingButtonsData.hasOwnProperty(groupByName)) {
								formattypeGroupingButtonsData[groupByName][groupByData[i].description] = {};
								formattypeGroupingButtonsData[groupByName][groupByData[i].description].accordionState = accordionState;
								formattypeGroupingButtonsData[groupByName][groupByData[i].description].group = groupByMeetings;
							} else {
								formattypeGroupingButtonsData[groupByName] = {};
								formattypeGroupingButtonsData[groupByName][groupByData[i].description] = {};
								formattypeGroupingButtonsData[groupByName][groupByData[i].description].accordionState = accordionState;
								formattypeGroupingButtonsData[groupByName][groupByData[i].description].group = groupByMeetings;
							}
						}
					}
					day_counter++;
				}

				var groupingButtonsDataSorted = {};
				for (var b = 0; b < self.config.grouping_buttons.length; b++) {
					const groupByName = self.config.grouping_buttons[b]['field'];
					const accordionState = self.config.grouping_buttons[b].hasOwnProperty('accordionState')
						? self.config.grouping_buttons[b]['accordionState'] : '';
					groupingButtonsDataSorted[groupByName] = {};
					if (groupByName.startsWith('distance')) {
						groupingButtonsDataSorted[groupByName][self.localization.getWord('Sorted by Distance')] = {};
						if (self.config.map_search) {
							groupingButtonsDataSorted[groupByName][self.localization.getWord('Sorted by Distance')].group = [...self.meetingData].sort((a,b) => a['distance_in_km'] - b['distance_in_km']);
						} else { // when not crouton_map, sorting byy distance is triggered by an action in meeting_map.
							groupingButtonsDataSorted[groupByName][self.localization.getWord('Sorted by Distance')].group = [...self.meetingData].filter(m => m.venue_type != 2);
						}
						groupingButtonsDataSorted[groupByName][self.localization.getWord('Sorted by Distance')].accordionState = 'non-collapsable';
						continue;
					}
					var sortKey = [];

					for (var groupingButtonsDataItem in groupingButtonsData[groupByName]) {
						sortKey.push(groupingButtonsDataItem);
					}

					sortKey.sort();

					for (var s = 0; s < sortKey.length; s++) {
						groupingButtonsDataSorted[groupByName][sortKey[s]] = {};
						groupingButtonsDataSorted[groupByName][sortKey[s]].group = groupingButtonsData[groupByName][sortKey[s]];
						groupingButtonsDataSorted[groupByName][sortKey[s]].accordionState = accordionState;
					}
				}

				self.dayNamesSequenced = self.config.day_sequence.map((d)=>self.localization.getDayOfTheWeekWord(d));
				self.dropdownData = [];
				if (self.config.has_days) self.dropdownData.push(
					{placeholder: self.localization.getWord('weekday'), pointer: 'weekdays', elementId: "filter-dropdown-weekdays",
					 uniqueData: (meetings) => sortListByList(getUniqueValuesOfKey(meetings, "formatted_day"), self.dayNamesSequenced),
					 objectPointer: convertToPunyCode, optionName: (s)=>s});
				if (self.config.has_states) self.dropdownData.push(
					{placeholder: self.localization.getWord('states'), pointer: 'States', elementId: "filter-dropdown-states",
						uniqueData: (meetings) => getUniqueValuesOfKey(meetings, 'location_province').sort(),
						objectPointer: convertToPunyCode, optionName: (s)=>s});
				if (self.config.has_sub_province) self.dropdownData.push(
					{placeholder: self.localization.getWord('counties'), pointer: 'Counties', elementId: "filter-dropdown-sub_province",
						uniqueData: (meetings) => getUniqueValuesOfKey(meetings, 'location_sub_province').sort(),
						objectPointer: convertToPunyCode, optionName: (s)=>s});
				if (self.config.has_cities) self.dropdownData.push(
					{placeholder: self.localization.getWord('cities'), pointer: 'Cities', elementId: "filter-dropdown-cities",
					 uniqueData: (meetings) => getUniqueValuesOfKey(meetings, 'location_municipality').sort(),
					 objectPointer: convertToPunyCode, optionName: (s)=>s});
				if (self.config.has_neighborhoods) self.dropdownData.push(
					{placeholder: self.localization.getWord('neighborhood'), pointer: 'Neighborhoods', elementId: "filter-dropdown-neighborhoods",
						uniqueData: (meetings) => getUniqueValuesOfKey(meetings, 'location_neighborhood').sort(),
						objectPointer: convertToPunyCode, optionName: (s)=>s});
				if (self.config.has_zip_codes) self.dropdownData.push(
					{placeholder: self.localization.getWord('postal_codes'), pointer: 'Zips', elementId: "filter-dropdown-zipcodes",
						uniqueData: (meetings) => getUniqueValuesOfKey(meetings, 'location_postal_code_1').sort(),
						objectPointer: convertToPunyCode, optionName: (s)=>s});
				if (self.config.has_locations) self.dropdownData.push(
					{placeholder: self.localization.getWord('locations'), pointer: 'Locations', elementId: "filter-dropdown-locations",
						uniqueData: (meetings) => getUniqueValuesOfKey(meetings, 'location_text').map((s)=>s.replace(/(<([^>]+)>)/gi, "")).sort(),
						objectPointer: convertToPunyCode, optionName: (s)=>s});
				if (self.config.has_regions) self.dropdownData.push(
					{placeholder: self.localization.getWord('regions'), pointer: 'Regions', elementId: "filter-dropdown-regions",
						uniqueData: (meetings) => self.all_service_bodies.filter((sb)=>getUniqueValuesOfKey(meetings,'parentServiceBodyId').includes(sb.id)).sortByKey('name'),
						objectPointer: (a) => convertToPunyCode(a.name), optionName: (a)=>a.name});
				if (self.config.has_areas) self.dropdownData.push(
					{placeholder: self.localization.getWord('areas'), pointer: 'Areas', elementId: "filter-dropdown-areas",
						uniqueData: (meetings) => self.all_service_bodies.filter((sb)=>getUniqueValuesOfKey(meetings,'service_body_bigint').includes(sb.id)).sortByKey('name'),
						objectPointer: (a) => a.id, optionName: (a)=>a.name});
				if (self.config.has_groups) self.dropdownData.push(
					{placeholder: self.localization.getWord('groups'), pointer: 'Groups', elementId: "filter-dropdown-groups",
					uniqueData: (meetings) => getUniqueValuesOfKey(meetings, 'meeting_name').sort(),
					objectPointer: convertToPunyCode, optionName: (s)=>s});
				if (self.config.has_venues) self.dropdownData.push(
					{placeholder: self.localization.getWord('venue_types'), pointer: 'Venues', elementId: "filter-dropdown-venues",
						uniqueData: (meetings) => self.getUsedVenueType(meetings),
						objectPointer: convertToPunyCode, optionName: (s)=>s});
				if (self.config.has_formats) self.dropdownData.push(
					{placeholder: self.localization.getWord('formats'), pointer: 'Formats', elementId: "filter-dropdown-formats",
						uniqueData: (meetings) => getUniqueFormats(meetings),
						objectPointer: (f) => convertToPunyCode(f.name), optionName: (f)=>f.name});
				if (self.config.has_languages) self.dropdownData.push(
					{placeholder: self.localization.getWord('languages'), pointer: 'Formats', elementId: "filter-dropdown-languages",
						uniqueData: (meetings) => getUniqueFormatsOfType(meetings, 'LANG').filter((f)=>f.key!==self.config.native_lang),
						objectPointer: (f) => convertToPunyCode(f.name), optionName: (f)=>f.name});
				if (self.config.has_common_needs) self.dropdownData.push(
					{placeholder: self.localization.getWord('common_needs'), pointer: 'Formats', elementId: "filter-dropdown-commonneeds",
						uniqueData: (meetings) => getUniqueFormatsOfType(meetings, 'FC3'),
						objectPointer: (f) => convertToPunyCode(f.name), optionName: (f)=>f.name});
				if (doMeetingMap || self.config.show_map || self.config.map_page) self.dropdownData.push(
					{placeholder: '', pointer: 'visible', elementId: "filter-dropdown-visibile",
						uniqueData: (meetings) => self.getUsedVisibility(meetings),
						objectPointer: (s)=>s.value, optionName: (s)=>s.name});
				if (doMeetingMap) self.dropdownData.push(
					{placeholder: '', pointer: 'next24', elementId: "filter-dropdown-next24",
						uniqueData: (meetings) => self.getUsedNext24(meetings),
						objectPointer: (s)=>s.value, optionName: (s)=>s.name});
				let renderer = doMeetingMap ? self.renderStandaloneMap : self.renderView;
				renderer("#" + self.config['placeholder_id'], {
					"config": self.config,
					"meetings": {
						"allMeetings": self.meetingData,
						"weekdays": weekdaysData,
						"groupingButtons": groupingButtonsDataSorted,
						"formattypeGroupingButtons": formattypeGroupingButtonsData,
						"bydays": byDayData,
						"meetingCount": self.meetingData.length,
						"meetingData": self.meetingData
					},
					"dropdownData": self.dropdownData
				}, function () {
					if (!self.config.map_search) {
						jQuery('#groupingButton_distance_in_km').addClass('hide');
					}
					self.addStripes();
					self.calcShowingNow()
					self.updateMeetingCount();
					jQuery('#please-wait').remove();
					if (self.config['map_search'] != null || self.config['show_map']) {
						jQuery(".bmlt-data-row").css({cursor: "pointer"});
						jQuery(".bmlt-data-row").click(function (e) {
							if (e.target.tagName !== 'A')
								croutonMap.rowClick(parseInt(this.id.replace("meeting-data-row-", "")));
						});
					}

					jQuery("#" + self.config['placeholder_id']).addClass("bootstrap-bmlt");
					jQuery("#filter-dropdown-visibile").removeClass("crouton-select").addClass("hide");
					jQuery("#filter-dropdown-next24").removeClass("crouton-select").addClass("hide");
					jQuery(".crouton-select").select2({
						dropdownAutoWidth: true,
						allowClear: false,
						width: "resolve",
						minimumResultsForSearch: 1,
						dropdownCssClass: 'bmlt-drop',
						matcher: function(params, data) {
							if (data.id === "a-")
								return data;
							elementId = data.element.parentElement.id;
							if (params.hasOwnProperty('term')) {
								if (data.text.toUpperCase().indexOf(params.term.toUpperCase()) < 0)
									return null;
							}
							dropdown = self.dropdownData.find((dropdown) => dropdown.elementId === elementId);
							if (typeof dropdown === 'undefined')
								return data;

							if (typeof dropdown.optionsShowing === 'undefined')
								return data;
							if (dropdown.optionsShowing.includes(data.text))
								return data;
							return null;
						}
					});

					jQuery('[data-toggle="popover"]').popover().click(function(e) {e.preventDefault(); e.stopPropagation()});
					jQuery('html').on('click', function (e) {
						if (jQuery(e.target).data('toggle') !== 'popover') {
							jQuery('[data-toggle="popover"]').popover('hide');
						}
					});

					jQuery('.filter-dropdown').on('select2:select', function (e) {
						self.filterMeetingsFromView();
					});

					jQuery("#day").on('click', function () {
						self.showView('day');
					});

					jQuery(".groupingButtonLogic").on('click', function (e) {
						self.showView(e.target.attributes['data-field'].value.toLowerCase());
					});
					jQuery('#groupingButton_embeddedMapPage').on('click', function (e) {
						self.showView('map')
					});
					jQuery('.meeting-group:not(.non-collapsable) .group-header').on('click', function(e) {
						jQuery(e.target.parentElement).toggleClass('closed');
					});
					jQuery('.get-directions-modal').on('click', openDirectionsModal);

					jQuery('.directions-map-modal-close').on('click', function (e) {
						closeDirectionsMapModal()
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

					jQuery('.bmlt-header').removeClass("hide").addClass("show");
					jQuery(".bmlt-tabs").removeClass("hide").addClass("show");

					if (self.config['default_filter_dropdown'] !== "") {
						var filter = self.config['default_filter_dropdown'].toLowerCase().split("=");
						jQuery("#filter-dropdown-" + filter[0]).val('a-' + filter[1]).trigger('change').trigger('select2:select');
					}

					if (self.config['show_map'] && !self.config['refresh_map'] && !doMeetingMap) {
						croutonMap.initialize(self.createBmltMapElement(), self.meetingData);
						jQuery("#bmlt-map").removeClass("hide");
					}
					if (self.config['map_page'] && !doMeetingMap) {
						if (self.meetingData.filter(m => m.venue_type != 2).length==0) {
							jQuery('#groupingButton_embeddedMapPage').addClass('hide');
						}
						else croutonMap.initialize('byfield_embeddedMapPage', self.meetingData);
					}
					if (self.config['refresh_map']) {
						croutonMap.refreshMeetings(self.meetingData, fitBounds, true);
					}
					if (self.config['view_by'] == 'map' && !self.config['map_page'])
						self.config['view_by'] = 'day';
						self.showView(self.config['view_by'], self.meetingData.length);
					if (self.config['on_complete'] != null && isFunction(self.config['on_complete'])) {
						self.config['on_complete']();
					}
				}, !doMeetingMap);
			});
		});
	Crouton.prototype.forceShowMap = function() {
		if (this.config.map_page && jQuery('#byfield_embeddedMapPage').hasClass('hide')) {
			this.mapView();
		}
	}
};

function getTrueResult(options, ctx) {
	return options.fn !== undefined ? options.fn(ctx) : true;
}

function getFalseResult(options, ctx) {
	return options.inverse !== undefined ? options.inverse(ctx) : false;
}

// [deprecated] Retire after root server 2.16.4 is rolled out everywhere.
function getMasterFormatId(code, data) {
	for (var f = 0; f < crouton.masterFormatCodes.length; f++) {
		var format = crouton.masterFormatCodes[f];
		if (format['key_string'] === code && format['root_server_uri'] === data['root_server_uri']) {
			return format['id'];
		}
	}
}

// [deprecated] Retire after root server 2.16.4 is rolled out everywhere.
var masterFormatVenueType = {
	IN_PERSON: "IN_PERSON",
	VIRTUAL: "VIRTUAL",
}

var venueType = {
	IN_PERSON: 1,
	VIRTUAL: 2,
	HYBRID: 3,
}

function getVenueTypeName(data) {
	if (data['venue_type'] === venueType.HYBRID || inArray(getMasterFormatId('HY', data), getFormats(data))) {
		return [crouton.localization.getVenueType(masterFormatVenueType.VIRTUAL), crouton.localization.getVenueType(masterFormatVenueType.IN_PERSON)];
	} else if (data['venue_type'] === venueType.VIRTUAL || inArray(getMasterFormatId('VM', data), getFormats(data))) {
		return [crouton.localization.getVenueType(masterFormatVenueType.VIRTUAL)];
	} else {
		return [crouton.localization.getVenueType(masterFormatVenueType.IN_PERSON)];
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
	var translation = hbs_Crouton.localization.getWord(word);
	if (typeof translation !== 'undefined') return translation;
	console.log("no translation for '"+word+"'");
	// if none found, return the untranslated - better than nothing.
	return word;
});

crouton_Handlebars.registerHelper('formatDataPointer', function(str) {
	return convertToPunyCode(str);
});

crouton_Handlebars.registerHelper('call', function(fn, str) {
	return fn(str);
});

crouton_Handlebars.registerHelper('canShare', function(data, options) {
	return navigator.share ? getTrueResult(options, this) : getFalseResult(options, this);
});

crouton_Handlebars.registerHelper('isOS', function(options) {
	if (isIOSDevice()) {
		return getTrueResult(options, this);
	} else {
		return getFalseResult(options, this);
	}
});

function isIOSDevice() {
    if (navigator.userAgentData && navigator.userAgentData.platform) {
        if (navigator.userAgentData.platform === 'iOS') {
            return true;
        }
    }
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && !window.MSStream;
    return isIOS || isIPadOS;
}

function isAndroidDevice() {
    return /Android/i.test(navigator.userAgent);
}

function isMobileDevice() {
    return isIOSDevice() || isAndroidDevice() || /Mobi|Android/i.test(navigator.userAgent);
}

function createDirectionsOptions() {
    const options = [];
    const isIOS = isIOSDevice();

    // Apple Maps (iOS only)
    if (isIOS) {
        options.push({
            name: crouton.localization.getWord('apple_maps'),
            description: crouton.localization.getWord('apple_maps_desc'),
            icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23007AFF'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
            url: 'https://maps.apple.com/?daddr=${latitude},${longitude}'
        });
    }

    // Google Maps (always available)
    options.push({
        name: crouton.localization.getWord('google_maps'),
        description: crouton.localization.getWord('google_maps_desc_mobile'),
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%234285f4'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
        url: 'https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}'
    });

    // Waze (always available)
    options.push({
        name: crouton.localization.getWord('waze'),
        description: crouton.localization.getWord('waze_desc'),
        icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2300D4FF'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
        url: 'https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes'
    });

    return options;
}

crouton_Handlebars.registerHelper('reportUpdateEnabled', function(data, options) {
	return crouton.config.report_update_url !== "" ? getTrueResult(options, this) : getFalseResult(options, this)
});

crouton_Handlebars.registerHelper('reportUpdateUrl', function() {
	return crouton.config.report_update_url;
});

/**
 * @deprecated Since version 3.12.2, will be removed in a future version.
 */
crouton_Handlebars.registerHelper('isVirtual', function(data, options) {
	return ((data['venue_type'] === venueType.HYBRID || data['venue_type'] === venueType.VIRTUAL) || ((inArray(getMasterFormatId('HY', data), getFormats(data)) && !inArray(getMasterFormatId('TC', data), getFormats(data)))
		|| inArray(getMasterFormatId('VM', data), getFormats(data))))
	&& (data['virtual_meeting_link'] || data['phone_meeting_number'] || data['virtual_meeting_additional_info']) ? getTrueResult(options, this) : getFalseResult(options, this);
});

/**
 * Assumes consistent set of venue type formats (enforced for newly edited meetings in root server 2.16.0 or greater)
 */
crouton_Handlebars.registerHelper('isVirtualOnly', function(data, options) {
	return data['venue_type'] === venueType.VIRTUAL || inArray(getMasterFormatId('VM', data), getFormats(data)) ? getTrueResult(options, this) : getFalseResult(options, this);
});

/**
 * @deprecated Since version 3.12.2 will be removed in a future version.
 */
crouton_Handlebars.registerHelper('isHybrid', function(data, options) {
	return data['venue_type'] === venueType.HYBRID || inArray(getMasterFormatId('HY', data), getFormats(data)) ? getTrueResult(options, this) : getFalseResult(options, this);
});

/**
 * Assumes consistent set of venue type formats (enforced for newly edited meetings in root server 2.16.0 or greater)
 */
crouton_Handlebars.registerHelper('isHybridOnly', function(data, options) {
	return data['venue_type'] === venueType.HYBRID || inArray(getMasterFormatId('HY', data), getFormats(data)) ? getTrueResult(options, this) : getFalseResult(options, this);
});

crouton_Handlebars.registerHelper('isTemporarilyClosed', function(data, options) {
	return inArray(getMasterFormatId('TC', data), getFormats(data)) ? getTrueResult(options, this) : getFalseResult(options, this);
});

crouton_Handlebars.registerHelper('isNotTemporarilyClosed', function(data, options) {
	return !inArray(getMasterFormatId('TC', data), getFormats(data)) ? getTrueResult(options, this) : getFalseResult(options, this);
});

/**
 * Assumes consistent set of venue type formats (enforced for newly edited meetings in root server 2.16.0 or greater)
 */
crouton_Handlebars.registerHelper('isInPersonOrHybrid', function(data, options) {
	return data['venue_type'] !== venueType.VIRTUAL && !inArray(getMasterFormatId('VM', data), getFormats(data)) ? getTrueResult(options, this) : getFalseResult(options, this);
});

/**
 * Assumes consistent set of venue type formats (enforced for newly edited meetings in root server 2.16.0 or greater)
 */
crouton_Handlebars.registerHelper('isInPersonOnly', function(data, options) {
	return data['venue_type'] === venueType.IN_PERSON || (!inArray(getMasterFormatId('VM', data), getFormats(data))
	&& !inArray(getMasterFormatId('HY', data), getFormats(data))) ? getTrueResult(options, this) : getFalseResult(options, this);
});

/**
 * Assumes consistent set of venue type formats (enforced for newly edited meetings in root server 2.16.0 or greater)
 */
crouton_Handlebars.registerHelper('isVirtualOrHybrid', function(data, options) {
	return (data['venue_type'] === venueType.VIRTUAL || data['venue_type'] === venueType.HYBRID) || inArray(getMasterFormatId('VM', data), getFormats(data))
	|| inArray(getMasterFormatId('HY', data), getFormats(data)) ? getTrueResult(options, this) : getFalseResult(options, this);
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
	return new crouton_Handlebars.SafeString("<img alt='qrcode' src='https://quickchart.io/qr?size=100&text=" + encodeURIComponent(link) + "'>");
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
function getUniqueFormats(array){
	return array.reduce(function(carry, val){
		if (!(val.formats_expanded)) return carry;
		return carry.concat(val.formats_expanded.filter((item) => carry.map(f => f.key).indexOf(item.key) < 0));
	},[]).sortByKey('name');
}
function getUniqueFormatsOfType(array, type){
	return array.reduce(function(carry, val){
		if (!(val.formats_expanded)) return carry;
		var fmts = val.formats_expanded.filter((item) => item.type===type);
		if (fmts) {
			carry = carry.concat(fmts.filter((item) => carry.map(f => f.key).indexOf(item.key) < 0));
		}
		return carry;
	},[]).sortByKey('name');
}
Crouton.prototype.renderMeetingCount = function() {
	var self = this;
	self.lock(function() {
		self.updateMeetingCount()
	});
}
Crouton.prototype.simulateFilterDropdown = function() {
	self = this;
	jQuery('.bmlt-page:not(#byfield_embeddedMapPage)').each(function () {
		self.hidePage(this);
	});
	self.filterMeetingsFromView();
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

function sortListByList(source, truth) {
	var goal = [];
	for (var x = 0; x < truth.length; x++) {
		for (var y = 0; y < source.length; y++) {
			if (truth[x] === source[y]) {
				goal.push(source[y])
			}
		}
	}

	return goal;
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

Array.prototype.clone = function() {
	return this.slice();
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
function swipedetect(el, callback){

    var touchsurface = el,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 150, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    handleswipe = callback || function(swipedir){}

    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = 'none'
        startX = touchobj.pageX
        startY = touchobj.pageY
    }, false)


    touchsurface.addEventListener('touchend', function(e){
		if (!e.cancelable) return;
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
    	if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
            swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
			handleswipe(swipedir)
			e.preventDefault()
        }
    }, false)
}
function openDirectionsModal(e) {
	const latitude = jQuery(this).data('latitude');
	const longitude = jQuery(this).data('longitude');

	const savedUrl = localStorage.getItem("croutonDirectionsURL");
	if (savedUrl && savedUrl != null) {
		openDirections(savedUrl, latitude, longitude, false);
		return;
	}
	if (!document.getElementById('directionsMapModal')) {
		const word = crouton.localization.getWord("select_map_app");
		e.target.insertAdjacentHTML("afterend",
`<div id="directionsMapModal" class="directions-map-modal remove-after-use">
                <div class="directions-map-modal-content">
                    <span class="directions-map-modal-close">×</span>
                    <h3>`+word+`</h3>
                    <div id="directionsMapOptions"></div>
                </div>
</div>`
		);
	}
	const modal = document.getElementById('directionsMapModal');
	const optionsContainer = document.getElementById('directionsMapOptions');

	if (!optionsContainer) {
		window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
		return;
	}

	optionsContainer.innerHTML = '';

	const options = createDirectionsOptions();

	options.forEach(option => {
		const optionElement = document.createElement('div');
		optionElement.className = 'directions-map-option';
		optionElement.onclick = () => openDirections(option.url, latitude, longitude);

		optionElement.innerHTML = `
            <img src="${option.icon}" alt="${option.name}" class="directions-map-option-icon">
            <div class="directions-map-option-text">
                <div class="directions-map-option-title">${option.name}</div>
                <div class="directions-map-option-desc">${option.description}</div>
            </div>
        `;

		optionsContainer.appendChild(optionElement);
	});
	const label = crouton.localization.getWord('Remember my choice');
	const rememberChoiceElement = document.createElement('div');
	rememberChoiceElement.className = 'directions-remember-choice-div';
	rememberChoiceElement.innerHTML =
`<input type="checkbox" id="rememberDirectionsChoice" name="rememberDirectionsChoice" value="1">
<label for="rememberDirectionsChoice">`+label+`</label>`
	;
	optionsContainer.appendChild(rememberChoiceElement);
	jQuery('html').on('click', '.directions-map-modal-close', closeDirectionsModal);
	// Show modal
	modal.style.display = 'block';
}

function closeDirectionsModal() {
		const modal = document.getElementById('directionsMapModal');
		modal.style.display = 'none';
		if (modal.className.includes('remove-after-use')) modal.remove();
}

function openDirections(url, latitude, longitude, fromModal = true) {
	const save = jQuery('#rememberDirectionsChoice');
	if (fromModal && save.length && save.is(":checked")) localStorage.setItem("croutonDirectionsURL", url);
	url = url.replaceAll('${latitude}', latitude);
	url = url.replaceAll('${longitude}', longitude);
	window.open(url, '_blank');
	if (fromModal) closeDirectionsModal();
}
