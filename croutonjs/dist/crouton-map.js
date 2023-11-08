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

	self.addCurrentLocationPin = function(latitude, longitude) {
		var latlng = new google.maps.LatLng(latitude, longitude);
		self.map.setCenter(latlng);

		var currentLocationMarker = new google.maps.Marker({
			"map": self.map,
			"position": latlng,
		});

		self.addToMapObjectCollection(currentLocationMarker);

		// TODO: needs to show on click only
		/*var infowindow = new google.maps.InfoWindow({
			"content": 'Current Location',
			"position": latlng,
		}).open(self.map, currentLocationMarker);*/
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
CroutonMap.prototype.initialize = function(domElementName, meetingData, formatsData, handlebarMapOptions=null) {
	this.meetingData = meetingData;
	this.formatsData = formatsData;
	this.handlebarMapOptions = handlebarMapOptions;
	this.domElementName = domElementName;
	this.loadGapi('croutonMap.initMap');
}
CroutonMap.prototype.initMap = function(callback) {
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
	self.fillMap(callback);
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
	self.map.fitBounds(bounds);
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

/**
 * @name MarkerClusterer for Google Maps v3
 * @version version 1.0.1
 * @author Luke Mahe
 * @fileoverview
 * The library creates and manages per-zoom-level clusters for large amounts of
 * markers.
 * <br/>
 * This is a v3 implementation of the
 * <a href="http://gmaps-utility-library-dev.googlecode.com/svn/tags/markerclusterer/"
 * >v2 MarkerClusterer</a>.
 */

/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * A Marker Clusterer that clusters markers.
 *
 * @param {google.maps.Map} map The Google map to attach to.
 * @param {Array.<google.maps.Marker>=} opt_markers Optional markers to add to
 *   the cluster.
 * @param {Object=} opt_options support the following options:
 *     'gridSize': (number) The grid size of a cluster in pixels.
 *     'maxZoom': (number) The maximum zoom level that a marker can be part of a
 *                cluster.
 *     'zoomOnClick': (boolean) Whether the default behaviour of clicking on a
 *                    cluster is to zoom into it.
 *     'averageCenter': (boolean) Whether the center of each cluster should be
 *                      the average of all markers in the cluster.
 *     'minimumClusterSize': (number) The minimum number of markers to be in a
 *                           cluster before the markers are hidden and a count
 *                           is shown.
 *     'styles': (object) An object that has style properties:
 *       'url': (string) The image url.
 *       'height': (number) The image height.
 *       'width': (number) The image width.
 *       'anchor': (Array) The anchor position of the label text.
 *       'textColor': (string) The text color.
 *       'textSize': (number) The text size.
 *       'backgroundPosition': (string) The position of the backgound x, y.
 * @constructor
 * @extends google.maps.OverlayView
 */
function MarkerClusterer(map, opt_markers, opt_options) {
	// MarkerClusterer implements google.maps.OverlayView interface. We use the
	// extend function to extend MarkerClusterer with google.maps.OverlayView
	// because it might not always be available when the code is defined so we
	// look for it at the last possible moment. If it doesn't exist now then
	// there is no point going ahead :)
	this.extend(MarkerClusterer, google.maps.OverlayView);
	this.map_ = map;

	/**
	 * @type {Array.<google.maps.Marker>}
	 * @private
	 */
	this.markers_ = [];

	/**
	 *  @type {Array.<Cluster>}
	 */
	this.clusters_ = [];

	this.sizes = [53, 56, 66, 78, 90];

	/**
	 * @private
	 */
	this.styles_ = [];

	/**
	 * @type {boolean}
	 * @private
	 */
	this.ready_ = false;

	var options = opt_options || {};

	/**
	 * @type {number}
	 * @private
	 */
	this.gridSize_ = options['gridSize'] || 60;

	/**
	 * @private
	 */
	this.minClusterSize_ = options['minimumClusterSize'] || 2;


	/**
	 * @type {?number}
	 * @private
	 */
	this.maxZoom_ = options['maxZoom'] || null;

	this.styles_ = options['styles'] || [];

	/**
	 * @type {string}
	 * @private
	 */
	this.imagePath_ = options['imagePath'] ||
		this.MARKER_CLUSTER_IMAGE_PATH_;

	/**
	 * @type {string}
	 * @private
	 */
	this.imageExtension_ = options['imageExtension'] ||
		this.MARKER_CLUSTER_IMAGE_EXTENSION_;

	/**
	 * @type {boolean}
	 * @private
	 */
	this.zoomOnClick_ = true;

	if (options['zoomOnClick'] != undefined) {
		this.zoomOnClick_ = options['zoomOnClick'];
	}

	/**
	 * @type {boolean}
	 * @private
	 */
	this.averageCenter_ = false;

	if (options['averageCenter'] != undefined) {
		this.averageCenter_ = options['averageCenter'];
	}

	this.setupStyles_();

	this.setMap(map);

	/**
	 * @type {number}
	 * @private
	 */
	this.prevZoom_ = this.map_.getZoom();

	// Add the map event listeners
	var that = this;
	google.maps.event.addListener(this.map_, 'zoom_changed', function() {
		// Determines map type and prevent illegal zoom levels
		var zoom = that.map_.getZoom();
		var minZoom = that.map_.minZoom || 0;
		var maxZoom = Math.min(that.map_.maxZoom || 100,
			that.map_.mapTypes[that.map_.getMapTypeId()].maxZoom);
		zoom = Math.min(Math.max(zoom,minZoom),maxZoom);

		if (that.prevZoom_ != zoom) {
			that.prevZoom_ = zoom;
			that.resetViewport();
		}
	});

	google.maps.event.addListener(this.map_, 'idle', function() {
		that.redraw();
	});

	// Finally, add the markers
	if (opt_markers && (opt_markers.length || Object.keys(opt_markers).length)) {
		this.addMarkers(opt_markers, false);
	}
}


/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_PATH_ = '../images/m';


/**
 * The marker cluster image path.
 *
 * @type {string}
 * @private
 */
MarkerClusterer.prototype.MARKER_CLUSTER_IMAGE_EXTENSION_ = 'png';


/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
MarkerClusterer.prototype.extend = function(obj1, obj2) {
	return (function(object) {
		for (var property in object.prototype) {
			this.prototype[property] = object.prototype[property];
		}
		return this;
	}).apply(obj1, [obj2]);
};


/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.onAdd = function() {
	this.setReady_(true);
};

/**
 * Implementaion of the interface method.
 * @ignore
 */
MarkerClusterer.prototype.draw = function() {};

/**
 * Sets up the styles object.
 *
 * @private
 */
MarkerClusterer.prototype.setupStyles_ = function() {
	if (this.styles_.length) {
		return;
	}

	for (var i = 0, size; size = this.sizes[i]; i++) {
		this.styles_.push({
			url: this.imagePath_ + (i + 1) + '.' + this.imageExtension_,
			height: size,
			width: size
		});
	}
};

/**
 *  Fit the map to the bounds of the markers in the clusterer.
 */
MarkerClusterer.prototype.fitMapToMarkers = function() {
	var markers = this.getMarkers();
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0, marker; marker = markers[i]; i++) {
		bounds.extend(marker.getPosition());
	}

	this.map_.fitBounds(bounds);
};


/**
 *  Sets the styles.
 *
 *  @param {Object} styles The style to set.
 */
MarkerClusterer.prototype.setStyles = function(styles) {
	this.styles_ = styles;
};


/**
 *  Gets the styles.
 *
 *  @return {Object} The styles object.
 */
MarkerClusterer.prototype.getStyles = function() {
	return this.styles_;
};


/**
 * Whether zoom on click is set.
 *
 * @return {boolean} True if zoomOnClick_ is set.
 */
MarkerClusterer.prototype.isZoomOnClick = function() {
	return this.zoomOnClick_;
};

/**
 * Whether average center is set.
 *
 * @return {boolean} True if averageCenter_ is set.
 */
MarkerClusterer.prototype.isAverageCenter = function() {
	return this.averageCenter_;
};


/**
 *  Returns the array of markers in the clusterer.
 *
 *  @return {Array.<google.maps.Marker>} The markers.
 */
MarkerClusterer.prototype.getMarkers = function() {
	return this.markers_;
};


/**
 *  Returns the number of markers in the clusterer
 *
 *  @return {Number} The number of markers.
 */
MarkerClusterer.prototype.getTotalMarkers = function() {
	return this.markers_.length;
};


/**
 *  Sets the max zoom for the clusterer.
 *
 *  @param {number} maxZoom The max zoom level.
 */
MarkerClusterer.prototype.setMaxZoom = function(maxZoom) {
	this.maxZoom_ = maxZoom;
};


/**
 *  Gets the max zoom for the clusterer.
 *
 *  @return {number} The max zoom level.
 */
MarkerClusterer.prototype.getMaxZoom = function() {
	return this.maxZoom_;
};


/**
 *  The function for calculating the cluster icon image.
 *
 *  @param {Array.<google.maps.Marker>} markers The markers in the clusterer.
 *  @param {number} numStyles The number of styles available.
 *  @return {Object} A object properties: 'text' (string) and 'index' (number).
 *  @private
 */
MarkerClusterer.prototype.calculator_ = function(markers, numStyles) {
	var index = 0;
	var count = markers.length;
	var dv = count;
	while (dv !== 0) {
		dv = parseInt(dv / 10, 10);
		index++;
	}

	index = Math.min(index, numStyles);
	return {
		text: count,
		index: index
	};
};


/**
 * Set the calculator function.
 *
 * @param {function(Array, number)} calculator The function to set as the
 *     calculator. The function should return a object properties:
 *     'text' (string) and 'index' (number).
 *
 */
MarkerClusterer.prototype.setCalculator = function(calculator) {
	this.calculator_ = calculator;
};


/**
 * Get the calculator function.
 *
 * @return {function(Array, number)} the calculator function.
 */
MarkerClusterer.prototype.getCalculator = function() {
	return this.calculator_;
};


/**
 * Add an array of markers to the clusterer.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarkers = function(markers, opt_nodraw) {
	if (markers.length) {
		for (var i = 0, marker; marker = markers[i]; i++) {
			this.pushMarkerTo_(marker);
		}
	} else if (Object.keys(markers).length) {
		for (var marker in markers) {
			this.pushMarkerTo_(markers[marker]);
		}
	}
	if (!opt_nodraw) {
		this.redraw();
	}
};


/**
 * Pushes a marker to the clusterer.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.pushMarkerTo_ = function(marker) {
	marker.isAdded = false;
	if (marker['draggable']) {
		// If the marker is draggable add a listener so we update the clusters on
		// the drag end.
		var that = this;
		google.maps.event.addListener(marker, 'dragend', function() {
			marker.isAdded = false;
			that.repaint();
		});
	}
	this.markers_.push(marker);
};


/**
 * Adds a marker to the clusterer and redraws if needed.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @param {boolean=} opt_nodraw Whether to redraw the clusters.
 */
MarkerClusterer.prototype.addMarker = function(marker, opt_nodraw) {
	this.pushMarkerTo_(marker);
	if (!opt_nodraw) {
		this.redraw();
	}
};


/**
 * Removes a marker and returns true if removed, false if not
 *
 * @param {google.maps.Marker} marker The marker to remove
 * @return {boolean} Whether the marker was removed or not
 * @private
 */
MarkerClusterer.prototype.removeMarker_ = function(marker) {
	var index = -1;
	if (this.markers_.indexOf) {
		index = this.markers_.indexOf(marker);
	} else {
		for (var i = 0, m; m = this.markers_[i]; i++) {
			if (m == marker) {
				index = i;
				break;
			}
		}
	}

	if (index == -1) {
		// Marker is not in our list of markers.
		return false;
	}

	marker.setMap(null);

	this.markers_.splice(index, 1);

	return true;
};


/**
 * Remove a marker from the cluster.
 *
 * @param {google.maps.Marker} marker The marker to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 * @return {boolean} True if the marker was removed.
 */
MarkerClusterer.prototype.removeMarker = function(marker, opt_nodraw) {
	var removed = this.removeMarker_(marker);

	if (!opt_nodraw && removed) {
		this.resetViewport();
		this.redraw();
		return true;
	} else {
		return false;
	}
};


/**
 * Removes an array of markers from the cluster.
 *
 * @param {Array.<google.maps.Marker>} markers The markers to remove.
 * @param {boolean=} opt_nodraw Optional boolean to force no redraw.
 */
MarkerClusterer.prototype.removeMarkers = function(markers, opt_nodraw) {
	var removed = false;

	for (var i = 0, marker; marker = markers[i]; i++) {
		var r = this.removeMarker_(marker);
		removed = removed || r;
	}

	if (!opt_nodraw && removed) {
		this.resetViewport();
		this.redraw();
		return true;
	}
};


/**
 * Sets the clusterer's ready state.
 *
 * @param {boolean} ready The state.
 * @private
 */
MarkerClusterer.prototype.setReady_ = function(ready) {
	if (!this.ready_) {
		this.ready_ = ready;
		this.createClusters_();
	}
};


/**
 * Returns the number of clusters in the clusterer.
 *
 * @return {number} The number of clusters.
 */
MarkerClusterer.prototype.getTotalClusters = function() {
	return this.clusters_.length;
};


/**
 * Returns the google map that the clusterer is associated with.
 *
 * @return {google.maps.Map} The map.
 */
MarkerClusterer.prototype.getMap = function() {
	return this.map_;
};


/**
 * Sets the google map that the clusterer is associated with.
 *
 * @param {google.maps.Map} map The map.
 */
MarkerClusterer.prototype.setMap = function(map) {
	this.map_ = map;
};


/**
 * Returns the size of the grid.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getGridSize = function() {
	return this.gridSize_;
};


/**
 * Sets the size of the grid.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setGridSize = function(size) {
	this.gridSize_ = size;
};


/**
 * Returns the min cluster size.
 *
 * @return {number} The grid size.
 */
MarkerClusterer.prototype.getMinClusterSize = function() {
	return this.minClusterSize_;
};

/**
 * Sets the min cluster size.
 *
 * @param {number} size The grid size.
 */
MarkerClusterer.prototype.setMinClusterSize = function(size) {
	this.minClusterSize_ = size;
};


/**
 * Extends a bounds object by the grid size.
 *
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 */
MarkerClusterer.prototype.getExtendedBounds = function(bounds) {
	var projection = this.getProjection();

	// Turn the bounds into latlng.
	var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
		bounds.getNorthEast().lng());
	var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
		bounds.getSouthWest().lng());

	// Convert the points to pixels and the extend out by the grid size.
	var trPix = projection.fromLatLngToDivPixel(tr);
	trPix.x += this.gridSize_;
	trPix.y -= this.gridSize_;

	var blPix = projection.fromLatLngToDivPixel(bl);
	blPix.x -= this.gridSize_;
	blPix.y += this.gridSize_;

	// Convert the pixel points back to LatLng
	var ne = projection.fromDivPixelToLatLng(trPix);
	var sw = projection.fromDivPixelToLatLng(blPix);

	// Extend the bounds to contain the new bounds.
	bounds.extend(ne);
	bounds.extend(sw);

	return bounds;
};


