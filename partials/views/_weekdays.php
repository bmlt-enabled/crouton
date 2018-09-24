<script id="weekdays-template" type="text/x-handlebars-template">
<div class="tab-content">
	{{#each this}}
	<div id='tab{{ day }}' class='tab-pane'>
		<div id="bmlt-table-div">
			<table class='bmlt-table table table-striped table-hover table-bordered tablesaw tablesaw-stack'>
				<tbody>
					{{#each meetings}}
					<tr>
						<td class="bmlt-column1">
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
				</tbody>
			</table>
		</div>
	</div>
	{{/each}}
</div>
</script>
<div class="bmlt-page" id="tabs-content"></div>
<script type="text/javascript">
	jQuery(function() {
		var source   = document.getElementById("weekdays-template").innerHTML;
		var template = Handlebars.compile(source);
		var context = [];
		for (var day = 1; day <= 7; day++) {
			context.push({
				"day": day,
				"meetings": getMeetings(meetingData, function(item) {
					return item['weekday_tinyint'] === day.toString();
				})
			});
		}
		var html = template(context);
		jQuery("#tabs-content").append(html);
	});
</script>
