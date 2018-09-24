<script id="entry-template" type="text/x-handlebars-template">
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
								</table>"
								<span class="glyphicon glyphicon-search" aria-hidden="true"></span>{{ this.formats }}</a>
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
		var source   = document.getElementById("entry-template").innerHTML;
		var template = Handlebars.compile(source);
		var context = [];
		for (var day = 1; day <= 7; day++) {
			var meetings = [];
			for (var m = 0; m < meetingData.length; m++) {
				if (meetingData[m]['weekday_tinyint'] === day.toString()) {
					meetingData[m]['formatted_comments'] =
						meetingData[m]['comments'] != null
						? meetingData[m]['comments'].replace('/(http|https):\/\/([A-Za-z0-9\._\-\/\?=&;%,]+)/i', '<a style="text-decoration: underline;" href="$1://$2" target="_blank">$1://$2</a>')
						: "";
					var duration = meetingData[m]['duration_time'].split(":");
					meetingData[m]['start_time_formatted'] =
						moment(meetingData[m]['start_time'], "HH:mm:ss")
						.format("h:mm a");
					meetingData[m]['end_time_formatted']
						= moment(meetingData[m]['start_time'], "HH:mm:ss")
						.add(duration[0], 'hours')
						.add(duration[1], 'minutes')
						.format("h:mm a");

					var formats = meetingData[m]['formats'];
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
					meetingData[m]['formatted_address'] = addressParts.join(", ");
					meetingData[m]['formatted_location_info'] =
						meetingData[m]['location_info'] != null
							? meetingData[m]['location_info'].replace('/(http|https):\/\/([A-Za-z0-9\._\-\/\?=&;%,]+)/i', '<a style="text-decoration: underline;" href="$1://$2" target="_blank">$1://$2</a>')
							: "";
					meetings.push(meetingData[m])
				}
			}
			context.push({"day": day, "meetings": meetings});
		}
		var html = template(context);
		jQuery("#tabs-content").append(html);
	});
</script>
