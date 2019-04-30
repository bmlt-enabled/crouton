// TODO: webpack a dist version of crouton.js that combines all the dependencies to one file.
function convertToPunyCode(str) {
	return punycode.toASCII(str.toLowerCase()).replace(/\W|_/g, "-")
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

function Crouton(config, uniqueData, formatsData, meetingData) {
	var self = this;
	self.config = config;
	self.uniqueData = uniqueData;
	self.formatsData = formatsData;
	self.meetingData = meetingData;
	self.localization = new CroutonLocalization(self.config['language']);
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
	}

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
			if (jQuery(value).find(".bmlt-data-row.hide").length === $(value).find(".bmlt-data-row").length) {
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

	var context = {"config": self.config, "data": [] };
	for (var day = 1; day <= 7; day++) {
		context['data'].push({
			"day": day,
			"meetings": getMeetings(self.meetingData, function(item) {
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
			"meetings": getMeetings(self.meetingData, function(item) {
				return item['location_municipality'] === cities[i];
			})
		});
	}

	self.renderView("cities-template", "#cities", context);

	var context = [];
	for (var day = 1; day <= 7; day++) {
		context.push({
			"day": this.localization.getDayOfTheWeekWord(day),
			"meetings": getMeetings(self.meetingData, function(item) {
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
}

Crouton.prototype.getServiceBodies = function(callback) {
	jQuery.getJSON(self.config['root_server'] + '/client_interface/jsonp/?switcher=GetServiceBodies&callback=?', callback);
};

Crouton.prototype.getFormats = function(callback) {
	jQuery.getJSON(self.config['root_server'] + '/client_interface/jsonp/?switcher=GetFormats&callback=?', callback);
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


