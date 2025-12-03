function MapDelegate(config) {
    var g_icon_image_single = L.icon({
		iconUrl: config.BMLTPlugin_images+"/NAMarker.png",
		shadowUrl: config.BMLTPlugin_images+"/NAMarkerS.png",
		iconSize:     [23, 32], // size of the icon
		shadowSize:   [43, 32], // size of the shadow
		iconAnchor:   [12, 32], // point of the icon which will correspond to marker's location
		shadowAnchor: [12, 32],  // the same for the shadow
		popupAnchor:  [0, -32] // point from which the popup should open relative to the iconAnchor
	});
	var g_icon_image_multi = L.icon({
		iconUrl: config.BMLTPlugin_images+"/NAMarkerG.png",
		shadowUrl: config.BMLTPlugin_images+"/NAMarkerS.png",
		iconSize:     [23, 32], // size of the icon
		shadowSize:   [43, 32], // size of the shadow
		iconAnchor:   [12, 32], // point of the icon which will correspond to marker's location
		shadowAnchor: [12, 32],  // the same for the shadow
		popupAnchor:  [0, -32] // point from which the popup should open relative to the iconAnchor
	});
	var g_icon_image_selected = L.icon({
		iconUrl: config.BMLTPlugin_images+"/NAMarkerSel.png",
		shadowUrl: config.BMLTPlugin_images+"/NAMarkerS.png",
		iconSize:     [23, 32], // size of the icon
		shadowSize:   [43, 32], // size of the shadow
		iconAnchor:   [12, 32], // point of the icon which will correspond to marker's location
		shadowAnchor: [12, 32],  // the same for the shadow
		popupAnchor:  [12, -32] // point from which the popup should open relative to the iconAnchor
    });
	var g_icon_image_searchpoimt = L.icon({
		iconUrl: config.BMLTPlugin_images+"/SearchPoint.png",
		shadowUrl: config.BMLTPlugin_images+"/NAMarkerS.png",
		iconSize:     [23, 32], // size of the icon
		shadowSize:   [43, 32], // size of the shadow
		iconAnchor:   [12, 32], // point of the icon which will correspond to marker's location
		shadowAnchor: [12, 32],  // the same for the shadow
		popupAnchor:  [12, -32] // point from which the popup should open relative to the iconAnchor
    });
    var	gAllMarkers = [];				///< Holds all the markers.
	var gMainMap;
	var gTileLayer;
	var gClusterLayer = null;
	var gSearchPointMarker = false;
	var gOpenMarker = false;
    function createMap(inDiv, inCenter, inHidden = false) {
		if (! inCenter ) return null;
		if ( inHidden ) {
			gDiv = inDiv;
			gDiv.style.height = 'auto';
			gDiv.style.marginBottom = '10px';
			gMainMap = null;
			return gDiv;
		}
		myOptions = {
                'minZoom': config.minZoom,
                'maxZoom': config.maxZoom,
				'doubleClickZoom' : false,
				'scrollWheelZoom' : false
		};
		myOptions = Object.assign(myOptions, {
				'center': new L.latLng ( inCenter.latitude, inCenter.longitude ),
				'zoom': inCenter.zoom});
		var	pixel_width = inDiv.offsetWidth;
		if (pixel_width == 0) {
			pixel_width = inDiv.parentNode.offsetWidth;
		}
		var	pixel_height = inDiv.offsetHeight;
		if (pixel_height == 0) {
			pixel_height = pixel_width;
		}
		if (pixel_height > pixel_width*1.4) {
			inDiv.style.height = (pixel_width*1.6)+'px';
		}
        gMainMap = new L.Map ( inDiv, myOptions );
        gTileLayer = L.tileLayer(config.tileUrl,config.tileOptions).addTo(gMainMap);
		gMainMap.zoomControl.setPosition('bottomright');
		gMainMap.on('moveend',function() {
			gTileLayer.redraw();
		});
        return gMainMap;
    }
    function addListener(ev,f,once) {
		if (!gMainMap) return;
		if (ev=='idle') {
			ev = 'moveend';
		}
		if (ev=='dragstart') {
			ev = 'movestart';
		}
		if (ev=='dragend') {
			ev = 'moveend';
		}
        if (once) {
			gMainMap.once(ev, f);
		} else {
			gMainMap.on(ev, f);
		}
		return {'event': ev, 'f': f};
    }
	function removeListener(o) {
		if (!gMainMap) return;
		gMainMap.off(o.event, o.f);
	}
    function setViewToPosition(position, filterMeetings, extra=null) {
		if (!gMainMap) return;
        var latlng = L.latLng(position.latitude, position.longitude);
		gMainMap.flyTo(latlng);
        gMainMap.once('moveend', function(ev) {
			newZoom = getZoomAdjust(false, filterMeetings);
			if (gMainMap.getZoom() != newZoom) {
				gMainMap.setZoom(newZoom);
				gMainMap.once('zoomend',function() {
					gMainMap.invalidateSize();
					if (extra) {
						gMainMap.once('load moveend', extra);
					}
				});
			} else {
				if (extra) {
					extra();
				}
			}
		});
	}
	function clearAllMarkers ( )
	{
		if (!gMainMap) return;
		gAllMarkers && gAllMarkers.forEach((m) => {m.marker.closePopup(); gMainMap.removeLayer(m.marker)});
		gAllMarkers = [];
	};
	function getZoom() {
		if (!gMainMap) return null;
		return gMainMap.getZoom();
	}
	function getZoomAdjust(only_out,filterMeetings) {
		if (!gMainMap) return 12;
		var ret = gMainMap.getZoom();
		if (config.map_search && config.filter_visible) return ret;
		var center = gMainMap.getCenter();
		var bounds = gMainMap.getBounds();
		var zoomedOut = false;
		while(filterMeetings(bounds, center).length==0 && ret>6) {
			zoomedOut = true;
			// not exact, because earth is curved
			ret -= 1;
			var ne = L.latLng(
				(2*bounds.getNorthEast().lat)-center.lat,
			    (2*bounds.getNorthEast().lng)-center.lng);
			var sw = L.latLng(
				(2*bounds.getSouthWest().lat)-center.lat,
				(2*bounds.getSouthWest().lng)-center.lng);
			bounds = L.latLngBounds(sw,ne);

		}
		if (!only_out && !zoomedOut && ret<12) {
			var knt = filterMeetings(bounds).length;
			while(ret<12 && knt>0) {
				// no exact, because earth is curved
				ret += 1;
				var ne = L.latLng(
					0.5*(bounds.getNorthEast().lat+center.lat),
					0.5*(bounds.getNorthEast().lng+center.lng));
				var sw = L.latLng(
					 0.5*(bounds.getSouthWest().lat+center.lat),
					0.5*(bounds.getSouthWest().lng+center.lng));
				bounds = L.latLngBounds(sw,ne);
				knt = filterMeetings(bounds).length;
			}
			if (knt == 0) {
				ret -= 1;
			}
		}
		return ret;
	}
    function setZoom(filterMeetings, force=0) {
		if (!gMainMap) return;
		(force > 0) ? gMainMap.setZoom(force) : gMainMap.setZoom(getZoomAdjust(false,filterMeetings));
	}
	function zoomOut(filterMeetings) {
		if (!gMainMap) return;
        gMainMap.setZoom(getZoomAdjust(true,filterMeetings));
	}
	function fromLatLngToPoint(lat, lng) {
		if (!gMainMap) return null;
		return gMainMap.latLngToLayerPoint(L.latLng(lat,lng));
    }
	function markSearchPoint(inCoords) {
		if (!gMainMap) return;
		if (gSearchPointMarker) gSearchPointMarker.remove();
		gSearchPointMarker = L.marker(inCoords, {icon: g_icon_image_searchpoimt});
		gSearchPointMarker.addTo(gMainMap);
	}
	function createMarker (	inCoords,		///< The long/lat for the marker.
        multi,	///< Flag if marker has multiple meetings
        in_title,        ///< The tooltip
)
{
	if (!gMainMap) return;
    var in_main_icon = (multi ? g_icon_image_multi : g_icon_image_single);

    var marker = L.marker(inCoords, {icon: in_main_icon, title: in_title})
	marker.isMulti = multi;
	if (gClusterLayer) gClusterLayer.addLayer(marker);
	else marker.addTo(gMainMap);

	return marker;
}
function bindPopup(marker, in_html, in_ids, openedMarker) {
	let highlightRow = function(target) {
		const id = target.id.split('-')[1];
		gOpenMarker = id;
		jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
		jQuery("#meeting-data-row-" + id + " > td").addClass("rowHighlight");
		if (typeof crouton != 'undefined') crouton.dayTabFromId(id);
	}
	marker.bindPopup(in_html);
	marker.on('popupopen', function(e) {
		if (openedMarker && marker.getPopup().getContent().includes("panel-"+openedMarker)) {
			// I want to just do this:
			//jQuery("#panel-"+openedMarker).prop("checked", true);
			// But for some reason, leaflet makes a copy of the popup, so the ID is not unique....
			jQuery("input[type=radio][name=panel]").filter(function() {
				return jQuery(this).attr('id')=="panel-"+openedMarker})
				.each(function(index,value) {
				jQuery(this).prop("checked", true);
			});
		}
		marker.setIcon(g_icon_image_selected);
		gMainMap.on('zoomstart',function(){
			marker.closePopup();
		});
		jQuery("input[type=radio][name=panel]:checked").each(function(index, target) {
			highlightRow(target);
    	});
		jQuery('input[type=radio][name=panel]').change(function() {
			highlightRow(this);
        });
	});
    marker.on('popupclose', function(e) {
		gOpenMarker = false;
        marker.setIcon(marker.isMulti ? g_icon_image_multi : g_icon_image_single);
		jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
    });
	if (openedMarker &&  in_ids.includes(parseInt(openedMarker))) {
		marker.openPopup();
		marker.once('add', function() {
			if (!marker.isPopupOpen()) marker.openPopup();
		});
	}
	gAllMarkers.push( {ids: in_ids, marker: marker} );
}
function addMarkerCallback(marker, cb, in_ids) {
	if (cb) marker.on('click', function() {
		cb(in_ids);
	});
	gAllMarkers.push( {ids: in_ids, marker: marker} );
}
function getOpenMarker() {
	return gOpenMarker;
}
function openMarker(id) {
	if (!gMainMap) return;
	marker = gAllMarkers.find((m) => m.ids.includes(id));
	if (marker) {
		marker.marker.openPopup();
		jQuery("#panel-"+id).prop('checked', true);
		if (typeof crouton != 'undefined') crouton.dayTabFromId(id);
	}
	jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
	jQuery("#meeting-data-row-" + id + " > td").addClass("rowHighlight");
}
function addControl(div,pos,cb) {
	if (!gMainMap) {
        gDiv.appendChild(div);
        return;
    }
		var ControlClass =  L.Control.extend({
	  		onAdd: function (map) {
				return div;
			},
			onRemove: function(map) {
				// Nothing to do here
			}
		});
		var controlConstructor = function(opts) {
			return new ControlClass(opts);
		}
		if (cb) {
			const observer = new MutationObserver(function (records) {
				records.forEach(record => {
					record.addedNodes.forEach(n => {
						if (n === div) {
							observer.disconnect();
							cb();
						}
					});
				})
			});
			observer.observe(document, {childList: true, subtree: true});
		}
		controlConstructor({ position: pos }).addTo(gMainMap);
    }
    	// Low level GeoCoding
	function getJSON(url, params, callback) {
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() {
		if (xmlHttp.readyState !== 4) {
		  return;
		}
		var message;
		if (xmlHttp.status !== 200 && xmlHttp.status !== 304) {
		  message = '';
		} else if (typeof xmlHttp.response === 'string') {
		  // IE doesn't parse JSON responses even with responseType: 'json'.
		  try {
			message = JSON.parse(xmlHttp.response);
		  } catch (e) {
			// Not a JSON response
			message = xmlHttp.response;
		  }
		} else {
		  message = xmlHttp.response;
		}
		callback(message);
	  };
	  xmlHttp.open('GET', url + getParamString(params), true);
	  xmlHttp.responseType = 'json';
	  xmlHttp.setRequestHeader('Accept', 'application/json');
	  xmlHttp.setRequestHeader('Accept', '*/*');
	  xmlHttp.send(null);
	};
	function getParamString(obj, existingUrl, uppercase) {
		var params = [];
		for (var i in obj) {
		  var key = encodeURIComponent(uppercase ? i.toUpperCase() : i);
		  var value = obj[i];
		  if (!L.Util.isArray(value)) {
			params.push(key + '=' + encodeURIComponent(value));
		  } else {
			for (var j = 0; j < value.length; j++) {
			  params.push(key + '=' + encodeURIComponent(value[j]));
			}
		  }
		}
		return (!existingUrl || existingUrl.indexOf('?') === -1 ? '?' : '&') + params.join('&');
	}
	function geocode(query, params, cb, filterMeetings) {
		var serviceUrl = config.nominatimUrl;
		if (!serviceUrl) serviceUrl = 'https://nominatim.openstreetmap.org/';
		getJSON(
		  serviceUrl + 'search',
		  L.extend(
			{
			  q: query,
			  limit: 5,
			  format: 'json',
			  addressdetails: 1
			},
			params
		  ),
		  L.bind(function(data) {
			var results = [];
			if (data && data.length) {
				for (var i = data.length - 1; i >= 0; i--) {
					var bbox = data[i].boundingbox;
					for (var j = 0; j < 4; j++) bbox[j] = parseFloat(bbox[j]);
					results[i] = {
						icon: data[i].icon,
						name: data[i].display_name,
						bbox: L.latLngBounds([bbox[0], bbox[2]], [bbox[1], bbox[3]]),
						center: L.latLng(data[i].lat, data[i].lon),
						properties: data[i]
					};
				}
				if (filterMeetings) cb(results,filterMeetings);
				else cb(results);
			} else {
				alert ( crouton.localization.getWord("address_lookup_fail") );
			}
		}, this)
		);
    };
 	function geoCallback ( in_geocode_response,	filterMeetings) {
        if ( in_geocode_response && in_geocode_response[0] && in_geocode_response[0].bbox ) {
	        gMainMap.flyToBounds ( in_geocode_response[0].bbox );
            gMainMap.on('moveend', function(ev) {
				gMainMap.off('moveend');
				gMainMap.setZoom(getZoomAdjust(true, filterMeetings));
				gMainMap.once('moveend',function() {
					gTileLayer.redraw();
				});
			});
        } else {
            alert ( crouton.localization.getWord("address_lookup_fail") );
        };
	};
	function getGeocodeCenter ( in_geocode_response ) {
        if ( in_geocode_response && in_geocode_response[0] ) {
	        return {lat: in_geocode_response[0].center.lat, lng: in_geocode_response[0].center.lng};
        } else {
            alert ( crouton.localization.getWord("address_lookup_fail") );
        };
	};
    function callGeocoder(in_loc, filterMeetings, callback=geoCallback) {
		geoCodeParams = {};
		if (config.region && config.region.trim() !== '') {
			geoCodeParams.countrycodes = config.region;
		}
		if (config.bounds
			&&  isNumber(config.bounds.north)
			&&  isNumber(config.bounds.east)
			&&  isNumber(config.bounds.south)
			&&  isNumber(config.bounds.west)) {
				geoCodeParams.viewbox = config.bounds.west+","+config.bounds.south+","+
					                    config.bounds.east+","+config.bounds.north;
		}
        geocode(in_loc, geoCodeParams, callback, filterMeetings);
    }
	function isNumber(x) {
		if (typeof x === 'number') return true;
		if (typeof x === 'string' && x.trim() !== '' && !isNaN(x)) return true;
		return false;
	}
	function contains(bounds, lat, lng) {
		if (!gMainMap) return true;
		return bounds.contains(L.latLng ( lat, lng ));
	}
	function getBounds() {
		if (!gMainMap) return null;
		return gMainMap.getBounds();
	}
	function invalidateSize() {
		if (!gMainMap) return;
		gMainMap.invalidateSize();
	}
	function fitBounds(locations) {
		if (!gMainMap) return;
		const bounds = locations.reduce(function(b,lat_lng) {b.extend(lat_lng); return b;}, L.latLngBounds());
		gMainMap.fitBounds(bounds);
	}
	function createClusterLayer() {
		if (!gMainMap) return;
		gClusterLayer = L.markerClusterGroup();
	}
	function addClusterLayer() {
		if (!gMainMap) return;
		gClusterLayer && gMainMap.addLayer(gClusterLayer);
	}
	function removeClusterLayer() {
		if (!gMainMap) return;
		gClusterLayer && gMainMap.removeLayer(gClusterLayer);
		gClusterLayer = null;
	}
	function clickSearch(ev, cb) {
		L.DomUtil.addClass(gMainMap._container,'crosshair-cursor-enabled');
		gMainMap.once('click',function(e) {
			gMainMap.once('click',function(e) {
				L.DomUtil.removeClass(gMainMap._container,'crosshair-cursor-enabled');
				cb(e.latlng.lat,e.latlng.lng);
			})
		});
	}
	function getCorners(lat_lngs = false) {
        var bounds = lat_lngs
		? lat_lngs.reduce(function(b,lat_lng) {b.extend(lat_lng); return b;}, L.latLngBounds())
		: gMainMap.getBounds();

        return {
            "ne" : {"lat": bounds.getNorthEast().lat, "lng": bounds.getNorthEast().lng},
            "sw" : {"lat": bounds.getSouthWest().lat, "lng": bounds.getSouthWest().lng}
        }
    }
	function getCenter() {
		return {"lat": gMainMap.getCenter().lat, "lng": gMainMap.getCenter().lng};
	}
	function modalOn() {
		if (gMainMap) gMainMap.dragging.disable()
	}
	function modalOff() {
		if (gMainMap) gMainMap.dragging.enable()
	}
	function afterInit(f) {
		f();
	}
	function returnTrue() {return true;}
	function isMapDefined() {
		return (gMainMap != null);
	}
    this.createMap = createMap;
    this.addListener = addListener;
	this.removeListener = removeListener;
    this.addControl = addControl;
    this.setViewToPosition = setViewToPosition;
    this.clearAllMarkers = clearAllMarkers;
    this.fromLatLngToPoint = fromLatLngToPoint;
    this.callGeocoder = callGeocoder;
	this.setZoom = setZoom;
	this.getZoom = getZoom;
	this.createMarker = createMarker;
	this.bindPopup = bindPopup;
	this.addMarkerCallback = addMarkerCallback;
	this.contains = contains;
	this.getBounds = getBounds;
	this.invalidateSize = invalidateSize;
	this.zoomOut = zoomOut;
	this.fitBounds = fitBounds;
	this.openMarker = openMarker;
	this.isApiLoaded = returnTrue;
	this.createClusterLayer = createClusterLayer;
	this.addClusterLayer = addClusterLayer;
	this.removeClusterLayer = removeClusterLayer;
	this.clickSearch = clickSearch;
	this.getGeocodeCenter = getGeocodeCenter;
	this.modalOn = modalOn;
	this.modalOff = modalOff;
	this.afterInit = afterInit;
	this.isMapDefined = isMapDefined;
	this.getCorners = getCorners;
	this.getCenter = getCenter;
	this.markSearchPoint = markSearchPoint;
	this.getOpenMarker = getOpenMarker;
}
MapDelegate.prototype.createMap = null;
MapDelegate.prototype.addListener = null;
MapDelegate.prototype.removeListener = null;
MapDelegate.prototype.addControl = null;
MapDelegate.prototype.setViewToPosition = null;
MapDelegate.prototype.clearAllMarkers = null;
MapDelegate.prototype.fromLatLngToPoint = null;
MapDelegate.prototype.callGeocoder = null;
MapDelegate.prototype.setZoom = null;
MapDelegate.prototype.getZoom = null;
MapDelegate.prototype.createMarker = null;
MapDelegate.prototype.bindPopup = null;
MapDelegate.prototype.addMarkerCallback = null;
MapDelegate.prototype.contains = null;
MapDelegate.prototype.getBounds = null;
MapDelegate.prototype.invalidateSize = null;
MapDelegate.prototype.zoomOut = null;
MapDelegate.prototype.fitBounds = null;
MapDelegate.prototype.openMarker = null;
MapDelegate.prototype.isApiLoaded = null;
MapDelegate.prototype.createClusterLayer = null;
MapDelegate.prototype.addClusterLayer = null;
MapDelegate.prototype.removeClusterLayer = null;
MapDelegate.prototype.clickSearch = null;
MapDelegate.prototype.getGeocodeCenter = null;
MapDelegate.prototype.modalOn = null;
MapDelegate.prototype.modalOff = null;
MapDelegate.prototype.afterInit = null;
MapDelegate.prototype.isMapDefined = null;
MapDelegate.prototype.getCorners = null;
MapDelegate.prototype.getCenter = null;
MapDelegate.prototype.markSearchPoint = null;
MapDelegate.prototype.getOpenMarker = null;