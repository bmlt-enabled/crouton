
	var map;
	 function initMap() {
		var map = new google.maps.Map(document.getElementById('bmlt-map'), {
			zoom: 3,
			center: {
				lat: 33.0600308,
				lng: -80.102879
			}
		});
		
		function fit_markers()
        {
            var bounds = new google.maps.LatLngBounds();

            // We go through all the results, and get the "spread" from them.
            for ( var c = 0; c < meetingData.length; c++ )
            {
                var	lat = meetingData[c].latitude;
                var	lng = meetingData[c].longitude;
                // We will set our minimum and maximum bounds.
                bounds.extend ( new google.maps.LatLng ( lat, lng ) );
            };

            // We now have the full rectangle of our meeting search results. Scale the map to fit them.
            map.fitBounds ( bounds );
        };

		fit_markers();

		var clusterMarker = [];

		var infoWindow = new google.maps.InfoWindow();

		// Create OverlappingMarkerSpiderfier instsance
		var oms = new OverlappingMarkerSpiderfier(map, { markersWontMove: true, markersWontHide: true });

		oms.addListener('format', function(marker, status) {
			var iconURL = status == OverlappingMarkerSpiderfier.markerStatus.SPIDERFIED ? '/wp-content/plugins/crouton/images/NAMarkerR.png' :
				status == OverlappingMarkerSpiderfier.markerStatus.SPIDERFIABLE ? '/wp-content/plugins/crouton/images/NAMarkerB.png' :
				status == OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIED ? '/wp-content/plugins/crouton/images/NAMarkerB.png' :
					status == OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIABLE ? '/wp-content/plugins/crouton/images/NAMarkerR.png' :
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
			var weekdays = ['ERROR', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
			var marker_html = '<dt><strong>';
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
			marker_html += '</em></dd>';
			var url = location.root_server_uri + 'semantic';
			marker_html += '<dd><em><a href="' + url + '">';
			marker_html += location.sbname;
			marker_html += '</a></em></dd>';

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
		new MarkerClusterer(map, clusterMarker, {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m', maxZoom: 15});

		
	}

//google.maps.event.addDomListener(window, 'load', initMap);