/**
 * Determins if a marker is contained in a bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @param {google.maps.LatLngBounds} bounds The bounds to check against.
 * @return {boolean} True if the marker is in the bounds.
 * @private
 */
MarkerClusterer.prototype.isMarkerInBounds_ = function(marker, bounds) {
	return bounds.contains(marker.getPosition());
};


/**
 * Clears all clusters and markers from the clusterer.
 */
MarkerClusterer.prototype.clearMarkers = function() {
	this.resetViewport(true);

	// Set the markers a empty array.
	this.markers_ = [];
};


/**
 * Clears all existing clusters and recreates them.
 * @param {boolean} opt_hide To also hide the marker.
 */
MarkerClusterer.prototype.resetViewport = function(opt_hide) {
	// Remove all the clusters
	for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
		cluster.remove();
	}

	// Reset the markers to not be added and to be invisible.
	for (var i = 0, marker; marker = this.markers_[i]; i++) {
		marker.isAdded = false;
		if (opt_hide) {
			marker.setMap(null);
		}
	}

	this.clusters_ = [];
};

/**
 *
 */
MarkerClusterer.prototype.repaint = function() {
	var oldClusters = this.clusters_.slice();
	this.clusters_.length = 0;
	this.resetViewport();
	this.redraw();

	// Remove the old clusters.
	// Do it in a timeout so the other clusters have been drawn first.
	window.setTimeout(function() {
		for (var i = 0, cluster; cluster = oldClusters[i]; i++) {
			cluster.remove();
		}
	}, 0);
};


