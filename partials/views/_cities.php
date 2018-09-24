<script id="cities-template" type="text/x-handlebars-template">
	<div id="bmlt-table-div">
		<table class='bmlt-table table table-striped table-hover table-bordered tablesaw tablesaw-stack'>
			<tbody>
			{{#each this}}
				<tr class="meeting-header">
					<td colspan="3">{{city}}</td>
				</tr>
				{{#each meetings}}
				<tr>
					<td class="bmlt-column1">
						<div class="bmlt-day">{{this.formatted_day}}</div>
						<div class="bmlt-time-2">{{this.start_time_formatted}} - {{this.end_time_formatted}}</div>
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
						<span class="glyphicon glyphicon-search" aria-hidden="true"></span>{{ this.formats }}
						</a>
						<div class="bmlt-comments">{{this.formatted_comments}}</div>
					</td>
					<td class="bmlt-column2">
						<div class="meeting-name">{{this.meeting_name}}</div>
						<div class="location-text">{{this.location_text}}</div>
						<div class="meeting-address">{{this.formatted_address}}</div>
						<div class="location-information">{{this.formatted_location_inf}}</div>
					</td>
					<td class="bmlt-column3">
						<a target="_blank" href="https://maps.google.com/maps?q={{this.latitude}},{{this.longitude}}" id="map-button" class="btn btn-primary btn-xs">
							<span class="glyphicon glyphicon-map-marker"></span> MAP
						</a>
						<div class='geo hide'>{{this.latitude}},{{this.longitude}}</div>
					</td>
				</tr>
				{{/each}}
			{{/each}}
			</tbody>
		</table>
	</div>
</script>
<div class="bmlt-page hide" id="cities"></div>
<script type="text/javascript">
	jQuery(function() {
		var source   = document.getElementById("cities-template").innerHTML;
		var template = Handlebars.compile(source);
		var cities = getUniqueValuesOfKey(meetingData, 'location_municipality').sort();
		var context = [];
		for (var city of cities) {
			context.push({
				"city": city,
				"meetings": getMeetings(meetingData, function(item) {
					return item['location_municipality'] === city;
				})
			});
		}
		var html = template(context);
		jQuery("#cities").append(html);
	});
</script>
