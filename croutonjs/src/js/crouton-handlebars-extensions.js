function CroutonHandlebarsExtensions() {
	CroutonHandlebarsExtensions.prototype.registerHelpers = function() {
		crouton_Handlebars.registerHelper('getDayOfTheWeek', function(day_id) {
			return hbs_Crouton.localization.getDayOfTheWeekWord(day_id);
		});

		crouton_Handlebars.registerHelper('getWord', function(word) {
			var translation = hbs_Crouton.localization.getWord(word);
			if(typeof translation !== 'undefined') return translation;
			console.log("no translation for '" + word + "'");
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
			if(isIOSDevice()) {
				return getTrueResult(options, this);
			} else {
				return getFalseResult(options, this);
			}
		});
		crouton_Handlebars.registerHelper('reportUpdateEnabled', function(data, options) {
			return crouton.config.report_update_url !== "" ? getTrueResult(options, this) : getFalseResult(options, this)
		});

		crouton_Handlebars.registerHelper('reportUpdateUrl', function() {
			return crouton.config.report_update_url;
		});
		crouton_Handlebars.registerHelper('ifGroup', function(data, options) {
			return (data.hasOwnProperty('membersOfGroup') && data.membersOfGroup.length > 1)
				? options.fn(this)
				: options.inverse(this);
		});
		crouton_Handlebars.registerHelper('groupsConfigured', function(data, options) {
			if (crouton.config.groups) {
				return getTrueResult(options, this);
			} else {
				return getFalseResult(options, this);
			}
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
			for(var i = 0;i < formatsParam.length;i++) {
				allFound = inArray(formatsParam[i], formatsResponse);
			}

			return allFound ? getTrueResult(options, this) : getFalseResult(options, this);
		});
		crouton_Handlebars.registerHelper('temporarilyClosed', function(data, options) {
			if(data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('TC', data)) !== undefined) {
				return data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('TC', data))['description'];
			} else {
				return crouton.localization.getWord("FACILITY IS TEMPORARILY CLOSED");
			}
		});

		crouton_Handlebars.registerHelper('meetsVirtually', function(data, options) {
			if(data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('VM', data)) !== undefined) {
				return data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('VM', data))['description'];
			} else {
				return crouton.localization.getWord("MEETS VIRTUALLY");
			}
		});

		crouton_Handlebars.registerHelper('meetsHybrid', function(data, options) {
			if(data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('HY', data)) !== undefined) {
				return data['formats_expanded'].getArrayItemByObjectKeyValue('id', getMasterFormatId('HY', data))['description'];
			} else {
				return crouton.localization.getWord("MEETS VIRTUALLY AND IN PERSON");
			}
		});

		crouton_Handlebars.registerHelper('qrCode', function(link, options) {
			return new crouton_Handlebars.SafeString("<img alt='qrcode' src='https://quickchart.io/qr?size=100&text=" + encodeURIComponent(link) + "'>");
		});

		crouton_Handlebars.registerHelper('formatDataFromArray', function(arr) {
			var finalValues = [];
			for(var i = 0;i < arr.length;i++) {
				finalValues.push(convertToPunyCode(arr[i]));
			}

			return finalValues.join(" ");
		});

		crouton_Handlebars.registerHelper('formatDataPointerFormats', function(formatsExpanded) {
			var finalFormats = [];
			for(var i = 0;i < formatsExpanded.length;i++) {
				finalFormats.push(convertToPunyCode(formatsExpanded[i]['name']));
			}
			return finalFormats.join(" ");
		});

		crouton_Handlebars.registerHelper('formatDataKeyFormats', function(formatsExpanded) {
			var finalFormats = [];
			for(var i = 0;i < formatsExpanded.length;i++) {
				finalFormats.push(convertToPunyCode(formatsExpanded[i]['key']));
			}
			return finalFormats.join(" ");
		});

		crouton_Handlebars.registerHelper('formatLink', function(text) {
			if(text.indexOf('tel:') === 0 || text.indexOf('http') === 0) {
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

		crouton_Handlebars.registerHelper('greaterThan', function(arg1, arg2, options) {
			return (arg1 > arg2) ? options.fn(this) : options.inverse(this);
		});

		crouton_Handlebars.registerHelper('lessThan', function(arg1, arg2, options) {
			return (arg1 < arg2) ? options.fn(this) : options.inverse(this);
		});

		crouton_Handlebars.registerHelper('times', function(n, block) {
			var accum = '';
			for(var i = 1;i <= n;++i)
				accum += block.fn(i);
			return accum;
		});
		crouton_Handlebars.registerHelper('hasObserverLine', function(name, phone, email) {
			if(name && name.length > 0) return true;
			if(phone && phone.length > 0) return true;
			if(email && email.length > 0) return true;
			return false;
		});
		crouton_Handlebars.registerHelper('hasBMLT2ics', function() {return crouton.config['bmlt2ics'].length > 0;});
		crouton_Handlebars.registerHelper('BMLT2ics', function() {return crouton.config['bmlt2ics'];});
		function getTrueResult(options, ctx) {
			return options.fn !== undefined ? options.fn(ctx) : true;
		}

		function getFalseResult(options, ctx) {
			return options.inverse !== undefined ? options.inverse(ctx) : false;
		}
	}
	CroutonHandlebarsExtensions.prototype.registerPartials = function(groups = false) {
		crouton_Handlebars.registerPartial('tableRows', hbs_Crouton.templates['tableRows']);
		crouton_Handlebars.registerPartial('meetingDetails', hbs_Crouton.templates['meetingDetails']);
		crouton_Handlebars.registerPartial("groupStackedRow", hbs_Crouton.templates['groupStackedRow']);
		crouton_Handlebars.registerPartial("meetingStackedRow", hbs_Crouton.templates['meetingStackedRow']);
		crouton_Handlebars.registerPartial('groupDetails', hbs_Crouton.templates['groupDetails']);
		crouton_Handlebars.registerPartial('bydays', hbs_Crouton.templates['byday']);
		crouton_Handlebars.registerPartial('weekdays', hbs_Crouton.templates['weekdays']);
		crouton_Handlebars.registerPartial('meetingsPlaceholders', hbs_Crouton.templates['meetingsPlaceholders']);
		crouton_Handlebars.registerPartial('header', hbs_Crouton.templates['header']);
		crouton_Handlebars.registerPartial('byfields', hbs_Crouton.templates['byfield']);
		crouton_Handlebars.registerPartial('formatPopup', hbs_Crouton.templates['formatPopup']);
		crouton_Handlebars.registerPartial('meetingModal', "<a tabindex='0' href='#' onclick='crouton.meetingModal({{this.id_bigint}})'><span class='glyphicon glyphicon-search' aria-hidden='true'></span>{{this.meeting_name}}</a>");
		crouton_Handlebars.registerPartial('meetingLink', `
			{{#if this.meeting_details_url}}
				<a href='{{{this.meeting_details_url}}}'><span class='glyphicon glyphicon-search' aria-hidden='true'></span>{{this.meeting_name}}</a>
			{{else}}
				{{this.meeting_name}}
			{{/if}}
		`);
		crouton_Handlebars.registerPartial('icsButton',
			'<a href="{{BMLT2ics}}?meeting-id={{id_bigint}}" download="{{meeting_name}}.ics" class="share-button btn btn-primary btn-xs" ><span class="glyphicon glyphicon-download-alt"></span> {{getWord "bmlt2ics"}}</a>');
		crouton_Handlebars.registerPartial('offerIcsButton', "{{#if (hasBMLT2ics)}}{{> icsButton}}<br/>{{/if}}");
		crouton_Handlebars.registerPartial('directionsButton', hbs_Crouton.templates['directionsButton']);
		crouton_Handlebars.registerPartial('attendVirtual', hbs_Crouton.templates['attendVirtual']);
		crouton_Handlebars.registerPartial('meetingDetailsButton', hbs_Crouton.templates['meetingDetailsButton']);
		crouton_Handlebars.registerPartial('distance', `
<div class='meeting-distance{{#unless this.distance}} hide{{/unless}}' data-id='{{this.id_bigint}}'>
{{getWord 'Distance'}}: {{this.distance}}
</div>`);
		crouton_Handlebars.registerPartial('formatDescriptions', `
			{{#if formats_expanded}}
            	<h4>{{getWord "Meeting Info"}}</h4>
            	<ul>
            		{{#each formats_expanded}}
                		<li>{{description}}</li>
            		{{/each}}
            	</ul>
            	<br/>
        	{{/if}}
		`);
		crouton_Handlebars.registerPartial('formatKeys', `
				{{#if this.formats}}
				<a
				   class="bmlt-formats btn btn-primary btn-xs"
				   title=""
				   data-html="true"
				   tabindex="0"
				   data-trigger="focus"
				   role="button"
				   data-toggle="popover"
				   data-original-title=""
				   data-placement="{{{getWord 'bootstrap-popover-placement'}}}"
				   data-content="{{> (selectFormatPopup) }}">
                    <span class="glyphicon glyphicon-search"
						  aria-hidden="true"
						  data-toggle="popover"
						  data-trigger="focus"
						  data-html="true"
						  role="button"></span>{{ this.formats }}
				</a>
			{{/if}}
			`
		)

		crouton_Handlebars.registerPartial('observerLine', `
{{#if (hasObserverLine name phone email) }}
<div class='observerLine'>{{getWord "Contact"}}: {{name}} <a href='tel:{{phone}}'>{{phone}}</a> <a href='mailto:{{email}}'>{{email}}</a></div>
</div>{{/if}}`);
	}
}
