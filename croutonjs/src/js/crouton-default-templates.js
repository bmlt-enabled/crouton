var croutonDefaultTemplates = {

	meeting_data_template: [
		"{{#isTemporarilyClosed this}}",
		"    <div class='temporarilyClosed'><span class='glyphicon glyphicon-flag'></span> {{temporarilyClosed this}}</div>",
		"{{/isTemporarilyClosed}}",
		"<div class='meeting-name'>{{this.meeting_name}}</div>",
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
	].join('\n')

}
