function getUniqueValuesOfKey(array, key){
	return array.reduce(function(carry, item){
		if(item[key] && !~carry.indexOf(item[key])) carry.push(item[key]);
		return carry;
	}, []);
}

function getMeetings(meetingData, filter) {
	var meetings = [];
	// meetingData.exclude(croutonConfig['exclude_zip_codes'], "location_postal_code_1");
	for (var m = 0; m < meetingData.length; m++) {
		if (filter(meetingData[m])) {
			//meetingData[m]['formatted_day'] = getDay(meetingData[m]['weekday_tinyint']);
			meetingData[m]['formatted_comments'] =
				meetingData[m]['comments'] != null
					? meetingData[m]['comments'].replace('/(http|https):\/\/([A-Za-z0-9\._\-\/\?=&;%,]+)/i', '<a style="text-decoration: underline;" href="$1://$2" target="_blank">$1://$2</a>')
					: "";
			var duration = meetingData[m]['duration_time'].split(":");
			/* meetingData[m]['start_time_formatted'] =
				moment(meetingData[m]['start_time'], "HH:mm:ss")
					.format(croutonConfig['time_format']);*/
			/* meetingData[m]['end_time_formatted']
				= moment(meetingData[m]['start_time'], "HH:mm:ss")
				.add(duration[0], 'hours')
				.add(duration[1], 'minutes')
				.format(croutonConfig['time_format']);*/

			var formats = meetingData[m]['formats'].split(",");
			var formats_expanded = [];
			/*for (var f = 0; f < formats.length; f++) {
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
			}*/
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
			// meetingData[m]['map_word'] = words['map'].toUpperCase();
			meetings.push(meetingData[m])
		}
	}

	return meetings;
}
