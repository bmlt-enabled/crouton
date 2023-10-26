var croutonDefaultTemplates = {

	meeting_data_template: [
		"{{#isTemporarilyClosed this}}",
		"    <div class='temporarilyClosed'><span class='glyphicon glyphicon-flag'></span> {{temporarilyClosed this}}</div>",
		"{{/isTemporarilyClosed}}",
		"<div class='meeting-name'>{{> meetingLink this}}</div>",
		"<div class='location-text'>{{this.location_text}}</div>",
		"<div class='meeting-address'>{{this.formatted_address}}</div>",
		"<div class='location-information'>{{this.formatted_location_info}}</div>",
		"{{#if this.virtual_meeting_additional_info}}",
		"    <div class='meeting-additional-info'>{{this.virtual_meeting_additional_info}}</div>",
		"{{/if}}"
	].join('\n'),

	metadata_template: [
		"{{#isVirtualOrHybrid this}}",
		"    {{#isHybrid this}}",
		"        <div class='meetsVirtually'><span class='glyphicon glyphicon-cloud-upload'></span> {{meetsHybrid this}}</div>",
		"    {{else}}",
		"        <div class='meetsVirtually'><span class='glyphicon glyphicon-cloud'></span> {{meetsVirtually this}}</div>",
		"    {{/isHybrid}}",
		"    {{#if this.virtual_meeting_link}}",
		"        <div><span class='glyphicon glyphicon-globe'></span> {{webLinkify this.virtual_meeting_link}}</div>",
		"        {{#if this.show_qrcode}}",
		"            <div class='qrcode'>{{qrCode this.virtual_meeting_link}}</div>",
		"        {{/if}}",
		"    {{/if}}",
		"    {{#if this.phone_meeting_number}}",
		"        <div><span class='glyphicon glyphicon-earphone'></span> {{phoneLinkify this.phone_meeting_number}}</div>",
		"        {{#if this.show_qrcode}}",
		"            <div class='qrcode'>{{qrCode this.phone_meeting_number}}</div>",
		"        {{/if}}",
		"    {{/if}}",
		"{{/isVirtualOrHybrid}}",
		"{{#isNotTemporarilyClosed this}}",
		"    {{#unless (hasFormats 'VM' this)}}",
		"        <div>",
		"            <a id='map-button' class='btn btn-primary btn-xs'",
		"                href='https://www.google.com/maps/search/?api=1&query={{this.latitude}},{{this.longitude}}&q={{this.latitude}},{{this.longitude}}'",
		"                target='_blank' rel='noopener noreferrer'>",
		"                <span class='glyphicon glyphicon-map-marker'></span> {{this.map_word}}</a>",
		"        </div>",
		"        <div class='geo hide'>{{this.latitude}},{{this.longitude}}</div>",
		"    {{/unless}}",
		"{{/isNotTemporarilyClosed}}"
	].join('\n'),

	observer_template: [
		"<div class='observerLine'>{{this.contact_name_1}} {{this.contact_phone_1}} {{this.contact_email_1}}</div>",
		"<div class='observerLine'>{{this.contact_name_2}} {{this.contact_phone_2}} {{this.contact_email_2}}</div>"
	].join('\n'),

	meeting_count_template: [
		"{{#if this.config.has_meeting_count}}",
		"<span class='bmlt_tabs_meeting_count'>{{getWord 'meeting_count'}} <span id='bmlt_tabs_meeting_count'>{{this.meetings.meetingCount}}</span></span>",
		"{{/if}}"
	].join('\n'),

	meeting_link_template: [
		"{{#if this.meeting_details_url}}",
			"<a href='{{{this.meeting_details_url}}}'><span class='glyphicon glyphicon-search' aria-hidden='true'></span>{{this.meeting_name}}</a>",
		"{{else}}",
			"{{this.meeting_name}}",
		"{{/if}}"
	].join('\n'),
	meetingpage_title_template: [
		"{{this.formatted_day}} {{this.start_time_formatted}} - {{this.end_time_formatted}}: {{this.meeting_name}}"
	].join('\n'),

	meetingpage_contents_template:
        `<td style="width:500px">
		{{#isInPersonOrHybrid this}}
            {{{crouton_map}}}
        </td>
        <td style="vertical-align:top;">
            <h4>Location:</h4>
            {{#isTemporarilyClosed this}}
                <div class="temporarilyClosed">{{temporarilyClosed this}}</div>
            {{/isTemporarilyClosed}}
            <div class="location-text">{{{this.location_text}}}</div>
            <div class="meeting-address">{{this.formatted_address}}</div>
            <div class="location-information">{{{this.formatted_location_info}}}</div>
            '<a href="https://www.google.com/maps/dir/?api=1&destination={{this.latitude}}%2C{{this.longitude}}" class="bootstrap-bmlt" ><div class="btn btn-primary bmlt-xs get-directions"><span class="glyphicon glyphicon-road"></span> {{getWord "google_directions"}}</div></a>'
            <br/>
        {{/isInPersonOrHybrid}}
        {{#isVirtualOrHybrid this}}
            <h4>Join this meeting online:</h4>
            {{#if virtual_meeting_link}}
                <div>{{webLinkify this.virtual_meeting_link}}</div>
                {{#if show_qrcode}}
                    <div class="qrcode">{{qrCode virtual_meeting_link}}</div>
                {{/if}}
            {{/if}}
            {{#if this.phone_meeting_number}}
                <div>{{phoneLinkify this.phone_meeting_number}}</div>
                {{#if this.show_qrcode}}
                    <div class="qrcode">{{qrCode this.phone_meeting_number}}</div>
                {{/if}}
            {{/if}}
            {{#if this.virtual_meeting_additional_info}}
                {{this.virtual_meeting_additional_info}}
            {{/if}}
            <br/>
        {{/isVirtualOrHybrid}}
        <br/>
        {{#if formats_expanded}}
            <h4>Meeting Formats</h4>
            <ul>
            {{#each formats_expanded}}
                <li>{{description}}</li>
            {{/each}}
            </ul>
            <br/>
        {{/if}}
        <h4>Kontakt:</h4>
        This meeting is in <a href="{{serviceBodyUrl}}">{{serviceBodyName}}</a>
        </td>`,
}
