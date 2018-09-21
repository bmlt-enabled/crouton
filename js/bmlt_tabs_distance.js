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
		$( ".geo" ).each(function() {
			var target = $( this ).html();
			var arr = target.split(',');
			var miles = distance(latitude, longitude, arr[0], arr[1]);
			$( this ).removeClass("hide").addClass("show").html(miles.toFixed(1) + ' Miles');
		});
	}

	function errorHandler(msg) {
		$('.geo').removeClass("hide").addClass("show").html('');
		// $('.geo').removeClass("hide").addClass("show").html('Geolocation failed');  Dont show error
	}

	function distance(lat1, lon1, lat2, lon2, unit) {
		var radlat1 = Math.PI * lat1/180
		var radlat2 = Math.PI * lat2/180
		var radlon1 = Math.PI * lon1/180
		var radlon2 = Math.PI * lon2/180
		var theta = lon1-lon2
		var radtheta = Math.PI * theta/180
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist)
		dist = dist * 180/Math.PI
		dist = dist * 60 * 1.1515
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist
	}
});
