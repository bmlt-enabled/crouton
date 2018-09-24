<script id="cities-template" type="text/x-handlebars-template">
	<div id="bmlt-table-div">
		<table class='bmlt-table table table-striped table-hover table-bordered tablesaw tablesaw-stack'>
			<tbody>
			{{#each this}}
				<tr class="meeting-header">
					<td colspan="3">{{city}}</td>
				</tr>
				<?php include '_meetings.php'; ?>
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
		jQuery(".bmlt-day").removeClass("hide");
	});
</script>
