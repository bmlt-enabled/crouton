    function MapDelegate(in_config) {
        const config = in_config;
        var g_icon_image_single = null;
	    var g_icon_image_multi = null;
	    var g_icon_image_selected = null;
	    var g_icon_shadow = null;
	    var g_icon_shape = null;
        var gMainMap;
        var gInfoWindow;
        var gIsLoaded = false;
        var	gAllMarkers = [];				///< Holds all the markers.
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
        function createMap(inDiv, inCenter) {
        g_icon_image_single = new google.maps.MarkerImage ( config.BMLTPlugin_images+"/NAMarker.png", new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
	    g_icon_image_multi = new google.maps.MarkerImage ( config.BMLTPlugin_images+"/NAMarkerG.png", new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
	    g_icon_image_selected = new google.maps.MarkerImage ( config.BMLTPlugin_images+"/NAMarkerSel.png", new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
	    g_icon_shadow = new google.maps.MarkerImage( config.BMLTPlugin_images+"/NAMarkerS.png", new google.maps.Size(43, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
	    g_icon_shape = { coord: [16,0,18,1,19,2,20,3,21,4,21,5,22,6,22,7,22,8,22,9,22,10,22,11,22,12,22,13,22,14,22,15,22,16,21,17,21,18,22,19,20,20,19,21,20,22,18,23,17,24,18,25,17,26,15,27,14,28,15,29,12,30,12,31,10,31,10,30,9,29,8,28,8,27,7,26,6,25,5,24,5,23,4,22,3,21,3,20,2,19,1,18,1,17,1,16,0,15,0,14,0,13,0,12,0,11,0,10,0,9,0,8,0,7,1,6,1,5,2,4,2,3,3,2,5,1,6,0,16,0], type: 'poly' };

            if (! inCenter ) return null;
            var myOptions = {
                'mapTypeId': google.maps.MapTypeId.ROADMAP,
                'zoomControl': true,
                'minZoom': 6,
                'mapTypeControl': false,
                'streetViewControl': false,
                'disableDoubleClickZoom' : true,
                'draggableCursor': "pointer",
                'scaleControl' : true,
                'fullscreenControl': false,
            };
            myOptions = Object.assign(myOptions, {
                    'center': new google.maps.LatLng ( inCenter.latitude, inCenter.longitude ),
                    'zoom': inCenter.zoom
                });
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
            var e = ev;
            switch (ev) {
                case "zoomend":
                    e = 'zoom_changed';
                    break;
                default:
                    ;
            }
            if (once) {
                google.maps.event.addListenerOnce( gMainMap, e, f);
            } else {
                google.maps.event.addListener( gMainMap, e, f);
            }
        }
        function fitBounds(locations) {
            google.maps.event.addListenerOnce(gMainMap, "bounds_changed", function () {
                this.setZoom(Math.min(this.getZoom(), 17));
            });
            const bounds = locations.reduce(
                function (bounds, m) {
                    return bounds.extend(new google.maps.LatLng(m[0], m[1]));
                }, new google.maps.LatLngBounds());
            gMainMap.fitBounds(bounds);
        }
        function setViewToPosition(position, filterMeetings, f) {
            var latlng = new google.maps.LatLng(position.latitude, position.longitude);
            gMainMap.setCenter(latlng);
            gMainMap.setZoom(getZoomAdjust(false, filterMeetings));
            f && f();
        }
        function clearAllMarkers ()
        {
            gAllMarkers && gAllMarkers.forEach(function(m) {
                m && m.marker.info_win && gAllMarkers[c].marker.info_win_.close();
                m.marker.setMap( null );
            });
            gAllMarkers = [];
        };
        function getZoomAdjust(only_out,filterMeetings) {
            if (!gMainMap) return 12;
            var ret = gMainMap.getZoom();
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
            (force > 0) ? gMainMap.setZoom(force) : 
            gMainMap.setZoom(getZoomAdjust(false,filterMeetings));
        }
        function getZoom() {
            gMainMap.getZoom();
        }
        function zoomOut(filterMeetings) {
            gMainMap.setZoom(getZoomAdjust(true,filterMeetings));
        }
        function contains(bounds, lat, lng) {
           return bounds.contains(new google.maps.LatLng ( lat, lng));
        }
        function getBounds() {
            return gMainMap.getBounds();
        }
        function fromLatLngToPoint(lat, lng) {
            var latLng = new google.maps.LatLng ( lat, lng);
            var scale = 1 << gMainMap.getZoom();
            var worldPoint = gMainMap.getProjection().fromLatLngToPoint(latLng);
            return new google.maps.Point(worldPoint.x * scale, worldPoint.y * scale);
        };
        function setZoom(filterMeetings) {
            gMainMap.setZoom(getZoomAdjust(false,filterMeetings));
        }
    function createMarker (	inCoords,		///< The long/lat for the marker.
			multi, 
			inHtml,		///< The info window HTML
			inTitle,        ///< The tooltip
            inIds
	)
	{
        var in_main_icon = (multi ? g_icon_image_multi : g_icon_image_single)
		var marker = null;

		var	is_clickable = (inHtml ? true : false);

		var marker = new google.maps.Marker ( 
            { 'position':		new google.maps.LatLng(...inCoords),
				'map':			gMainMap,
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
        let highlightRow = function(target) {
            let id = target.id.split('-')[1];
            jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
            jQuery("#meeting-data-row-" + id + " > td").addClass("rowHighlight");
            if (typeof crouton == 'undefined') crouton.dayTabFromId(id);
        }
		google.maps.event.addListener ( marker, "click", function () {
            gAllMarkers.forEach((m) => m.marker.setIcon(m.marker.old_image));
			if(marker.old_image){marker.setIcon(g_icon_image_selected)};
			marker.setZIndex(google.maps.Marker.MAX_ZINDEX+1);
            gInfoWindow.setContent(marker.desc);
            gInfoWindow.open(gMainMap, marker);
            jQuery("input[type=radio][name=panel]:checked").each(function(index, target) {
                highlightRow(target);
            });
            jQuery('input[type=radio][name=panel]').change(function() {
                highlightRow(this);
            });
        });
        gInfoWindow.addListener('closeclick', function () {
            gAllMarkers.forEach((m) => m.marker.setIcon(m.marker.old_image));
            jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
        });
		gAllMarkers[gAllMarkers.length] = {ids: inIds, marker: marker};
    };
    function addControl(div,pos) {
        var p = pos;
        switch(pos) {
            case 'topright':
                p = google.maps.ControlPosition.TOP_RIGHT;
                break;
            case 'topleft':
                p = google.maps.ControlPosition.TOP_LEFT;
                break;
        }
		div.index = 1;
	    gMainMap.controls[p].push(div);
    }
    	/************************************************************************************//**
	 *	\brief This catches the AJAX response, and fills in the response form.				*
	 ****************************************************************************************/
    function fitAndZoom(ev) {
        gMainMap.fitBounds(this.response[0].geometry.viewport);
        gMainMap.setZoom(getZoomAdjust(true,this.filterMeetings));
    }
    function openMarker(id) {
        marker = gAllMarkers.find((m) => m.ids.includes(id));
        if (marker) {
            google.maps.event.trigger(marker.marker, 'click')
            jQuery("#panel-"+id).prop('checked', true);
            jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
            jQuery("#meeting-data-row-" + id + " > td").addClass("rowHighlight");
        }
    }
    function geoCallback( in_geocode_response ) {
        var callback = fitAndZoom.bind({filterMeetings:this.filterMeetings,
                response: in_geocode_response});
        if ( in_geocode_response && in_geocode_response[0] && in_geocode_response[0].geometry && in_geocode_response[0].geometry.location ) {
                gMainMap.panTo ( in_geocode_response[0].geometry.location );
                google.maps.event.addListenerOnce( gMainMap, 'idle', callback);
        } else {
            alert ( config.address_lookup_fail );
        };
    };
        function callGeocoder(in_loc, filterMeetings) {
            var	geocoder = new google.maps.Geocoder;
    
            if ( geocoder )
            {
                var geoCodeParams = { 'address': in_loc };
                if (config.region.trim() !== '') {
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
                var callback = geoCallback.bind({filterMeetings:filterMeetings});
                var	status = geocoder.geocode ( geoCodeParams, callback );
    
                if ( google.maps.OK != status )
                {
                    if ( google.maps.INVALID_REQUEST != status )
                    {
                        alert ( config.address_lookup_fail );
                    }
                    else
                    {
                        if ( google.maps.ZERO_RESULTS != status )
                        {
                            alert ( config.address_lookup_fail );
                        }
                        else
                        {
                            alert ( config.server_error );
                        };
                    };
                };
            }
            else	// None of that stuff is defined if we couldn't create the geocoder.
            {
                alert ( config.server_error );
            };
        }
        function invalidateSize() {
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
    }
    MapDelegate.prototype.createMap = null;
    MapDelegate.prototype.addListener = null;
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