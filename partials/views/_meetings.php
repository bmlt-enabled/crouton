{{#each meetings}}
<tr class="bmlt-data-row"
	data-cities="{{formatDataPointer this.location_municipality}}"
	data-groups="{{formatDataPointer this.meeting_name}}"
	data-locations="{{formatDataPointer this.location_text}}"
	data-zips="{{formatDataPointer this.location_postal_code_1}}"
	data-formats="{{formatDataPointerFormats this.formats_expanded}}"
	data-areas="{{formatDataPointer this.service_body_bigint}}"
	data-counties="{{formatDataPointer this.location_sub_province}}"
	data-states="{{formatDataPointer this.location_province}}">
	<td class="bmlt-column1">
		<div class="bmlt-day">{{this.formatted_day}}</div>
		<div class="bmlt-time-2">{{this.start_time_formatted}} - {{this.end_time_formatted}}</div>
		{{#if this.formats}}
			<a id="bmlt-formats"
			   class="btn btn-primary btn-xs"
			   title=""
			   data-html="true"
			   tabindex="0"
			   data-trigger="focus"
			   role="button"
			   data-toggle="popover"
			   data-original-title=""
			   data-content="
					<table class='bmlt_a_format table-bordered'>
					{{#each this.formats_expanded}}
					<tr>
						<td class='formats_key'>{{key}}</td>
						<td class='formats_name'>{{name}}</td>
						<td class='formats_description'>{{description}}</td>
					</tr>
					{{/each}}
				</table>">
				<span class="glyphicon glyphicon-search"
					  aria-hidden="true"
					  data-toggle="popover"
					  data-trigger="focus"
					  data-html="true"
					  role="button"></span>{{ this.formats }}
			</a>
		{{/if}}
		<div class="bmlt-comments">{{this.formatted_comments}}</div>
	</td>
	<td class="bmlt-column2">
		<div class="meeting-name">{{this.meeting_name}}</div>
		<div class="location-text">{{this.location_text}}</div>
		<div class="meeting-address">{{this.formatted_address}}</div>
		<div class="location-information">{{this.formatted_location_info}}</div>
	</td>
	<td class="bmlt-column3">
		<a target="_blank" href="https://maps.google.com/maps?q={{this.latitude}},{{this.longitude}}" id="map-button" class="btn btn-primary btn-xs">
			<span class="glyphicon glyphicon-map-marker"></span> {{this.map_word}}
		</a>
		<div class='geo hide'>{{this.latitude}},{{this.longitude}}</div>
	</td>
</tr>
{{/each}}