/**
 * Redraws the clusters.
 */
MarkerClusterer.prototype.redraw = function() {
	this.createClusters_();
};


/**
 * Calculates the distance between two latlng locations in km.
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 *
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @private
 */
MarkerClusterer.prototype.distanceBetweenPoints_ = function(p1, p2) {
	if (!p1 || !p2) {
		return 0;
	}

	var R = 6371; // Radius of the Earth in km
	var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
	var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;
	return d;
};


/**
 * Add a marker to a cluster, or creates a new cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @private
 */
MarkerClusterer.prototype.addToClosestCluster_ = function(marker) {
	var distance = 40000; // Some large number
	var clusterToAddTo = null;
	var pos = marker.getPosition();
	for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
		var center = cluster.getCenter();
		if (center) {
			var d = this.distanceBetweenPoints_(center, marker.getPosition());
			if (d < distance) {
				distance = d;
				clusterToAddTo = cluster;
			}
		}
	}

	if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)) {
		clusterToAddTo.addMarker(marker);
	} else {
		var cluster = new Cluster(this);
		cluster.addMarker(marker);
		this.clusters_.push(cluster);
	}
};


/**
 * Creates the clusters.
 *
 * @private
 */
MarkerClusterer.prototype.createClusters_ = function() {
	if (!this.ready_) {
		return;
	}

	// Get our current map view bounds.
	// Create a new bounds object so we don't affect the map.
	var mapBounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
		this.map_.getBounds().getNorthEast());
	var bounds = this.getExtendedBounds(mapBounds);

	for (var i = 0, marker; marker = this.markers_[i]; i++) {
		if (!marker.isAdded && this.isMarkerInBounds_(marker, bounds)) {
			this.addToClosestCluster_(marker);
		}
	}
};


/**
 * A cluster that contains markers.
 *
 * @param {MarkerClusterer} markerClusterer The markerclusterer that this
 *     cluster is associated with.
 * @constructor
 * @ignore
 */
function Cluster(markerClusterer) {
	this.markerClusterer_ = markerClusterer;
	this.map_ = markerClusterer.getMap();
	this.gridSize_ = markerClusterer.getGridSize();
	this.minClusterSize_ = markerClusterer.getMinClusterSize();
	this.averageCenter_ = markerClusterer.isAverageCenter();
	this.center_ = null;
	this.markers_ = [];
	this.bounds_ = null;
	this.clusterIcon_ = new ClusterIcon(this, markerClusterer.getStyles(),
		markerClusterer.getGridSize());
}

/**
 * Determins if a marker is already added to the cluster.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker is already added.
 */
Cluster.prototype.isMarkerAlreadyAdded = function(marker) {
	if (this.markers_.indexOf) {
		return this.markers_.indexOf(marker) != -1;
	} else {
		for (var i = 0, m; m = this.markers_[i]; i++) {
			if (m == marker) {
				return true;
			}
		}
	}
	return false;
};


/**
 * Add a marker the cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @return {boolean} True if the marker was added.
 */
