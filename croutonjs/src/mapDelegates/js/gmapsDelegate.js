function MapDelegate(in_config) {
    const config = in_config;
    var g_icon_image_single = null;
    var g_icon_image_multi = null;
    var g_icon_image_selected = null;
    var g_icon_shadow = null;
    var g_icon_shape = null;
    var gMainMap;
    var gOms = null;
    var gMarkerClusterer = null;
    var gInfoWindow;
    var gIsLoaded = false;
    var gIsClustering = false;
    var	gAllMarkers = [];				///< Holds all the markers.
    var gSearchPointMarker = false;
    var gOpenMarker = false;
    function isApiLoaded() {
        return gIsLoaded;
    }
    function loadApi(f, args) {
        var tag = document.createElement('script');
        gIsLoaded = true;
        if (typeof config['api_key'] === 'undefined') config['api_key'] = "";
        tag.src = "https://maps.googleapis.com/maps/api/js?key=" + config['api_key'] + "&callback=croutonMap.apiLoadedCallback";
        tag.defer = true;
        tag.async = true;
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    };
    function createMap(inDiv, inCenter, inHidden = false) {
        if ( inHidden ) {
			gDiv = inDiv;
			gDiv.style.height = 'auto';
			gDiv.style.marginBottom = '10px';
			gMainMap = null;
			return gDiv;
		}
    g_icon_image_single = new google.maps.MarkerImage ( config.BMLTPlugin_images+"/NAMarker.png", new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
    g_icon_image_multi = new google.maps.MarkerImage ( config.BMLTPlugin_images+"/NAMarkerG.png", new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
    g_icon_image_selected = new google.maps.MarkerImage ( config.BMLTPlugin_images+"/NAMarkerSel.png", new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
    g_icon_image_searchpoint = new google.maps.MarkerImage ( config.BMLTPlugin_images+"/SearchPoint.png", new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
    g_icon_shadow = new google.maps.MarkerImage( config.BMLTPlugin_images+"/NAMarkerS.png", new google.maps.Size(43, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
    g_icon_shape = { coord: [16,0,18,1,19,2,20,3,21,4,21,5,22,6,22,7,22,8,22,9,22,10,22,11,22,12,22,13,22,14,22,15,22,16,21,17,21,18,22,19,20,20,19,21,20,22,18,23,17,24,18,25,17,26,15,27,14,28,15,29,12,30,12,31,10,31,10,30,9,29,8,28,8,27,7,26,6,25,5,24,5,23,4,22,3,21,3,20,2,19,1,18,1,17,1,16,0,15,0,14,0,13,0,12,0,11,0,10,0,9,0,8,0,7,1,6,1,5,2,4,2,3,3,2,5,1,6,0,16,0], type: 'poly' };

        var myOptions = {
            'mapTypeId': google.maps.MapTypeId.ROADMAP,
            'zoomControl': true,
            'minZoom': config.minZoom,
            'maxZoom': config.maxZoom,
            'mapTypeControl': false,
            'streetViewControl': true,
            'disableDoubleClickZoom' : true,
            'draggableCursor': "pointer",
            'scaleControl' : true,
            'fullscreenControl': config.map_search ? true : false,
        };
        if (inCenter) {
            myOptions = Object.assign(myOptions, {
                'center': new google.maps.LatLng ( inCenter.latitude, inCenter.longitude ),
                'zoom': parseInt(inCenter.zoom)
            });
        }
        var	pixel_width = inDiv.offsetWidth;
        var	pixel_height = inDiv.offsetHeight;

        if ( (pixel_width < 640) || (pixel_height < 640) ) {
            myOptions.scrollwheel = true;
            myOptions.zoomControlOptions = { 'style': google.maps.ZoomControlStyle.SMALL };
        } else {
            myOptions.zoomControlOptions = { 'style': google.maps.ZoomControlStyle.LARGE };
        };
        gInfoWindow = new google.maps.InfoWindow();
        gMainMap = new google.maps.Map ( inDiv, myOptions );

        return gMainMap;
    }
    function addListener(ev,f,once) {
        if (!gMainMap) return;
        var e = ev;
        switch (ev) {
            case "zoomend":
                e = 'zoom_changed';
                break;
            default:
                ;
        }
        if (once) {
            return google.maps.event.addListenerOnce( gMainMap, e, f);
        } else {
            return google.maps.event.addListener( gMainMap, e, f);
        }
    }
    function removeListener(f) {
        if (!gMainMap) return;
        f.remove();
    }
    function fitBounds(locations) {
        if (!gMainMap) return;
        google.maps.event.addListenerOnce(gMainMap, "bounds_changed", function () {
            gMainMap.setZoom(parseInt(Math.min(gMainMap.getZoom(), config.maxZoom)));
        });
        let start = new google.maps.LatLngBounds();  // avoid occasional timing problem
        if (!start) return;
        const bounds = locations.reduce(
            function (bounds, m) {
                if (bounds === null) return start;
                return bounds.extend(new google.maps.LatLng(m[0], m[1]));
            }, start);
        gMainMap.fitBounds(bounds);
    }
    function setViewToPosition(position, filterMeetings, f) {
        if (!gMainMap) return;
        var latlng = new google.maps.LatLng(position.latitude, position.longitude);
        gMainMap.setCenter(latlng);
        gMainMap.setZoom(getZoomAdjust(false, filterMeetings));
        f && f();
    }
    function getOpenMarker() {
	    return gOpenMarker;
    }
    function clearAllMarkers ()
    {
        if (!gMainMap) return;
        gAllMarkers && gAllMarkers.forEach(function(m) {
            m && m.marker.info_win && gAllMarkers[c].marker.info_win_.close();
            m.marker.setMap( null );
        });
        gAllMarkers = [];
        gOpenMarker = false;
    };
    function getZoomAdjust(only_out,filterMeetings) {
        if (!gMainMap) return 12;
        var ret = gMainMap.getZoom();
        if (config.map_search && config.filter_visible) return ret;
        var center = gMainMap.getCenter();
        var bounds = gMainMap.getBounds();
        var zoomedOut = false;
        while(filterMeetings(bounds).length==0 && ret>6) {
            zoomedOut = true;
            // no exact, because earth is curved
            ret -= 1;
            var ne = new google.maps.LatLng({
                lat: (2*bounds.getNorthEast().lat())-center.lat(),
                lng: (2*bounds.getNorthEast().lng())-center.lng()});
            var sw = new google.maps.LatLng({
                lat: (2*bounds.getSouthWest().lat())-center.lat(),
                lng: (2*bounds.getSouthWest().lng())-center.lng()});
            bounds = new google.maps.LatLngBounds(sw,ne);
        }
        if (!only_out && !zoomedOut && ret<12) {
            var knt = filterMeetings(bounds).length;
            while(ret<12 && knt>0) {
                // no exact, because earth is curved
                ret += 1;
                var ne = new google.maps.LatLng({
                    lat: 0.5*(bounds.getNorthEast().lat()+center.lat()),
                    lng: 0.5*(bounds.getNorthEast().lng()+center.lng())});
                var sw = new google.maps.LatLng({
                    lat: 0.5*(bounds.getSouthWest().lat()+center.lat()),
                    lng: 0.5*(bounds.getSouthWest().lng()+center.lng())});
                bounds = new google.maps.LatLngBounds(sw,ne);
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
        (force > 0) ? gMainMap.setZoom(force) :
        gMainMap.setZoom(getZoomAdjust(false,filterMeetings));
    }
    function getZoom() {
        if (!gMainMap) return 12;
        return gMainMap.getZoom();
    }
    function zoomOut(filterMeetings) {
        if (!gMainMap) return;
        gMainMap.setZoom(getZoomAdjust(true,filterMeetings));
    }
    function contains(bounds, lat, lng) {
        if (!gMainMap) return true;
       return bounds.contains(new google.maps.LatLng ( lat, lng));
    }
    function getBounds() {
        if (!gMainMap) return null;
        return gMainMap.getBounds();
    }
    function fromLatLngToPoint(lat, lng) {
        if (!gMainMap) return null;
        var latLng = new google.maps.LatLng ( lat, lng);
        var scale = 1 << gMainMap.getZoom();
        var worldPoint = gMainMap.getProjection().fromLatLngToPoint(latLng);
        return new google.maps.Point(worldPoint.x * scale, worldPoint.y * scale);
    };
    function setZoom(filterMeetings) {
        if (!gMainMap) return;
        gMainMap.setZoom(getZoomAdjust(false,filterMeetings));
    }
    function createClusterLayer() {
        gIsClustering = true;
    }
    function removeClusterLayer() {
        if (!gMainMap) return;
        gIsClustering =false;
        gMarkerClusterer && gMarkerClusterer.setMap(null);
        gMarkerClusterer = null;
        if (gOms) {
            gOms.removeAllMarkers();
            gOms.clearListeners('click');
            gOms = null;
        }
    }
   function addClusterLayer() {
        if (!gMainMap) return;
        let markers = gAllMarkers.map((m)=>m.marker);
        if (gIsClustering) {
            gMarkerClusterer = new markerClusterer.MarkerClusterer( { 'map': gMainMap, 'markers': markers, 'imagePath': 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'} );
            gOms = new OverlappingMarkerSpiderfier(gMainMap, {
                markersWontMove: true,
                markersWontHide: true,
            });
            gOms.addListener('format', function (marker, status) {
                var icon;
                if (status === OverlappingMarkerSpiderfier.markerStatus.SPIDERFIED
                    || status === OverlappingMarkerSpiderfier.markerStatus.SPIDERFIABLE
                    || status === OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIED) {
                    icon = g_icon_image_multi;
                } else if (status === OverlappingMarkerSpiderfier.markerStatus.UNSPIDERFIABLE) {
                    icon = g_icon_image_single;
                } else {
                    icon = null;
                }
                marker.setIcon(icon);
            });
            google.maps.event.addListener(gMainMap, 'zoom_changed', function() {
                if (gMainMap.getProjection()=='undefined') return;
                google.maps.event.addListenerOnce(gMainMap, 'idle', function() {
                    if (gMainMap.getProjection()=='undefined') return;
                    if (gOms == null) return;
                    var spidered = gOms.markersNearAnyOtherMarker();
                    for (var i = 0; i < spidered.length; i ++) {
                        spidered[i].icon = g_icon_image_multi;
                    }
                });
            });

            // This is necessary to make the Spiderfy work
            gOms.addListener('click', function (marker) {
                marker.zIndex = 999;
                gInfoWindow.setContent(marker.desc);
                gInfoWindow.open(gMainMap, marker);
            });
            markers.forEach((marker)=>gOms.addMarker(marker));

        } else markers.forEach((m)=>m.setMap(gMainMap));
   }
function markSearchPoint(inCoords) {
        if (!gMainMap) return;
        if (gSearchPointMarker) gSearchPointMarker.setMap(null);
        gSearchPointMarker = new google.maps.Marker (
        { 'position':		new google.maps.LatLng(...inCoords)});
        gSearchPointMarker.setIcon(g_icon_image_searchpoint);
        gSearchPointMarker.setMap(gMainMap);
}
function createMarker (	inCoords,		///< The long/lat for the marker.
        multi,
        inHtml,		///< The info window HTML
        inTitle,        ///< The tooltip
        inIds,
        openMarker
)
{
    if (!gMainMap) return;
    var in_main_icon = (multi ? g_icon_image_multi : g_icon_image_single)
    var marker = null;

    var	is_clickable = (inHtml ? true : false);

    var marker = new google.maps.Marker (
        { 'position':		new google.maps.LatLng(...inCoords),
            'shadow':		g_icon_shadow,
            'icon':			in_main_icon,
            'shape':		g_icon_shape,
            'clickable':	is_clickable,
            'cursor':		'default',
            'title':        inTitle,
            'draggable':    false
    } );
    marker.desc = inHtml;
    marker.zIndex = 999;
    marker.old_image = marker.getIcon();

    google.maps.event.addListener ( marker, "click", function () {
        gAllMarkers.forEach((m) => m.marker.setIcon(m.marker.old_image));
        if(marker.old_image){marker.setIcon(g_icon_image_selected)};
        openInfoWindow(marker);
    });
    if (openMarker &&  inIds.includes(parseInt(openMarker))) {
        openInfoWindow(marker);
    }
    gInfoWindow.addListener('closeclick', function () {
        gOpenMarker = false;
        gAllMarkers.forEach((m) => m.marker.setIcon(m.marker.old_image));
        jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
    });
    gAllMarkers[gAllMarkers.length] = {ids: inIds, marker: marker};
};
function highlightRow(target) {
    const id = target.id.split('-')[1];
    gOpenMarker = id;
    jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
    jQuery("#meeting-data-row-" + id + " > td").addClass("rowHighlight");
    if (typeof crouton == 'undefined') crouton.dayTabFromId(id);
}
function openInfoWindow(marker) {
    marker.setZIndex(google.maps.Marker.MAX_ZINDEX+1);
    gInfoWindow.setContent(marker.desc);
    gInfoWindow.open(gMainMap, marker);
    gInfoWindow.addListener('visible', function() {
        jQuery("input[type=radio][name=panel]:checked").each(function(index, target) {
            highlightRow(target);
        });
        jQuery('input[type=radio][name=panel]').change(function() {
            highlightRow(this);
        });
    });
}
function addControl(div,pos,cb) {
    if (!gMainMap) {
        gDiv.appendChild(div);
        return;
    }
    var p = pos;
    switch(pos) {
        case 'topright':
            p = google.maps.ControlPosition.TOP_RIGHT;
            div.style.margin = "10px 10px 0 0";
            break;
        case 'topleft':
            p = google.maps.ControlPosition.TOP_LEFT;
            div.style.margin = "10px 0 0 10px";
            break;
    }
    div.index = 1;
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
    gMainMap.controls[p].push(div);
}
    /************************************************************************************//**
 *	\brief This catches the AJAX response, and fills in the response form.				*
 ****************************************************************************************/
function fitAndZoom(ev) {
    if (!gMainMap) return;
    gMainMap.fitBounds(this.response[0].geometry.viewport);
    gMainMap.setZoom(getZoomAdjust(true,this.filterMeetings));
}
function openMarker(id) {
    if (!gMainMap) return;
    const marker = gAllMarkers.find((m) => m.ids.includes(id));
    if (marker) {
        jQuery("#panel-"+id).prop('checked', true);
        openInfoWindow(marker.marker)
    }
}
function getGeocodeCenter(in_geocode_response) {
    if ( in_geocode_response && in_geocode_response[0] && in_geocode_response[0].geometry && in_geocode_response[0].geometry.location )
        return {lat: in_geocode_response[0].geometry.location.lat(), lng: in_geocode_response[0].geometry.location.lng()};
    else alert ( crouton.localization.getWord("address_lookup_fail") );
}
function geoCallback( in_geocode_response ) {
    var callback = fitAndZoom.bind({filterMeetings:this.filterMeetings,
            response: in_geocode_response});
    if ( in_geocode_response && in_geocode_response[0] && in_geocode_response[0].geometry && in_geocode_response[0].geometry.location ) {
            gMainMap.panTo ( in_geocode_response[0].geometry.location );
            google.maps.event.addListenerOnce( gMainMap, 'idle', callback);
    } else {
        alert ( crouton.localization.getWord("address_lookup_fail") );
    };
};
    function callGeocoder(in_loc, filterMeetings, callback=geoCallback) {
        var	geocoder = new google.maps.Geocoder;

        if ( geocoder )
        {
            var geoCodeParams = { 'address': in_loc };
            if (config.region && config.region.trim() !== '') {
                geoCodeParams.region = config.region;
            }
            if (config.bounds
            &&  config.bounds.north && config.bounds.north.trim()!== ''
            &&  config.bounds.east && config.bounds.east.trim()!== ''
            &&  config.bounds.south && config.bounds.south.trim()!== ''
            &&  config.bounds.west && config.bounds.west.trim()!== '') {
                geoCodeParams.bounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(config.bounds.south, config.bounds.west),
                    new google.maps.LatLng(config.bounds.north, config.bounds.east));
            }
            if (filterMeetings)
                callback = callback.bind({filterMeetings: filterMeetings});
            geocoder.geocode ( geoCodeParams, callback );
        }
        else	// None of that stuff is defined if we couldn't create the geocoder.
        {
            alert ( crouton.localization.getWord("address_lookup_fail") );
        };
    }
    function invalidateSize() {
    }
    function clickSearch(ev, cb) {
        if (!gMainMap) return;
        gMainMap.setOptions({
            draggableCursor: 'crosshair',
            zoomControl: false,
            gestureHandling: 'none'
        });
        google.maps.event.addListenerOnce( gMainMap, 'click', function(e) {
            gMainMap.setOptions({
                draggableCursor: 'default',
                zoomControl: true,
                gestureHandling: 'auto'
            });
            cb(e.latLng.lat(), e.latLng.lng());
        })
    };
    function getCorners(lat_lngs = false) {
        var bounds = lat_lngs
		? lat_lngs.reduce(function(b,m) {return b.extend(new google.maps.LatLng(m[0], m[1]));}, new google.maps.LatLngBounds())
		: gMainMap.getBounds();

        return {
            "ne" : {"lat": bounds.getNorthEast().lat(), "lng": bounds.getNorthEast().lng()},
            "sw" : {"lat": bounds.getSouthWest().lat(), "lng": bounds.getSouthWest().lng()}
        }
    }
    function getCenter() {
        var center = gMainMap.getCenter();
        return { "lat": center.lat(), "lng": center.lng()}
    }
    function afterInit(f) {
        if (!gMainMap) return;
        if (typeof gMainMap.getBounds()  !== 'undefined') f();
        else addListener('idle', f, true);
    }
    function modalOn() {}
    function modalOff() {}
	function isMapDefined() {
		return gMainMap != null;
	}
    this.createMap = createMap;
    this.addListener = addListener;
    this.addControl = addControl;
    this.setViewToPosition = setViewToPosition;
    this.clearAllMarkers = clearAllMarkers;
    this.fromLatLngToPoint = fromLatLngToPoint;
    this.callGeocoder = callGeocoder;
    this.setZoom = setZoom;
    this.getZoom = getZoom;
    this.createMarker = createMarker;
    this.contains = contains;
    this.getBounds = getBounds;
    this.invalidateSize = invalidateSize;
    this.zoomOut = zoomOut;
    this.fitBounds = fitBounds;
    this.openMarker = openMarker;
    this.isApiLoaded = isApiLoaded;
    this.loadApi = loadApi;
    this.createClusterLayer = createClusterLayer;
    this.addClusterLayer = addClusterLayer;
    this.removeClusterLayer = removeClusterLayer;
    this.clickSearch = clickSearch;
    this.getGeocodeCenter = getGeocodeCenter;
    this.modalOn = modalOn;
    this.modalOff = modalOff;
    this.removeListener = removeListener;
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
MapDelegate.prototype.contains = null;
MapDelegate.prototype.getBounds = null;
MapDelegate.prototype.invalidateSize = null;
MapDelegate.prototype.zoomOut = null;
MapDelegate.prototype.fitBounds = null;
MapDelegate.prototype.isApiLoaded = null;
MapDelegate.prototype.loadApi = null;
MapDelegate.prototype.openMarker = null;
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
MapDelegate.prototype.getCenter= null;
MapDelegate.prototype.markSearchPoint = null;
MapDelegate.prototype.getOpenMarker = null;