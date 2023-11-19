function CroutonMap(config) {
    var self = this;
	self.config = {
		google_api_key: null,		  // Required if using the show_map option.  Be sure to add an HTTP restriction as well.
		distance_units: 'mi'
	};
	Object.assign(self.config, config);
    self.map = null;
    self.geocoder = null;
    self.map_objects = [];
    self.map_clusters = [];
    self.oms = null;
    self.markerClusterer = null;
	self.handlebarMapOptions = null;
	self.loadGapi = function(callbackFunctionName) {
		var tag = document.createElement('script');
		tag.src = "https://maps.googleapis.com/maps/api/js?key=" + self.config['google_api_key'] + "&callback=" + callbackFunctionName;
		tag.defer = true;
		tag.async = true;
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	};
	self.getCurrentLocation = function(callback) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(callback, self.errorHandler);
		} else {
			$('.geo').removeClass("hide").addClass("show").html('<p>Geolocation is not supported by your browser</p>');
		}
	};

	CroutonMap.prototype.addCurrentLocationPin = function(latitude, longitude) {
		var latlng = new google.maps.LatLng(latitude, longitude);
		self.map.setCenter(latlng);

		var currentLocationMarker = new google.maps.Marker({
			"map": self.map,
			"position": latlng,
		});

		self.addToMapObjectCollection(currentLocationMarker);

		var infoWindow = new google.maps.InfoWindow();
		infoWindow.setContent('Current Location');
		infoWindow.open(self.map, currentLocationMarker);
	};

	self.findMarkerById = function(id) {
		for (var m = 0; m < self.map_objects.length; m++) {
			var map_object = self.map_objects[m];
			if (parseInt(map_object['id']) === id) {
				return map_object;
			}
		}

		return null;
	};

	self.rowClick = function(id) {
		var map_marker = self.findMarkerById(id);
		if (!map_marker) return;
		self.map.setCenter(map_marker.getPosition());
		self.map.setZoom(17);
		google.maps.event.trigger(map_marker, "click");
	};

	self.addToMapObjectCollection = function(obj) {
		self.map_objects.push(obj);
	};

	self.clearAllMapClusters = function() {
		while (self.map_clusters.length > 0) {
			self.map_clusters[0].setMap(null);
			self.map_clusters.splice(0, 1);
		}

		if (self.oms !== null) {
			self.oms.removeAllMarkers();
		}

		if (self.markerClusterer !== null) {
			self.markerClusterer.clearMarkers();
		}
	};

	self.clearAllMapObjects = function() {
		while (self.map_objects.length > 0) {
			self.map_objects[0].setMap(null);
			self.map_objects.splice(0, 1);
		}

		//infoWindow.close();
	};
}
CroutonMap.prototype.mapSearchClickMode = function() {
	var self = this;
	self.mapClickSearchMode = true;
	self.map.setOptions({
		draggableCursor: 'crosshair',
		zoomControl: false,
		gestureHandling: 'none'
	});
};
CroutonMap.prototype.mapSearchPanZoomMode = function() {
	var self = this;
	self.mapClickSearchMode = false;
	self.map.setOptions({
		draggableCursor: 'default',
		zoomControl: true,
		gestureHandling: 'auto'
	});
};

CroutonMap.prototype.mapSearchNearMeMode = function() {
	var self = this;
	self.mapSearchPanZoomMode();
	self.getCurrentLocation(function(position) {
		crouton.searchByCoordinates(position.coords.latitude, position.coords.longitude);
	});
};

CroutonMap.prototype.mapSearchTextMode = function(location) {
	var self = this;
	self.mapSearchPanZoomMode();
	if (location !== undefined && location !== null && location !== "") {
		self.geocoder.geocode({'address': location}, function (results, status) {
			if (status === 'OK') {
				crouton.searchByCoordinates(results[0].geometry.location.lat(), results[0].geometry.location.lng());
			} else {
				console.log('Geocode was not successful for the following reason: ' + status);
			}
		});
	}
};

