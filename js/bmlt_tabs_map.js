
	function initMap() {
		var map = new google.maps.Map(document.getElementById('bmlt-map'), {
			zoom: 3
		});
		
		var bounds = new google.maps.LatLngBounds();
		// We go through all the results, and get the "spread" from them.
		for ( var c = 0; c < meetingData.length; c++ ) {
			var	lat = meetingData[c].latitude;
			var	lng = meetingData[c].longitude;
			// We will set our minimum and maximum bounds.
			bounds.extend ( new google.maps.LatLng ( lat, lng ) );
		};
		// We now have the full rectangle of our meeting search results. Scale the map to fit them.
		map.fitBounds ( bounds );

		var clusterMarker = [];

		var infoWindow = new google.maps.InfoWindow();

		// Create OverlappingMarkerSpiderfier instsance
		var oms = new OverlappingMarkerSpiderfier(map, { markersWontMove: true, markersWontHide: true });

		oms.addListener('format', function(marker, status) {
			var iconURL = status == OverlappingMarkerSpiderfier.markerStatus.SPIDERFIED ? bmltTabsMap.pluginUrl + '/images/NAMarkerR.png' :
				status == OverlappingMarkerSpiderfier.markerStatus.SPIDERFIABLE ? bmltTabsMap.pluginUrl + '/images/NAMarkerB.png' :
				status == OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIED ? bmltTabsMap.pluginUrl + '/images/NAMarkerB.png' :
					status == OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIABLE ? bmltTabsMap.pluginUrl + '/images/NAMarkerR.png' :
						null;
			var iconSize = new google.maps.Size(22, 32);
			marker.setIcon({
				url: iconURL,
				size: iconSize,
				scaledSize: iconSize
			});
		});


		// This is necessary to make the Spiderfy work
		oms.addListener('click', function(marker) {
			infoWindow.setContent(marker.desc);
			infoWindow.open(map, marker);
		});
		// Add some markers to the map.
		// Note: The code uses the JavaScript Array.prototype.map() method to
		// create an array of markers based on a given "locations" array.
		// The map() method here has nothing to do with the Google Maps API.
		var markers = meetingData.map(function(location, i) {
			var weekdays = [null, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			var marker_html = '<dl><dt><strong>';
			marker_html += location.meeting_name;
			marker_html += '</strong></dt>';
			marker_html += '<dd><em>';
			marker_html += weekdays[parseInt ( location.weekday_tinyint )];
			var time = location.start_time.toString().split(':');
			var hour = parseInt ( time[0] );
			var minute = parseInt ( time[1] );
			var pm = 'AM';
			if ( hour >= 12 ) {
				pm = 'PM';
				if ( hour > 12 ) {
					hour -= 12;
				};
			};
			hour = hour.toString();
			minute = (minute > 9) ? minute.toString() : ('0' + minute.toString());
			marker_html += ' ' + hour + ':' + minute + ' ' + pm;
			marker_html += '</em><br>';
			marker_html += location.location_text;
			marker_html += '<br>';

			if(typeof location.location_street !== "undefined") {
				marker_html += location.location_street + '<br>';
			}
			if(typeof location.location_municipality !== "undefined") {
				marker_html += location.location_municipality + ' ';
			}
			if(typeof location.location_province !== "undefined") {
				marker_html += location.location_province + ' ';
			}
			if(typeof location.location_postal_code_1 !== "undefined") {
				marker_html += location.location_postal_code_1;
			}

			marker_html += '<br>';
			var url = 'http://maps.google.com/maps?q=' + location.latitude + ',' + location.longitude;
			marker_html += '<a href="' + url + '">';
			marker_html += 'Map to Meeting';
			marker_html += '</a>';
			marker_html += '</dd></dl>';

			var latLng = { "lat" : parseFloat(location.latitude) , "lng" : parseFloat(location.longitude) };

			var marker = new google.maps.Marker({
				position: latLng,
				map: map
			});
			
			// needed to make Spiderfy work
			oms.addMarker(marker);

			// needed to cluster marker
			clusterMarker.push(marker);
			google.maps.event.addListener(marker, 'click', function(evt) {
				infoWindow.setContent(marker_html);
				infoWindow.open(map, marker);
			})
			return marker;
		});

		// Add a marker clusterer to manage the markers.
		new MarkerClusterer(map, clusterMarker, {imagePath: bmltTabsMap.pluginUrl + '/images/m', maxZoom: bmltTabsMap.maxZoomLevel});
		
	}
	google.maps.event.addDomListener(window, 'load', initMap);
