function getUniqueValuesOfKey(array, key){
	return array.reduce(function(carry, item){
		if(item[key] && !~carry.indexOf(item[key])) carry.push(item[key]);
		return carry;
	}, []);
}

function getDay(day_id) {
	return words['days_of_the_week'][day_id];
}

function getMeetings(meetingData, filter) {
	var meetings = [];
	meetingData.exclude(croutonConfig['exclude_zip_codes'], "location_postal_code_1");
	for (var m = 0; m < meetingData.length; m++) {
		if (filter(meetingData[m])) {
			meetingData[m]['formatted_day'] = getDay(meetingData[m]['weekday_tinyint']);
			meetingData[m]['formatted_comments'] =
				meetingData[m]['comments'] != null
					? meetingData[m]['comments'].replace('/(http|https):\/\/([A-Za-z0-9\._\-\/\?=&;%,]+)/i', '<a style="text-decoration: underline;" href="$1://$2" target="_blank">$1://$2</a>')
					: "";
			var duration = meetingData[m]['duration_time'].split(":");
			meetingData[m]['start_time_formatted'] =
				moment(meetingData[m]['start_time'], "HH:mm:ss")
					.format(croutonConfig['time_format']);
			meetingData[m]['end_time_formatted']
				= moment(meetingData[m]['start_time'], "HH:mm:ss")
				.add(duration[0], 'hours')
				.add(duration[1], 'minutes')
				.format(croutonConfig['time_format']);

			var formats = meetingData[m]['formats'].split(",");
			var formats_expanded = [];
			for (var f = 0; f < formats.length; f++) {
				for (var g = 0; g < formatsData.length; g++) {
					if (formats[f] === formatsData[g]['key_string']) {
						formats_expanded.push(
							{
								"key": formats[f],
								"name": formatsData[g]['name_string'],
								"description": formatsData[g]['description_string']
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
			meetingData[m]['map_word'] = words['map'].toUpperCase();
			meetings.push(meetingData[m])
		}
	}

	return meetings;
}

function renderView(templateElement, selector, context) {
	var source   = document.getElementById(templateElement).innerHTML;
	var template = Handlebars.compile(source);
	jQuery(selector).append(template(context));
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

Handlebars.registerHelper('getDayOfTheWeek', function(weekday_int) {
	return getDay(weekday_int);
});

// 1) Convert string to lower case
// 2) Then puny code
// 3) Swap spaces for hyphens
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

jQuery(function($) {
	var dropdownConfiguration = [
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
	for (var a = 2; a <= dropdownConfiguration.length + 1; a++) {
		$("#e" + a).select2(dropdownConfiguration[a - 2]);
	}
	$('[data-toggle="popover"]').popover();
	$('html').on('click', function (e) {
		if ($(e.target).data('toggle') !== 'popover') {
			$('[data-toggle="popover"]').popover('hide');
		}
	});

	if (jQuery.browser.mobile) {
		$("#e2").prop("readonly", true);
		$(".select2-search").css({"display":"none"});
		$(".select2-search").remove();
		for (var j = 2; j <= dropdownConfiguration.length + 1; j++) {
			$("#s2id_e" + j).css({"width":"99%","margin-bottom":"3px"});
		}
		$(".bmlt-tabs .bmlt-button-weekdays").css({"width":"98%","margin-bottom":"3px"});
		$(".bmlt-tabs .bmlt-button-cities").css({"width":"98%","margin-bottom":"3px"});
	}

	for (var a = 2; a <= dropdownConfiguration.length + 1; a++) {
		$("#e" + a).on('select2:select', function (e) {
			for (var j = 2; j <= dropdownConfiguration.length + 1; j++) {
				if (this.id !== "e" + j) {
					if ($("#e" + j).length) {
						$("#e" + j).select2("val", null);
					}
				}
			}

			if (jQuery.browser.mobile) {
				$("#" + this.id).prop("readonly", true);
				$(".select2-search").css({"display": "none"});
				$(".select2-search").remove();
			}

			var val = $("#" + this.id).val();
			$('.bmlt-page').each(function (index) {
				hidePage("#" + this.id);
				lowlightButton("#city");
				lowlightButton("#day");
				filteredPage("#byday", e.target.getAttribute("data-pointer").toLowerCase(), val.replace("a-", ""));
				return;
			});
		});
	}

	$("#day").on('click', function() { showView(croutonConfig['view_by'] === 'byday' ? 'byday' : 'day'); });
	$("#city").on('click', function() { showView('city'); });

	$('.custom-ul').on('click', 'a', function(event) {
		$('.bmlt-page').each(function(index) {
			hidePage("#" + this.id);
			showPage("#" + event.target.id);
			return;
		});
	});

	function showView(viewName) {
		if (viewName === "city") {
			cityView();
		} else if (viewName === "byday") {
			byDayView();
		} else {
			dayView();
		}
	}

	function byDayView() {
		resetFilter();
		for (var a = 2; a <= dropdownConfiguration.length + 1; a++) {
			if ( $("#e" + a).length ) { $("#e" + a).select2("val", null); }
		}
		highlightButton("#day");
		lowlightButton("#city");
		$('.bmlt-page').each(function(index) {
			hidePage("#" + this.id);
			showPage("#byday");
			showPage("#nav-days");
			return;
		});
	}

	function dayView() {
		resetFilter();
		for (var a = 2; a <= dropdownConfiguration.length + 1; a++) {
			if ( $("#e" + a).length ) { $("#e" + a).select2("val", null); }
		}
		highlightButton("#day");
		lowlightButton("#city");
		$('.bmlt-page').each(function(index) {
			hidePage("#" + this.id);
			showPage("#days");
			showPage("#nav-days");
			showPage("#tabs-content");
			return;
		});
	}

	function cityView() {
		resetFilter();
		for (var a = 2; a <= dropdownConfiguration.length + 1; a++) {
			if ( $("#e" + a).length ) { $("#e" + a).select2("val", null); }
		}

		highlightButton("#city");
		lowlightButton("#day");
		$('.bmlt-page').each(function(index) {
			hidePage("#" + this.id);
			showPage("#cities");
			return;
		});
	}

	function lowlightButton(id) {
		$(id).removeClass("buttonHighlight").addClass("buttonLowlight");
	}

	function highlightButton(id) {
		$(id).removeClass("buttonLowlight").addClass("buttonHighlight");
	}

	function showPage(id) {
		$(id).removeClass("hide").addClass("show");
	}

	function hidePage(id) {
		$(id).removeClass("show").addClass("hide");
	}

	function filteredPage(id, dataType, dataValue) {
		resetFilter();
		showPage(id);
		$(".bmlt-data-row").removeClass("hide");
		if (dataType !== "formats") {
			$(".bmlt-data-row").not("[data-" + dataType + "='" + dataValue + "']").addClass("hide");
		} else {
			$(".bmlt-data-row").not("[data-" + dataType + "*='" + dataValue + "']").addClass("hide");
		}

		$(".bmlt-data-rows").each(function(index, value) {
			if ($(value).find(".bmlt-data-row.hide").length === $(value).find(".bmlt-data-row").length) {
				$(value).find(".meeting-header").addClass("hide");
			}
		})
	}

	function resetFilter() {
		$(".meeting-header").removeClass("hide");
		$(".bmlt-data-row").removeClass("hide");
	}

	if (typeof croutonConfig !== 'undefined' && croutonConfig['has_tabs'] !== "0") {
		$('.nav-tabs a').on('click', function (e) {
			e.preventDefault();
			$(this).tab('show');
		});

		var d = new Date();
		var n = d.getDay();
		n++;
		$('.nav-tabs a[href="#tab' + n + '"]').tab('show');
		$('#tab' + n).show();
	}

	if (typeof croutonConfig !== 'undefined') {
		showPage(".bmlt-header");
		showPage(".bmlt-tabs");
		showView(croutonConfig['view_by']);
	}
});
