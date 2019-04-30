// TODO: webpack a dist version of crouton.js that combines all the dependencies to one file.
function convertToPunyCode(str) {
	return punycode.toASCII(str.toLowerCase()).replace(/\W|_/g, "-")
}

function arrayColumn(input, columnKey) {
	var newArr = [];
	for (var item of input) {
		newArr.push(item[columnKey]);
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
	for (var item of haystack) {
		if (item === needle) {
			return true;
		}
	}

	return false;
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

function Crouton(config, uniqueData, meetingData) {
	var self = this;
	self.config = config;
	self.uniqueData = uniqueData;
	self.meetingData = meetingData;
	self.localization = new CroutonLocalization(self.config['language']);
	self.service_body_data = [];
	self.dropdownConfiguration = [
		{
			placeholder: "Cities",
			dropdownAutoWidth: true,
			dropdownMaxWidth: '100px',
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		},
		{
			placeholder: "Groups",
			dropdownAutoWidth: true,
			dropdownMaxWidth: '100px',
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		},
		{
			placeholder: "Locations",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		},
		{
			placeholder: "Zips",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop-zip'
		},
		{
			placeholder: "Formats",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop-format'
		},
		{
			placeholder: "Counties",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		},
		{
			placeholder: "Areas",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		},
		{
			placeholder: "States",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		}
	];

	self.showPage = function(id) {
		jQuery(id).removeClass("hide").addClass("show");
	};

	self.showView = function(viewName) {
		if (viewName === "city") {
			self.cityView();
		} else if (viewName === "byday") {
			self.byDayView();
		} else {
			self.dayView();
		}
	};

	self.byDayView = function() {
		self.resetFilter();
		for (var a = 2; a <= self.dropdownConfiguration.length + 1; a++) {
			if ( jQuery("#e" + a).length ) { jQuery("#e" + a).select2("val", null); }
		}
		self.highlightButton("#day");
		self.lowlightButton("#city");
		jQuery('.bmlt-page').each(function(index) {
			self.hidePage("#" + this.id);
			self.showPage("#byday");
			self.showPage("#nav-days");
			return;
		});
	};

	self.dayView = function() {
		self.resetFilter();
		for (var a = 2; a <= self.dropdownConfiguration.length + 1; a++) {
			if ( jQuery("#e" + a).length ) { jQuery("#e" + a).select2("val", null); }
		}
		self.highlightButton("#day");
		self.lowlightButton("#city");
		jQuery('.bmlt-page').each(function(index) {
			self.hidePage("#" + this.id);
			self.showPage("#days");
			self.showPage("#nav-days");
			self.showPage("#tabs-content");
			return;
		});
	};

	self.cityView = function() {
		self.resetFilter();
		for (var a = 2; a <= self.dropdownConfiguration.length + 1; a++) {
			if ( jQuery("#e" + a).length ) { jQuery("#e" + a).select2("val", null); }
		}

		self.highlightButton("#city");
		self.lowlightButton("#day");
		jQuery('.bmlt-page').each(function(index) {
			self.hidePage("#" + this.id);
			self.showPage("#cities");
			return;
		});
	};

	self.lowlightButton = function(id) {
		jQuery(id).removeClass("buttonHighlight").addClass("buttonLowlight");
	};

	self.highlightButton = function(id) {
		jQuery(id).removeClass("buttonLowlight").addClass("buttonHighlight");
	};

	self.hidePage = function(id) {
		jQuery(id).removeClass("show").addClass("hide");
	};

	self.filteredPage = function(id, dataType, dataValue) {
		self.resetFilter();
		self.showPage(id);
		jQuery(".bmlt-data-row").removeClass("hide");
		if (dataType !== "formats") {
			jQuery(".bmlt-data-row").not("[data-" + dataType + "='" + dataValue + "']").addClass("hide");
		} else {
			jQuery(".bmlt-data-row").not("[data-" + dataType + "*='" + dataValue + "']").addClass("hide");
		}

		jQuery(".bmlt-data-rows").each(function(index, value) {
			if (jQuery(value).find(".bmlt-data-row.hide").length === jQuery(value).find(".bmlt-data-row").length) {
				jQuery(value).find(".meeting-header").addClass("hide");
			}
		})
	};

	self.resetFilter = function() {
		jQuery(".meeting-header").removeClass("hide");
		jQuery(".bmlt-data-row").removeClass("hide");
	};

	self.renderView = function(templateElement, selector, context) {
		var source   = document.getElementById(templateElement).innerHTML;
		var template = Handlebars.compile(source);
		jQuery(selector).append(template(context));
	};


	self.renderView("header-template", "#bmlt-header", {
		"config": self.config,
		"uniqueData": self.uniqueData,
		"words": self.localization.words
	});

	self.getFormats = function(callback) {
		var getAllIds = arrayColumn(meetingData, 'format_shared_id_list');
		var joinIds = getAllIds.join(',');
		var idsArray = joinIds.split(',');
		var uniqueIds = arrayUnique(idsArray);
		jQuery.getJSON(self.config['root_server'] + '/client_interface/jsonp/?switcher=GetFormats&callback=?', function(data) {
			var formats = [];
			for (var format of data) {
				if (inArray(format['id'], uniqueIds)) {
					formats.push(format);
				}
			}

			callback(formats);
		});
	};

	self.getServiceBodies = function(callback) {
		jQuery.getJSON(this.config['root_server'] + '/client_interface/jsonp/?switcher=GetServiceBodies&callback=?', callback);
	};

	self.getMeetings = function(meetingData, filter) {
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

	/* running on load */

	self.getFormats(function(data) {
		self.formatsData = data;

		self.getServiceBodies(function(data) {
			self.service_body_data = data;
		});

		var context = {"config": self.config, "data": [] };
		for (var day = 1; day <= 7; day++) {
			context['data'].push({
				"day": day,
				"meetings": self.getMeetings(self.meetingData, function(item) {
					return item['weekday_tinyint'] === day.toString();
				})
			});
		}

		self.renderView("weekdays-template", "#tabs-content", context);

		var cities = getUniqueValuesOfKey(self.meetingData, 'location_municipality').sort();
		var context = [];
		for (var i = 0; i < cities.length; i++) {
			context.push({
				"city": cities[i],
				"meetings": self.getMeetings(self.meetingData, function(item) {
					return item['location_municipality'] === cities[i];
				})
			});
		}

		self.renderView("cities-template", "#cities", context);

		var context = [];
		for (var day = 1; day <= 7; day++) {
			context.push({
				"day": self.localization.getDayOfTheWeekWord(day),
				"meetings": self.getMeetings(self.meetingData, function(item) {
					return item['weekday_tinyint'] === day.toString();
				})
			});
		}

		self.renderView("byday-template", "#byday", context);

		for (var a = 2; a <= self.dropdownConfiguration.length + 1; a++) {
			jQuery("#e" + a).select2(self.dropdownConfiguration[a - 2]);
		}
		jQuery('[data-toggle="popover"]').popover();
		jQuery('html').on('click', function (e) {
			if (jQuery(e.target).data('toggle') !== 'popover') {
				jQuery('[data-toggle="popover"]').popover('hide');
			}
		});

		if (jQuery.browser.mobile) {
			jQuery("#e2").prop("readonly", true);
			jQuery(".select2-search").css({"display":"none"});
			jQuery(".select2-search").remove();
			for (var j = 2; j <= this.dropdownConfiguration.length + 1; j++) {
				jQuery("#s2id_e" + j).css({"width":"99%","margin-bottom":"3px"});
			}
			jQuery(".bmlt-tabs .bmlt-button-weekdays").css({"width":"98%","margin-bottom":"3px"});
			jQuery(".bmlt-tabs .bmlt-button-cities").css({"width":"98%","margin-bottom":"3px"});
		}

		for (var a = 2; a <= self.dropdownConfiguration.length + 1; a++) {
			jQuery("#e" + a).on('select2:select', function (e) {
				for (var j = 2; j <= self.dropdownConfiguration.length + 1; j++) {
					if (this.id !== "e" + j) {
						if (jQuery("#e" + j).length) {
							jQuery("#e" + j).select2("val", null);
						}
					}
				}

				if (jQuery.browser.mobile) {
					jQuery("#" + this.id).prop("readonly", true);
					jQuery(".select2-search").css({"display": "none"});
					jQuery(".select2-search").remove();
				}

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

		jQuery("#day").on('click', function() { self.showView(self.config['view_by'] === 'byday' ? 'byday' : 'day'); });
		jQuery("#city").on('click', function() { self.showView('city'); });

		jQuery('.custom-ul').on('click', 'a', function(event) {
			jQuery('.bmlt-page').each(function(index) {
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
	});
}

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


