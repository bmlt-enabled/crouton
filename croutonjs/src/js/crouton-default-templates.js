var croutonDefaultTemplates = {

	meeting_data_template: [
		"{{#isTemporarilyClosed this}}",
		"    <div class='temporarilyClosed'><span class='glyphicon glyphicon-flag'></span> {{temporarilyClosed this}}</div>",
		"{{/isTemporarilyClosed}}",
		"<div class='meeting-name'>{{> meetingModal this}}</div>",
		"<div class='location-text'>{{this.location_text}}</div>",
		"<div class='meeting-address'>{{this.formatted_address}}</div>",
		"<div class='location-information'>{{this.formatted_location_info}}</div>",
		"{{#if this.virtual_meeting_additional_info}}",
		"    <div class='meeting-additional-info'>{{this.virtual_meeting_additional_info}}</div>",
		"{{/if}}",
		"{{> distance }}"
	].join('\n'),

	metadata_template: [
		"{{> attendVirtual }}",
		"{{#isNotTemporarilyClosed this}}",
		"    {{#unless (hasFormats 'VM' this)}}",
		"	 {{> meetingDetailsButton this}}",
		"    {{/unless}}",
		"{{/isNotTemporarilyClosed}}"
	].join('\n'),

	observer_template: [
		"{{> observerLine name=contact_name_1 phone=contact_phone_1 email=contact_email_1 }}",
		"{{> observerLine name=contact_name_2 phone=contact_phone_2 email=contact_email_2 }}",
		"{{#if this.wheelchair}}<div aria-hidden='true' style='font-style:normal; font-size:x-large;'>&#x267F;</div>{{/if}}"
	].join('\n'),

	meeting_count_template: [
		"{{#if this.config.has_meeting_count}}",
		"<span class='bmlt_tabs_meeting_count'>{{getWord 'meeting_count'}} <span id='bmlt_tabs_meeting_count-live'>{{this.meetings.meetingCount}}</span></span>",
		"{{/if}}"
	].join('\n'),


	meetingpage_title_template: [
		"{{this.formatted_day}} {{this.start_time_formatted}} - {{this.end_time_formatted}}: {{this.meeting_name}}"
	].join('\n'),
	meetingdetails_contents_template: `
		{{#isInPersonOrHybrid this}}
       		<h4>{{getWord "Location"}}</h4>
        	{{#isTemporarilyClosed this}}
            	<div class="temporarilyClosed">{{temporarilyClosed this}}</div>
        	{{/isTemporarilyClosed}}
            <div class="location-text">{{{this.location_text}}}</div>
            <div class="meeting-address">{{this.formatted_address}}</div>
            <div class="location-information">{{{this.formatted_location_info}}}</div>
			{{> directionsButton this}}
            <br/>
        {{/isInPersonOrHybrid}}
		{{> attendVirtual }}
        <br/>
        {{> formatDescriptions }}
        <h4>{{getWord "Contact"}}</h4>
        {{getWord "This meeting is in"}} <a href="{{serviceBodyUrl}}">{{serviceBodyName}}</a><br/>
		{{> offerIcsButton}}`,
	marker_contents_template:
	`<h4>{{meeting_name}}</h4>
	<div class="active">
		<div class="marker_div_location_text">{{{this.location_text}}}</div>
		<div class="marker_div_location_address">{{this.formatted_address}}</div>
		<div class="marker_div_location_info">{{{this.formatted_location_info}}}</div>
		<div class="marker_div_location_maplink">
		{{#if this.meeting_details_url}}
			<a href="{{this.meeting_details_url}}" target="_blank">More info</a>
		{{/if}}
		</div>
		<div class="marker_div_formats">
		{{#each this.formats_expanded}}{{#if @index}}; {{/if}}{{this.name}}{{/each}}
		</div>
	</div>
	`,
	meeting_times_template: `
		<div class="bmlt-day">{{this.formatted_day}}</div>
		{{#ifEquals this.duration_time "24:00:00"}}
			<div class="bmlt-time-2">{{this.start_time_formatted}}</div>
		{{else}}
			<div class="bmlt-time-2">{{this.start_time_formatted}} - {{this.end_time_formatted}}</div>
		{{/ifEquals}}
		{{> formatKeys }}
		<div class="bmlt-comments">{{formatLink this.formatted_comments}}</div>
		<div class="bmlt-observer">{{> (selectObserver) }}</div>
	`,

	group_data_template: `
		<div class='location-text'>{{this.location_text}}</div>
		<div class='meeting-address'>{{this.formatted_address}}</div>
		<div class='location-information'>{{this.formatted_location_info}}
		{{#if this.virtual_meeting_additional_info}}
			<div class='meeting-additional-info'>{{this.virtual_meeting_additional_info}}</div>
		{{/if}}
		{{> distance }}
		<div class="bmlt-group-meetings">
			{{#each this.membersOfGroup}}
				<div class="bmlt-group-meeting">
					{{this.formatted_day}}: {{this.start_time_formatted}}
				</div>
			{{/each}}
		</div>
		`,
	group_title_template: `
	    <h5 style="font-size: 120%;" class="m-0 me-2 mb-2">{{this.meeting_name}}</h5>
        {{distance}}
        {{> directionsButton this}}
    `,
	group_details_contents_template: `
	    <div class="card-text">
        	{{#isInPersonOrHybrid this}}
            	<div class="card-title header-elements">
                	<h4 class="m-0 me-2">{{getWord 'Address'}}</h4>
    	        </div>
         	   	<div class="location-text">{{{this.location_text}}}</div>
            	<div class="meeting-address">{{this.formatted_address}}</div>
            	<div class="location-information">{{{this.formatted_location_info}}}</div>
            	<br/>
        	{{/isInPersonOrHybrid}}
			{{> attendVirtual }}
    	</div>
        {{> formatDescriptions }}
        <div class="card-title header-elements">
            <h4 class="m-0 me-2">{{getWord 'Comments'}}</h4>
        </div>
        <div class="card-text">
			<div class="bmlt-comments">{{formatLink this.formatted_comments}}</div>
			<div class="bmlt-observer">
                {{> observerLine name=contact_name_1 phone=contact_phone_1 email=contact_email_1 }}
		        {{> observerLine name=contact_name_2 phone=contact_phone_2 email=contact_email_2 }}
			</div>
    	</div>`,
	member_details_template: `
        <div class="card-title header-elements">
            <h5 class="m-0 me-2">
        		<div class="bmlt-day">{{this.formatted_day}}</div>
				{{#ifEquals this.duration_time "24:00:00"}}
					<div class="bmlt-time-2">{{this.start_time_formatted}}</div>
				{{else}}
					<div class="bmlt-time-2">{{this.start_time_formatted}} - {{this.end_time_formatted}}</div>
				{{/ifEquals}}
            </h5>
        </div>
        <div class="card-text">
            <div class="row mb-2">
                <div class="col-md-12">
                    {{#if formats_expanded}}
                        <ul>
                            {{#each formats_expanded}}
                                <li>{{description}}</li>
                            {{/each}}
                        </ul>
                        <br/>
                    {{/if}}
                </div>
            </div>
        </div>`,
}