CroutonMap.prototype.renderMap = function() {
	var self = this;
	self.geocoder = new google.maps.Geocoder();
	jQuery.when(jQuery.getJSON(self.config['template_path'] + "/themes/" + self.config['theme'] + ".json").then(
		function (data, textStatus, jqXHR) {
			return self.config["theme_js"] = data["google_map_theme"];
		}
	)).then(function() {
		self.map = new google.maps.Map(document.getElementById(self.domElementName), {
			zoom: self.config['map_search']['zoom'] || 10,
			center: {
				lat: self.config['map_search']['latitude'],
				lng: self.config['map_search']['longitude'],
			},
			mapTypeControl: false,
			styles: self.config["theme_js"]
		});

		var controlDiv = document.createElement('div');

		// Set CSS for the control border
		var controlUI = document.createElement('div');
		controlUI.className = 'mapcontrolcontainer';
		controlUI.title = 'Click to recenter the map';
		controlDiv.appendChild(controlUI);

		// Set CSS for the control interior
		var clickSearch = document.createElement('div');
		clickSearch.className = 'mapcontrols';
		clickSearch.innerHTML = '<label for="nearme" class="mapcontrolslabel"><input type="radio" id="nearme" name="mapcontrols"> ' + crouton.localization.getWord('near_me') + '</label><label for="textsearch" class="mapcontrolslabel"><input type="radio" id="textsearch" name="mapcontrols"> ' + crouton.localization.getWord('text_search') + '</label><label for="clicksearch" class="mapcontrolslabel"><input type="radio" id="clicksearch" name="mapcontrols"> ' + crouton.localization.getWord('click_search') + '</label>';
		controlUI.appendChild(clickSearch);
		controlDiv.index = 1;

		google.maps.event.addDomListener(clickSearch, 'click', function () {
			var controlsButtonSelections = jQuery("input:radio[name='mapcontrols']:checked").attr("id");
			if (controlsButtonSelections === "textsearch") {
				self.mapSearchTextMode(prompt("Enter a location or postal code:"));
			} else if (controlsButtonSelections === "nearme") {
				self.mapSearchNearMeMode();
			} else if (controlsButtonSelections === "clicksearch") {
				self.mapSearchClickMode();
			}
		});

		self.map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);
		self.map.addListener('click', function (data) {
			if (self.mapClickSearchMode) {
				self.mapSearchPanZoomMode();
				crouton.searchByCoordinates(data.latLng.lat(), data.latLng.lng());
			}
		});

		if (self.config['map_search']['auto']) {
			self.mapSearchNearMeMode();
		} else if (self.config['map_search']['location'] !== undefined) {
			self.mapSearchTextMode(self.config['map_search']['location']);
		} else if (self.config['map_search']['coordinates_search']) {
			crouton.searchByCoordinates(self.config['map_search']['latitude'], self.config['map_search']['longitude']);
		}
	})
};
CroutonMap.prototype.showMap = function() {
}
CroutonMap.prototype.render = function(domElementName) {
	self = this;
	self.domElementName = domElementName;
	this.loadGapi('croutonMap.renderMap');
}
CroutonMap.prototype.reload = function(meetingData) {
	this.meetingData = meetingData;
}
CroutonMap.prototype.initialize = function(domElementName, meetingData, showMenu=null, handlebarMapOptions=null) {
	this.meetingData = meetingData;
	this.handlebarMapOptions = handlebarMapOptions;
	this.domElementName = domElementName;
	this.loadGapi('croutonMap.initMap');
}
CroutonMap.prototype.initMap = function(callback=null) {
	var self = this;
	if (self.map == null) {
		var mapOpt = { zoom: 3, maxZoom: 17 };
		if (self.handlebarMapOptions) mapOpt = {
			center: new google.maps.LatLng(self.handlebarMapOptions.lat, self.handlebarMapOptions.lng),
			zoom: self.handlebarMapOptions.zoom,
			mapTypeId:google.maps.MapTypeId.ROADMAP
		};
		self.map = new google.maps.Map(document.getElementById(self.domElementName), mapOpt );
	}
	self.fillMap();
	if (callback) callback();
}
CroutonMap.prototype.fillMap = function(filteredIds=null) {
	var self = this;
	if (self.map == null) return;
	self.clearAllMapObjects();
	self.clearAllMapClusters();
	const physicalMeetings = self.meetingData.filter(m => m.venue_type != venueType.VIRTUAL);
	const filteredMeetings = (filteredIds===null) ? physicalMeetings
		: physicalMeetings.filter((m) => filteredIds.includes(m.id_bigint));
	const bounds = filteredMeetings.reduce(
		function (bounds, m) {
			return bounds.extend(new google.maps.LatLng(m.latitude, m.longitude))
		}, new google.maps.LatLngBounds());
	// We now have the full rectangle of our meeting search results. Scale the map to fit them.
	if (!self.handlebarMapOptions) self.map.fitBounds(bounds);
	if (self.map.getZoom()>18) self.map.setZoom(18);
	var infoWindow = new google.maps.InfoWindow();

	// Create OverlappingMarkerSpiderfier instance
	self.oms = new OverlappingMarkerSpiderfier(self.map, {
		markersWontMove: true,
		markersWontHide: true,
	});

	self.oms.addListener('format', function (marker, status) {
		var iconURL;
		if (status === OverlappingMarkerSpiderfier.markerStatus.SPIDERFIED
			|| status === OverlappingMarkerSpiderfier.markerStatus.SPIDERFIABLE
			|| status === OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIED) {
			iconURL = self.config['template_path'] + '/NAMarkerR.png';
		} else if (status === OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIABLE) {
			iconURL = self.config['template_path'] + '/NAMarkerB.png';
		} else {
			iconURL = null;
		}

		var iconSize = new google.maps.Size(22, 32);
		marker.setIcon({
			url: iconURL,
			size: iconSize,
			scaledSize: iconSize
		});
	});

	self.map.addListener('zoom_changed', function() {
		self.map.addListener('idle', function() {
			var spidered = self.oms.markersNearAnyOtherMarker();
			for (var i = 0; i < spidered.length; i ++) {
				spidered[i].icon.url = self.config['template_path'] + '/NAMarkerR.png';
			}
		});
	});

	// This is necessary to make the Spiderfy work
	self.oms.addListener('click', function (marker) {
		marker.zIndex = 999;
		infoWindow.setContent(marker.desc);
		infoWindow.open(self.map, marker);
	});
	infoWindow.addListener('closeclick', function() {
		jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
	});
	// Add some markers to the map.
	filteredMeetings.map(function (location, i) {
		var marker_html = '<dl><dt><strong>';
		marker_html += location.meeting_name;
		marker_html += '</strong></dt>';
		marker_html += '<dd><em>';
		marker_html += crouton.localization.getDayOfTheWeekWord(location.weekday_tinyint);
		var time = location.start_time.toString().split(':');
		var hour = parseInt(time[0]);
		var minute = parseInt(time[1]);
		var pm = 'AM';
		if (hour >= 12) {
			pm = 'PM';
			if (hour > 12) {
				hour -= 12;
			}
		}
		hour = hour.toString();
		minute = (minute > 9) ? minute.toString() : ('0' + minute.toString());
		marker_html += ' ' + hour + ':' + minute + ' ' + pm;
		marker_html += '</em><br>';
		marker_html += location.location_text;
		marker_html += '<br>';

		if (typeof location.location_street !== "undefined") {
			marker_html += location.location_street + '<br>';
		}
		if (typeof location.location_municipality !== "undefined") {
			marker_html += location.location_municipality + ' ';
		}
		if (typeof location.location_province !== "undefined") {
			marker_html += location.location_province + ' ';
		}
		if (typeof location.location_postal_code_1 !== "undefined") {
			marker_html += location.location_postal_code_1;
		}

		marker_html += '<br>';
		var url = 'https://maps.google.com/maps?q=' + location.latitude + ',' + location.longitude + '&hl=' + self.config['short_language'];
		marker_html += '<a target=\"_blank\" href="' + url + '">';
		marker_html += crouton.localization.getWord('map');
		marker_html += '</a>';
		marker_html += '</dd></dl>';

		var latLng = {"lat": parseFloat(location.latitude), "lng": parseFloat(location.longitude)};

		var marker = new google.maps.Marker({
			position: latLng
		});

		marker['id'] = location['id_bigint'];
		marker['day_id'] = location['weekday_tinyint'];

		self.addToMapObjectCollection(marker);
		self.oms.addMarker(marker);

		self.map_clusters.push(marker);
		google.maps.event.addListener(marker, 'click', function (evt) {
			jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
			jQuery("#meeting-data-row-" + marker['id'] + " > td").addClass("rowHighlight");
			crouton.dayTab(marker['day_id']);
			infoWindow.setContent(marker_html);
			infoWindow.open(self.map, marker);
		});
		return marker;
	});

	// Add a marker clusterer to manage the markers.
	self.markerClusterer = new MarkerClusterer(self.map, self.map_clusters, {
		imagePath: self.config['template_path'] + '/m',
		maxZoom: self.config['map_max_zoom'],
		zoomOnClick: false
	});
};