Cluster.prototype.addMarker = function(marker) {
	if (this.isMarkerAlreadyAdded(marker)) {
		return false;
	}

	if (!this.center_) {
		this.center_ = marker.getPosition();
		this.calculateBounds_();
	} else {
		if (this.averageCenter_) {
			var l = this.markers_.length + 1;
			var lat = (this.center_.lat() * (l-1) + marker.getPosition().lat()) / l;
			var lng = (this.center_.lng() * (l-1) + marker.getPosition().lng()) / l;
			this.center_ = new google.maps.LatLng(lat, lng);
			this.calculateBounds_();
		}
	}

	marker.isAdded = true;
	this.markers_.push(marker);

	var len = this.markers_.length;
	if (len < this.minClusterSize_ && marker.getMap() != this.map_) {
		// Min cluster size not reached so show the marker.
		marker.setMap(this.map_);
	}

	if (len == this.minClusterSize_) {
		// Hide the markers that were showing.
		for (var i = 0; i < len; i++) {
			this.markers_[i].setMap(null);
		}
	}

	if (len >= this.minClusterSize_) {
		marker.setMap(null);
	}

	this.updateIcon();
	return true;
};


/**
 * Returns the marker clusterer that the cluster is associated with.
 *
 * @return {MarkerClusterer} The associated marker clusterer.
 */
Cluster.prototype.getMarkerClusterer = function() {
	return this.markerClusterer_;
};


/**
 * Returns the bounds of the cluster.
 *
 * @return {google.maps.LatLngBounds} the cluster bounds.
 */
Cluster.prototype.getBounds = function() {
	var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
	var markers = this.getMarkers();
	for (var i = 0, marker; marker = markers[i]; i++) {
		bounds.extend(marker.getPosition());
	}
	return bounds;
};


/**
 * Removes the cluster
 */
Cluster.prototype.remove = function() {
	this.clusterIcon_.remove();
	this.markers_.length = 0;
	delete this.markers_;
};


/**
 * Returns the center of the cluster.
 *
 * @return {number} The cluster center.
 */
Cluster.prototype.getSize = function() {
	return this.markers_.length;
};


/**
 * Returns the center of the cluster.
 *
 * @return {Array.<google.maps.Marker>} The cluster center.
 */
Cluster.prototype.getMarkers = function() {
	return this.markers_;
};


/**
 * Returns the center of the cluster.
 *
 * @return {google.maps.LatLng} The cluster center.
 */
Cluster.prototype.getCenter = function() {
	return this.center_;
};


/**
 * Calculated the extended bounds of the cluster with the grid.
 *
 * @private
 */
Cluster.prototype.calculateBounds_ = function() {
	var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
	this.bounds_ = this.markerClusterer_.getExtendedBounds(bounds);
};


/**
 * Determines if a marker lies in the clusters bounds.
 *
 * @param {google.maps.Marker} marker The marker to check.
 * @return {boolean} True if the marker lies in the bounds.
 */
Cluster.prototype.isMarkerInClusterBounds = function(marker) {
	return this.bounds_.contains(marker.getPosition());
};


/**
 * Returns the map that the cluster is associated with.
 *
 * @return {google.maps.Map} The map.
 */
Cluster.prototype.getMap = function() {
	return this.map_;
};


/**
 * Updates the cluster icon
 */
Cluster.prototype.updateIcon = function() {
	var zoom = this.map_.getZoom();
	var mz = this.markerClusterer_.getMaxZoom();

	if (mz && zoom > mz) {
		// The zoom is greater than our max zoom so show all the markers in cluster.
		for (var i = 0, marker; marker = this.markers_[i]; i++) {
			marker.setMap(this.map_);
		}
		return;
	}

	if (this.markers_.length < this.minClusterSize_) {
		// Min cluster size not yet reached.
		this.clusterIcon_.hide();
		return;
	}

	var numStyles = this.markerClusterer_.getStyles().length;
	var sums = this.markerClusterer_.getCalculator()(this.markers_, numStyles);
	this.clusterIcon_.setCenter(this.center_);
	this.clusterIcon_.setSums(sums);
	this.clusterIcon_.show();
};


/**
 * A cluster icon
 *
 * @param {Cluster} cluster The cluster to be associated with.
 * @param {Object} styles An object that has style properties:
 *     'url': (string) The image url.
 *     'height': (number) The image height.
 *     'width': (number) The image width.
 *     'anchor': (Array) The anchor position of the label text.
 *     'textColor': (string) The text color.
 *     'textSize': (number) The text size.
 *     'backgroundPosition: (string) The background postition x, y.
 * @param {number=} opt_padding Optional padding to apply to the cluster icon.
 * @constructor
 * @extends google.maps.OverlayView
 * @ignore
 */
function ClusterIcon(cluster, styles, opt_padding) {
	cluster.getMarkerClusterer().extend(ClusterIcon, google.maps.OverlayView);

	this.styles_ = styles;
	this.padding_ = opt_padding || 0;
	this.cluster_ = cluster;
	this.center_ = null;
	this.map_ = cluster.getMap();
	this.div_ = null;
	this.sums_ = null;
	this.visible_ = false;

	this.setMap(this.map_);
}


/**
 * Triggers the clusterclick event and zoom's if the option is set.
 */
ClusterIcon.prototype.triggerClusterClick = function() {
	var markerClusterer = this.cluster_.getMarkerClusterer();

	// Trigger the clusterclick event.
	google.maps.event.trigger(markerClusterer, 'clusterclick', this.cluster_);

	if (markerClusterer.isZoomOnClick()) {
		// Zoom into the cluster.
		this.map_.fitBounds(this.cluster_.getBounds());
	}
};


/**
 * Adding the cluster icon to the dom.
 * @ignore
 */
ClusterIcon.prototype.onAdd = function() {
	this.div_ = document.createElement('DIV');
	if (this.visible_) {
		var pos = this.getPosFromLatLng_(this.center_);
		this.div_.style.cssText = this.createCss(pos);
		this.div_.innerHTML = this.sums_.text;
	}

	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(this.div_);

	var that = this;
	google.maps.event.addDomListener(this.div_, 'click', function() {
		that.triggerClusterClick();
	});
};


/**
 * Returns the position to place the div dending on the latlng.
 *
 * @param {google.maps.LatLng} latlng The position in latlng.
 * @return {google.maps.Point} The position in pixels.
 * @private
 */
ClusterIcon.prototype.getPosFromLatLng_ = function(latlng) {
	var pos = this.getProjection().fromLatLngToDivPixel(latlng);
	pos.x -= parseInt(this.width_ / 2, 10);
	pos.y -= parseInt(this.height_ / 2, 10);
	return pos;
};


/**
 * Draw the icon.
 * @ignore
 */
ClusterIcon.prototype.draw = function() {
	if (this.visible_) {
		var pos = this.getPosFromLatLng_(this.center_);
		this.div_.style.top = pos.y + 'px';
		this.div_.style.left = pos.x + 'px';
	}
};


/**
 * Hide the icon.
 */
ClusterIcon.prototype.hide = function() {
	if (this.div_) {
		this.div_.style.display = 'none';
	}
	this.visible_ = false;
};


/**
 * Position and show the icon.
 */
ClusterIcon.prototype.show = function() {
	if (this.div_) {
		var pos = this.getPosFromLatLng_(this.center_);
		this.div_.style.cssText = this.createCss(pos);
		this.div_.style.display = '';
	}
	this.visible_ = true;
};


