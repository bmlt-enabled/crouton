jQuery(document).ready(function($) {

	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showLocation, errorHandler);
	}
	
	else {
		$('.geo').removeClass("hide").addClass("show").html('<p>Geolocation is not supported by your browser</p>');
	}

	function showLocation(position) {
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
		var distanceUnit;
		var distanceCalculation;

		if (croutonConfig['distance_units'] === "km") {
			distanceUnit = "km";
			distanceCalculation = "K";
		} else if (croutonConfig['distance_units'] === "nm") {
			distanceUnit = "nm";
			distanceCalculation = "N";
		} else {
			distanceUnit = "mi";
			distanceCalculation = "M";
		}

		$( ".geo" ).each(function() {
			var target = $( this ).html();
			var arr = target.split(',');
			var distance_result = distance(latitude, longitude, arr[0], arr[1], distanceCalculation);
			$( this ).removeClass("hide").addClass("show").html(distance_result.toFixed(1) + ' ' + distanceUnit);
		});
	}

	function errorHandler(msg) {
		$('.geo').removeClass("hide").addClass("show").html('');
		// $('.geo').removeClass("hide").addClass("show").html('Geolocation failed');  Dont show error
	}

	function distance(lat1, lon1, lat2, lon2, unit) {
		if ((lat1 === lat2) && (lon1 === lon2)) {
			return 0;
		}

		else {
			var radlat1 = Math.PI * lat1/180;
			var radlat2 = Math.PI * lat2/180;
			var theta = lon1-lon2;
			var radtheta = Math.PI * theta/180;
			var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
			if (dist > 1) {
				dist = 1;
			}
			dist = Math.acos(dist);
			dist = dist * 180/Math.PI;
			dist = dist * 60 * 1.1515;
			if (unit === "K") {
				return dist * 1.609344;
			} else if (unit === "N") {
				return dist * 0.8684;
			} else {
				return dist;
			}
		}
	}
});