/**
 * Remove the icon from the map
 */
ClusterIcon.prototype.remove = function() {
	this.setMap(null);
};


/**
 * Implementation of the onRemove interface.
 * @ignore
 */
ClusterIcon.prototype.onRemove = function() {
	if (this.div_ && this.div_.parentNode) {
		this.hide();
		this.div_.parentNode.removeChild(this.div_);
		this.div_ = null;
	}
};


/**
 * Set the sums of the icon.
 *
 * @param {Object} sums The sums containing:
 *   'text': (string) The text to display in the icon.
 *   'index': (number) The style index of the icon.
 */
ClusterIcon.prototype.setSums = function(sums) {
	this.sums_ = sums;
	this.text_ = sums.text;
	this.index_ = sums.index;
	if (this.div_) {
		this.div_.innerHTML = sums.text;
	}

	this.useStyle();
};


/**
 * Sets the icon to the the styles.
 */
ClusterIcon.prototype.useStyle = function() {
	var index = Math.max(0, this.sums_.index - 1);
	index = Math.min(this.styles_.length - 1, index);
	var style = this.styles_[index];
	this.url_ = style['url'];
	this.height_ = style['height'];
	this.width_ = style['width'];
	this.textColor_ = style['textColor'];
	this.anchor_ = style['anchor'];
	this.textSize_ = style['textSize'];
	this.backgroundPosition_ = style['backgroundPosition'];
};


/**
 * Sets the center of the icon.
 *
 * @param {google.maps.LatLng} center The latlng to set as the center.
 */
ClusterIcon.prototype.setCenter = function(center) {
	this.center_ = center;
};


/**
 * Create the css text based on the position of the icon.
 *
 * @param {google.maps.Point} pos The position.
 * @return {string} The css style text.
 */
ClusterIcon.prototype.createCss = function(pos) {
	var style = [];
	style.push('background-image:url(' + this.url_ + ');');
	var backgroundPosition = this.backgroundPosition_ ? this.backgroundPosition_ : '0 0';
	style.push('background-position:' + backgroundPosition + ';');

	if (typeof this.anchor_ === 'object') {
		if (typeof this.anchor_[0] === 'number' && this.anchor_[0] > 0 &&
			this.anchor_[0] < this.height_) {
			style.push('height:' + (this.height_ - this.anchor_[0]) +
				'px; padding-top:' + this.anchor_[0] + 'px;');
		} else {
			style.push('height:' + this.height_ + 'px; line-height:' + this.height_ +
				'px;');
		}
		if (typeof this.anchor_[1] === 'number' && this.anchor_[1] > 0 &&
			this.anchor_[1] < this.width_) {
			style.push('width:' + (this.width_ - this.anchor_[1]) +
				'px; padding-left:' + this.anchor_[1] + 'px;');
		} else {
			style.push('width:' + this.width_ + 'px; text-align:center;');
		}
	} else {
		style.push('height:' + this.height_ + 'px; line-height:' +
			this.height_ + 'px; width:' + this.width_ + 'px; text-align:center;');
	}

	var txtColor = this.textColor_ ? this.textColor_ : 'black';
	var txtSize = this.textSize_ ? this.textSize_ : 11;

	style.push('cursor:pointer; top:' + pos.y + 'px; left:' +
		pos.x + 'px; color:' + txtColor + '; position:absolute; font-size:' +
		txtSize + 'px; font-family:Arial,sans-serif; font-weight:bold');
	return style.join('');
};

// Generated by CoffeeScript 1.12.2

/** @preserve OverlappingMarkerSpiderfier
https://github.com/jawj/OverlappingMarkerSpiderfier
Copyright (c) 2011 - 2017 George MacKerron
Released under the MIT licence: http://opensource.org/licenses/mit-license
Note: The Google Maps API v3 must be included *before* this code
 */

(function() {
	var callbackName, callbackRegEx, ref, ref1, scriptTag, tag,
		hasProp = {}.hasOwnProperty,
		slice = [].slice;

	this['OverlappingMarkerSpiderfier'] = (function() {
		var ge, gm, j, len, mt, p, ref, twoPi, x;

		p = _Class.prototype;

		ref = [_Class, p];
		for (j = 0, len = ref.length; j < len; j++) {
			x = ref[j];
			x['VERSION'] = '1.0.3';
		}

		twoPi = Math.PI * 2;

		gm = ge = mt = null;

		_Class['markerStatus'] = {
			'SPIDERFIED': 'SPIDERFIED',
			'SPIDERFIABLE': 'SPIDERFIABLE',
			'UNSPIDERFIABLE': 'UNSPIDERFIABLE',
			'UNSPIDERFIED': 'UNSPIDERFIED'
		};

		function _Class(map1, opts) {
			var k, lcH, lcU, v;
			this.map = map1;
			if (opts == null) {
				opts = {};
			}
			if (this.constructor.hasInitialized == null) {
				this.constructor.hasInitialized = true;
				gm = google.maps;
				ge = gm.event;
				mt = gm.MapTypeId;
				p['keepSpiderfied'] = false;
				p['ignoreMapClick'] = false;
				p['markersWontHide'] = false;
				p['markersWontMove'] = false;
				p['basicFormatEvents'] = false;
				p['nearbyDistance'] = 20;
				p['circleSpiralSwitchover'] = 9;
				p['circleFootSeparation'] = 23;
				p['circleStartAngle'] = twoPi / 12;
				p['spiralFootSeparation'] = 26;
				p['spiralLengthStart'] = 11;
				p['spiralLengthFactor'] = 4;
				p['spiderfiedZIndex'] = gm.Marker.MAX_ZINDEX + 20000;
				p['highlightedLegZIndex'] = gm.Marker.MAX_ZINDEX + 10000;
				p['usualLegZIndex'] = gm.Marker.MAX_ZINDEX + 1;
				p['legWeight'] = 1.5;
				p['legColors'] = {
					'usual': {},
					'highlighted': {}
				};
				lcU = p['legColors']['usual'];
				lcH = p['legColors']['highlighted'];
				lcU[mt.HYBRID] = lcU[mt.SATELLITE] = '#fff';
				lcH[mt.HYBRID] = lcH[mt.SATELLITE] = '#f00';
				lcU[mt.TERRAIN] = lcU[mt.ROADMAP] = '#444';
				lcH[mt.TERRAIN] = lcH[mt.ROADMAP] = '#f00';
				this.constructor.ProjHelper = function(map) {
					return this.setMap(map);
				};
				this.constructor.ProjHelper.prototype = new gm.OverlayView();
				this.constructor.ProjHelper.prototype['draw'] = function() {};
			}
			for (k in opts) {
				if (!hasProp.call(opts, k)) continue;
				v = opts[k];
				this[k] = v;
			}
			this.projHelper = new this.constructor.ProjHelper(this.map);
			this.initMarkerArrays();
			this.listeners = {};
			this.formatIdleListener = this.formatTimeoutId = null;
			this.addListener('click', function(marker, e) {
				return ge.trigger(marker, 'spider_click', e);
			});
			this.addListener('format', function(marker, status) {
				return ge.trigger(marker, 'spider_format', status);
			});
			if (!this['ignoreMapClick']) {
				ge.addListener(this.map, 'click', (function(_this) {
					return function() {
						return _this['unspiderfy']();
					};
				})(this));
			}
			ge.addListener(this.map, 'maptypeid_changed', (function(_this) {
				return function() {
					return _this['unspiderfy']();
				};
			})(this));
			ge.addListener(this.map, 'zoom_changed', (function(_this) {
				return function() {
					_this['unspiderfy']();
					if (!_this['basicFormatEvents']) {
						return _this.formatMarkers();
					}
				};
			})(this));
		}

		p.initMarkerArrays = function() {
			this.markers = [];
			return this.markerListenerRefs = [];
		};

		p['addMarker'] = function(marker, spiderClickHandler) {
			marker.setMap(this.map);
			return this['trackMarker'](marker, spiderClickHandler);
		};

		p['trackMarker'] = function(marker, spiderClickHandler) {
			var listenerRefs;
			if (marker['_oms'] != null) {
				return this;
			}
			marker['_oms'] = true;
			listenerRefs = [
				ge.addListener(marker, 'click', (function(_this) {
					return function(e) {
						return _this.spiderListener(marker, e);
					};
				})(this))
			];
			if (!this['markersWontHide']) {
				listenerRefs.push(ge.addListener(marker, 'visible_changed', (function(_this) {
					return function() {
						return _this.markerChangeListener(marker, false);
					};
				})(this)));
			}
			if (!this['markersWontMove']) {
				listenerRefs.push(ge.addListener(marker, 'position_changed', (function(_this) {
					return function() {
						return _this.markerChangeListener(marker, true);
					};
				})(this)));
			}
			if (spiderClickHandler != null) {
				listenerRefs.push(ge.addListener(marker, 'spider_click', spiderClickHandler));
			}
			this.markerListenerRefs.push(listenerRefs);
			this.markers.push(marker);
			if (this['basicFormatEvents']) {
				this.trigger('format', marker, this.constructor['markerStatus']['UNSPIDERFIED']);
			} else {
				this.trigger('format', marker, this.constructor['markerStatus']['UNSPIDERFIABLE']);
				this.formatMarkers();
			}
			return this;
		};

		p.markerChangeListener = function(marker, positionChanged) {
			if (this.spiderfying || this.unspiderfying) {
				return;
			}
			if ((marker['_omsData'] != null) && (positionChanged || !marker.getVisible())) {
				this['unspiderfy'](positionChanged ? marker : null);
			}
			return this.formatMarkers();
		};

		p['getMarkers'] = function() {
			return this.markers.slice(0);
		};

		p['removeMarker'] = function(marker) {
			this['forgetMarker'](marker);
			return marker.setMap(null);
		};

		p['forgetMarker'] = function(marker) {
			var i, l, len1, listenerRef, listenerRefs;
			if (marker['_omsData'] != null) {
				this['unspiderfy']();
			}
			i = this.arrIndexOf(this.markers, marker);
			if (i < 0) {
				return this;
			}
			listenerRefs = this.markerListenerRefs.splice(i, 1)[0];
			for (l = 0, len1 = listenerRefs.length; l < len1; l++) {
				listenerRef = listenerRefs[l];
				ge.removeListener(listenerRef);
			}
			delete marker['_oms'];
			this.markers.splice(i, 1);
			this.formatMarkers();
			return this;
		};

		p['removeAllMarkers'] = p['clearMarkers'] = function() {
			var l, len1, marker, markers;
			markers = this['getMarkers']();
			this['forgetAllMarkers']();
			for (l = 0, len1 = markers.length; l < len1; l++) {
				marker = markers[l];
				marker.setMap(null);
			}
			return this;
		};

		p['forgetAllMarkers'] = function() {
			var i, l, len1, len2, listenerRef, listenerRefs, marker, n, ref1;
			this['unspiderfy']();
			ref1 = this.markers;
			for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
				marker = ref1[i];
				listenerRefs = this.markerListenerRefs[i];
				for (n = 0, len2 = listenerRefs.length; n < len2; n++) {
					listenerRef = listenerRefs[n];
					ge.removeListener(listenerRef);
				}
				delete marker['_oms'];
			}
			this.initMarkerArrays();
			return this;
		};

		p['addListener'] = function(eventName, func) {
			var base;
			((base = this.listeners)[eventName] != null ? base[eventName] : base[eventName] = []).push(func);
			return this;
		};

		p['removeListener'] = function(eventName, func) {
			var i;
			i = this.arrIndexOf(this.listeners[eventName], func);
			if (!(i < 0)) {
				this.listeners[eventName].splice(i, 1);
			}
			return this;
		};

		p['clearListeners'] = function(eventName) {
			this.listeners[eventName] = [];
			return this;
		};

		p.trigger = function() {
			var args, eventName, func, l, len1, ref1, ref2, results;
			eventName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
			ref2 = (ref1 = this.listeners[eventName]) != null ? ref1 : [];
			results = [];
			for (l = 0, len1 = ref2.length; l < len1; l++) {
				func = ref2[l];
				results.push(func.apply(null, args));
			}
			return results;
		};

		p.generatePtsCircle = function(count, centerPt) {
			var angle, angleStep, circumference, i, l, legLength, ref1, results;
			circumference = this['circleFootSeparation'] * (2 + count);
			legLength = circumference / twoPi;
			angleStep = twoPi / count;
			results = [];
			for (i = l = 0, ref1 = count; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
				angle = this['circleStartAngle'] + i * angleStep;
				results.push(new gm.Point(centerPt.x + legLength * Math.cos(angle), centerPt.y + legLength * Math.sin(angle)));
			}
			return results;
		};

		p.generatePtsSpiral = function(count, centerPt) {
			var angle, i, l, legLength, pt, ref1, results;
			legLength = this['spiralLengthStart'];
			angle = 0;
			results = [];
			for (i = l = 0, ref1 = count; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
				angle += this['spiralFootSeparation'] / legLength + i * 0.0005;
				pt = new gm.Point(centerPt.x + legLength * Math.cos(angle), centerPt.y + legLength * Math.sin(angle));
				legLength += twoPi * this['spiralLengthFactor'] / angle;
				results.push(pt);
			}
			return results;
		};

		p.spiderListener = function(marker, e) {
			var l, len1, m, mPt, markerPt, markerSpiderfied, nDist, nearbyMarkerData, nonNearbyMarkers, pxSq, ref1;
			markerSpiderfied = marker['_omsData'] != null;
			if (!(markerSpiderfied && this['keepSpiderfied'])) {
				this['unspiderfy']();
			}
			if (markerSpiderfied || this.map.getStreetView().getVisible() || this.map.getMapTypeId() === 'GoogleEarthAPI') {
				return this.trigger('click', marker, e);
			} else {
				nearbyMarkerData = [];
				nonNearbyMarkers = [];
				nDist = this['nearbyDistance'];
				pxSq = nDist * nDist;
				markerPt = this.llToPt(marker.position);
				ref1 = this.markers;
				for (l = 0, len1 = ref1.length; l < len1; l++) {
					m = ref1[l];
					if (!((m.map != null) && m.getVisible())) {
						continue;
					}
					mPt = this.llToPt(m.position);
					if (this.ptDistanceSq(mPt, markerPt) < pxSq) {
						nearbyMarkerData.push({
							marker: m,
							markerPt: mPt
						});
					} else {
						nonNearbyMarkers.push(m);
					}
				}
				if (nearbyMarkerData.length === 1) {
					return this.trigger('click', marker, e);
				} else {
					return this.spiderfy(nearbyMarkerData, nonNearbyMarkers);
				}
			}
		};

		p['markersNearMarker'] = function(marker, firstOnly) {
			var l, len1, m, mPt, markerPt, markers, nDist, pxSq, ref1, ref2, ref3;
			if (firstOnly == null) {
				firstOnly = false;
			}
			if (this.projHelper.getProjection() == null) {
				throw "Must wait for 'idle' event on map before calling markersNearMarker";
			}
			nDist = this['nearbyDistance'];
			pxSq = nDist * nDist;
			markerPt = this.llToPt(marker.position);
			markers = [];
			ref1 = this.markers;
			for (l = 0, len1 = ref1.length; l < len1; l++) {
				m = ref1[l];
				if (m === marker || (m.map == null) || !m.getVisible()) {
					continue;
				}
				mPt = this.llToPt((ref2 = (ref3 = m['_omsData']) != null ? ref3.usualPosition : void 0) != null ? ref2 : m.position);
				if (this.ptDistanceSq(mPt, markerPt) < pxSq) {
					markers.push(m);
					if (firstOnly) {
						break;
					}
				}
			}
			return markers;
		};

		p.markerProximityData = function() {
			var i1, i2, l, len1, len2, m, m1, m1Data, m2, m2Data, mData, n, nDist, pxSq, ref1, ref2;
			if (this.projHelper.getProjection() == null) {
				throw "Must wait for 'idle' event on map before calling markersNearAnyOtherMarker";
			}
			nDist = this['nearbyDistance'];
			pxSq = nDist * nDist;
			mData = (function() {
				var l, len1, ref1, ref2, ref3, results;
				ref1 = this.markers;
				results = [];
				for (l = 0, len1 = ref1.length; l < len1; l++) {
					m = ref1[l];
					results.push({
						pt: this.llToPt((ref2 = (ref3 = m['_omsData']) != null ? ref3.usualPosition : void 0) != null ? ref2 : m.position),
						willSpiderfy: false
					});
				}
				return results;
			}).call(this);
			ref1 = this.markers;
			for (i1 = l = 0, len1 = ref1.length; l < len1; i1 = ++l) {
				m1 = ref1[i1];
				if (!((m1.getMap() != null) && m1.getVisible())) {
					continue;
				}
				m1Data = mData[i1];
				if (m1Data.willSpiderfy) {
					continue;
				}
				ref2 = this.markers;
				for (i2 = n = 0, len2 = ref2.length; n < len2; i2 = ++n) {
					m2 = ref2[i2];
					if (i2 === i1) {
						continue;
					}
					if (!((m2.getMap() != null) && m2.getVisible())) {
						continue;
					}
					m2Data = mData[i2];
					if (i2 < i1 && !m2Data.willSpiderfy) {
						continue;
					}
					if (this.ptDistanceSq(m1Data.pt, m2Data.pt) < pxSq) {
						m1Data.willSpiderfy = m2Data.willSpiderfy = true;
						break;
					}
				}
			}
			return mData;
		};

		p['markersNearAnyOtherMarker'] = function() {
			var i, l, len1, m, mData, ref1, results;
			mData = this.markerProximityData();
			ref1 = this.markers;
			results = [];
			for (i = l = 0, len1 = ref1.length; l < len1; i = ++l) {
				m = ref1[i];
				if (mData[i].willSpiderfy) {
					results.push(m);
				}
			}
			return results;
		};

		p.setImmediate = function(func) {
			return window.setTimeout(func, 0);
		};

		p.formatMarkers = function() {
			if (this['basicFormatEvents']) {
				return;
			}
			if (this.formatTimeoutId != null) {
				return;
			}
			return this.formatTimeoutId = this.setImmediate((function(_this) {
				return function() {
					_this.formatTimeoutId = null;
					if (_this.projHelper.getProjection() != null) {
						return _this._formatMarkers();
					} else {
						if (_this.formatIdleListener != null) {
							return;
						}
						return _this.formatIdleListener = ge.addListenerOnce(_this.map, 'idle', function() {
							return _this._formatMarkers();
						});
					}
				};
			})(this));
		};

		p._formatMarkers = function() {
			var i, l, len1, len2, marker, n, proximities, ref1, results, results1, status;
			if (this['basicFormatEvents']) {
				results = [];
				for (l = 0, len1 = markers.length; l < len1; l++) {
					marker = markers[l];
					status = marker['_omsData'] != null ? 'SPIDERFIED' : 'UNSPIDERFIED';
					results.push(this.trigger('format', marker, this.constructor['markerStatus'][status]));
				}
				return results;
			} else {
				proximities = this.markerProximityData();
				ref1 = this.markers;
				results1 = [];
				for (i = n = 0, len2 = ref1.length; n < len2; i = ++n) {
					marker = ref1[i];
					status = marker['_omsData'] != null ? 'SPIDERFIED' : proximities[i].willSpiderfy ? 'SPIDERFIABLE' : 'UNSPIDERFIABLE';
					results1.push(this.trigger('format', marker, this.constructor['markerStatus'][status]));
				}
				return results1;
			}
		};

		p.makeHighlightListenerFuncs = function(marker) {
			return {
				highlight: (function(_this) {
					return function() {
						return marker['_omsData'].leg.setOptions({
							strokeColor: _this['legColors']['highlighted'][_this.map.mapTypeId],
							zIndex: _this['highlightedLegZIndex']
						});
					};
				})(this),
				unhighlight: (function(_this) {
					return function() {
						return marker['_omsData'].leg.setOptions({
							strokeColor: _this['legColors']['usual'][_this.map.mapTypeId],
							zIndex: _this['usualLegZIndex']
						});
					};
				})(this)
			};
		};

		p.spiderfy = function(markerData, nonNearbyMarkers) {
			var bodyPt, footLl, footPt, footPts, highlightListenerFuncs, leg, marker, md, nearestMarkerDatum, numFeet, spiderfiedMarkers;
			this.spiderfying = true;
			numFeet = markerData.length;
			bodyPt = this.ptAverage((function() {
				var l, len1, results;
				results = [];
				for (l = 0, len1 = markerData.length; l < len1; l++) {
					md = markerData[l];
					results.push(md.markerPt);
				}
				return results;
			})());
			footPts = numFeet >= this['circleSpiralSwitchover'] ? this.generatePtsSpiral(numFeet, bodyPt).reverse() : this.generatePtsCircle(numFeet, bodyPt);
			spiderfiedMarkers = (function() {
				var l, len1, results;
				results = [];
				for (l = 0, len1 = footPts.length; l < len1; l++) {
					footPt = footPts[l];
					footLl = this.ptToLl(footPt);
					nearestMarkerDatum = this.minExtract(markerData, (function(_this) {
						return function(md) {
							return _this.ptDistanceSq(md.markerPt, footPt);
						};
					})(this));
					marker = nearestMarkerDatum.marker;
					leg = new gm.Polyline({
						map: this.map,
						path: [marker.position, footLl],
						strokeColor: this['legColors']['usual'][this.map.mapTypeId],
						strokeWeight: this['legWeight'],
						zIndex: this['usualLegZIndex']
					});
					marker['_omsData'] = {
						usualPosition: marker.getPosition(),
						usualZIndex: marker.getZIndex(),
						leg: leg
					};
					if (this['legColors']['highlighted'][this.map.mapTypeId] !== this['legColors']['usual'][this.map.mapTypeId]) {
						highlightListenerFuncs = this.makeHighlightListenerFuncs(marker);
						marker['_omsData'].hightlightListeners = {
							highlight: ge.addListener(marker, 'mouseover', highlightListenerFuncs.highlight),
							unhighlight: ge.addListener(marker, 'mouseout', highlightListenerFuncs.unhighlight)
						};
					}
					this.trigger('format', marker, this.constructor['markerStatus']['SPIDERFIED']);
					marker.setPosition(footLl);
					marker.setZIndex(Math.round(this['spiderfiedZIndex'] + footPt.y));
					results.push(marker);
				}
				return results;
			}).call(this);
			delete this.spiderfying;
			this.spiderfied = true;
			return this.trigger('spiderfy', spiderfiedMarkers, nonNearbyMarkers);
		};

		p['unspiderfy'] = function(markerNotToMove) {
			var l, len1, listeners, marker, nonNearbyMarkers, ref1, status, unspiderfiedMarkers;
			if (markerNotToMove == null) {
				markerNotToMove = null;
			}
			if (this.spiderfied == null) {
				return this;
			}
			this.unspiderfying = true;
			unspiderfiedMarkers = [];
			nonNearbyMarkers = [];
			ref1 = this.markers;
			for (l = 0, len1 = ref1.length; l < len1; l++) {
				marker = ref1[l];
				if (marker['_omsData'] != null) {
					marker['_omsData'].leg.setMap(null);
					if (marker !== markerNotToMove) {
						marker.setPosition(marker['_omsData'].usualPosition);
					}
					marker.setZIndex(marker['_omsData'].usualZIndex);
					listeners = marker['_omsData'].hightlightListeners;
					if (listeners != null) {
						ge.removeListener(listeners.highlight);
						ge.removeListener(listeners.unhighlight);
					}
					delete marker['_omsData'];
					if (marker !== markerNotToMove) {
						status = this['basicFormatEvents'] ? 'UNSPIDERFIED' : 'SPIDERFIABLE';
						this.trigger('format', marker, this.constructor['markerStatus'][status]);
					}
					unspiderfiedMarkers.push(marker);
				} else {
					nonNearbyMarkers.push(marker);
				}
			}
			delete this.unspiderfying;
			delete this.spiderfied;
			this.trigger('unspiderfy', unspiderfiedMarkers, nonNearbyMarkers);
			return this;
		};

		p.ptDistanceSq = function(pt1, pt2) {
			var dx, dy;
			dx = pt1.x - pt2.x;
			dy = pt1.y - pt2.y;
			return dx * dx + dy * dy;
		};

		p.ptAverage = function(pts) {
			var l, len1, numPts, pt, sumX, sumY;
			sumX = sumY = 0;
			for (l = 0, len1 = pts.length; l < len1; l++) {
				pt = pts[l];
				sumX += pt.x;
				sumY += pt.y;
			}
			numPts = pts.length;
			return new gm.Point(sumX / numPts, sumY / numPts);
		};

		p.llToPt = function(ll) {
			return this.projHelper.getProjection().fromLatLngToDivPixel(ll);
		};

		p.ptToLl = function(pt) {
			return this.projHelper.getProjection().fromDivPixelToLatLng(pt);
		};

		p.minExtract = function(set, func) {
			var bestIndex, bestVal, index, item, l, len1, val;
			for (index = l = 0, len1 = set.length; l < len1; index = ++l) {
				item = set[index];
				val = func(item);
				if ((typeof bestIndex === "undefined" || bestIndex === null) || val < bestVal) {
					bestVal = val;
					bestIndex = index;
				}
			}
			return set.splice(bestIndex, 1)[0];
		};

		p.arrIndexOf = function(arr, obj) {
			var i, l, len1, o;
			if (arr.indexOf != null) {
				return arr.indexOf(obj);
			}
			for (i = l = 0, len1 = arr.length; l < len1; i = ++l) {
				o = arr[i];
				if (o === obj) {
					return i;
				}
			}
			return -1;
		};

		return _Class;

	})();

	callbackRegEx = /(\?.*(&|&amp;)|\?)spiderfier_callback=(\w+)/;

	scriptTag = document.currentScript;

	if (scriptTag == null) {
		scriptTag = ((function() {
			var j, len, ref, ref1, results;
			ref = document.getElementsByTagName('script');
			results = [];
			for (j = 0, len = ref.length; j < len; j++) {
				tag = ref[j];
				if ((ref1 = tag.getAttribute('src')) != null ? ref1.match(callbackRegEx) : void 0) {
					results.push(tag);
				}
			}
			return results;
		})())[0];
	}

	if (scriptTag != null) {
		callbackName = (ref = scriptTag.getAttribute('src')) != null ? (ref1 = ref.match(callbackRegEx)) != null ? ref1[3] : void 0 : void 0;
		if (callbackName) {
			if (typeof window[callbackName] === "function") {
				window[callbackName]();
			}
		}
	}

	if (typeof window['spiderfier_callback'] === "function") {
		window['spiderfier_callback']();
	}

}).call(this);
