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
        let iconUrl = config.BMLTPlugin_images ? config.BMLTPlugin_images+"/NAMarker.png"
		: "data:image/png;base64,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";
    g_icon_image_single = new google.maps.MarkerImage ( iconUrl, new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
	iconUrl = config.BMLTPlugin_images ? config.BMLTPlugin_images+"/NAMarkerG.png"
		: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAhCAYAAAAyCTAQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAADTRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+Cjx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDQuMi4yLWMwNjMgNTMuMzUyNjI0LCAyMDA4LzA3LzMwLTE4OjA1OjQxICAgICAgICAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICAgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIKICAgIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIKICAgIHhtbG5zOklwdGM0eG1wQ29yZT0iaHR0cDovL2lwdGMub3JnL3N0ZC9JcHRjNHhtcENvcmUvMS4wL3htbG5zLyIKICAgeG1wUmlnaHRzOldlYlN0YXRlbWVudD0iIgogICBwaG90b3Nob3A6QXV0aG9yc1Bvc2l0aW9uPSIiPgogICA8ZGM6cmlnaHRzPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ii8+CiAgICA8L3JkZjpBbHQ+CiAgIDwvZGM6cmlnaHRzPgogICA8ZGM6Y3JlYXRvcj4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkvPgogICAgPC9yZGY6U2VxPgogICA8L2RjOmNyZWF0b3I+CiAgIDxkYzp0aXRsZT4KICAgIDxyZGY6QWx0PgogICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+TkFNYXJrZXI8L3JkZjpsaT4KICAgIDwvcmRmOkFsdD4KICAgPC9kYzp0aXRsZT4KICAgPHhtcFJpZ2h0czpVc2FnZVRlcm1zPgogICAgPHJkZjpBbHQ+CiAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ii8+CiAgICA8L3JkZjpBbHQ+CiAgIDwveG1wUmlnaHRzOlVzYWdlVGVybXM+CiAgIDxJcHRjNHhtcENvcmU6Q3JlYXRvckNvbnRhY3RJbmZvCiAgICBJcHRjNHhtcENvcmU6Q2lBZHJFeHRhZHI9IiIKICAgIElwdGM0eG1wQ29yZTpDaUFkckNpdHk9IiIKICAgIElwdGM0eG1wQ29yZTpDaUFkclJlZ2lvbj0iIgogICAgSXB0YzR4bXBDb3JlOkNpQWRyUGNvZGU9IiIKICAgIElwdGM0eG1wQ29yZTpDaUFkckN0cnk9IiIKICAgIElwdGM0eG1wQ29yZTpDaVRlbFdvcms9IiIKICAgIElwdGM0eG1wQ29yZTpDaUVtYWlsV29yaz0iIgogICAgSXB0YzR4bXBDb3JlOkNpVXJsV29yaz0iIi8+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz7HRMckAAAG20lEQVR42qyWeXBV9RXHP/fet+QlL+QlPAgkeZIFxAWxqWBVagVKYtQUUTvtSIeKLYNY24pY/MPptA50nI4OnXbGzojVoSLNdFGJ6ci0MRSo1BZcILgQgglGSdJsL9vL2+679/bcBasVpON4Zn7v3d/2Pef3Pcvvp/DpskjaLQFYmq9QLf++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";
    g_icon_image_multi = new google.maps.MarkerImage ( iconUrl, new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
	iconUrl = config.BMLTPlugin_images ? config.BMLTPlugin_images+"/NAMarkerSel.png"
		: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAhCAYAAAAyCTAQAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA/JpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYxIDY0LjE0MDk0OSwgMjAxMC8xMi8wNy0xMDo1NzowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wUmlnaHRzPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvcmlnaHRzLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1wUmlnaHRzOk1hcmtlZD0iRmFsc2UiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEFFRUI5RkFCQkM0MTFFMEFEOEJGMzBCOTRGRDNBMTMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEFFRUI5RjlCQkM0MTFFMEFEOEJGMzBCOTRGRDNBMTMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTMyBNYWNpbnRvc2giPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0idXVpZDo5NkJFNTVGQjQ5MDhEQzExQUFBN0ZDRDFGNTZEMTYyMiIgc3RSZWY6ZG9jdW1lbnRJRD0idXVpZDpE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";
    g_icon_image_selected = new google.maps.MarkerImage ( iconUrl, new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );

	iconUrl = config.BMLTPlugin_images ? config.BMLTPlugin_images+"/SearchPoint.png"
		: "data:image/png;base64,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";
    g_icon_image_searchpoint = new google.maps.MarkerImage ( iconUrl, new google.maps.Size(23, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
    iconUrl = config.BMLTPlugin_images ? config.BMLTPlugin_images+"/NAMarkerS.png"
		: "data:image/png;base64,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";
    g_icon_shadow = new google.maps.MarkerImage( iconUrl, new google.maps.Size(43, 32), new google.maps.Point(0,0), new google.maps.Point(12, 32) );
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
    function isFilterVisible() {
		return config.filter_visible && config.filter_visible == 1;
	}
    function getZoomAdjust(only_out,filterMeetings) {
        if (!gMainMap) return 12;
        var ret = gMainMap.getZoom();
        if (config.map_search && isFilterVisible()) return ret;
        var center = gMainMap.getCenter();
        var bounds = gMainMap.getBounds();
        var zoomedOut = false;
        while(filterMeetings(bounds, {"lat":center.lat(), "lng":center.lng()}).length==0 && ret>6) {
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
        inTitle
)
{
    if (!gMainMap) return;
    var in_main_icon = (multi ? g_icon_image_multi : g_icon_image_single)
    var marker = null;

    var marker = new google.maps.Marker (
        { 'position':		new google.maps.LatLng(...inCoords),
            'shadow':		g_icon_shadow,
            'icon':			in_main_icon,
            'shape':		g_icon_shape,
            'cursor':		'default',
            'title':        inTitle,
            'draggable':    false
    } );
    marker.zIndex = 999;
    marker.old_image = marker.getIcon();
    return marker;
};
function bindPopup(marker, inHtml, inIds, openedMarker) {
    if (inHtml) {
        marker.desc = inHtml;
        google.maps.event.addListener ( marker, "click", function () {
            gAllMarkers.forEach((m) => m.marker.setIcon(m.marker.old_image));
            if(marker.old_image){marker.setIcon(g_icon_image_selected)};
            openInfoWindow(marker);
        });
        if (gOpenMarker &&  inIds.includes(parseInt(gOpenMarker))) {
            openInfoWindow(marker);
        }
        gInfoWindow.addListener('closeclick', function () {
            gOpenMarker = false;
            gAllMarkers.forEach((m) => m.marker.setIcon(m.marker.old_image));
            jQuery(".bmlt-data-row > td").removeClass("rowHighlight");
        });
    }
    gAllMarkers[gAllMarkers.length] = {ids: inIds, marker: marker};
}
function addMarkerCallback(marker, cb, in_ids) {
	if (cb) marker.addListener('click', () => {
		cb(in_ids);
	});
	gAllMarkers.push( {ids: in_ids, marker: marker} );
}
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
    if (!div) return;
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
        case 'bottomleft':
            p = google.maps.ControlPosition.LEFT_BOTTOM;
            div.style.margin = "0 0 0px 10px";
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
	this.bindPopup = bindPopup;
	this.addMarkerCallback = addMarkerCallback;
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
MapDelegate.prototype.bindPopup = null;
MapDelegate.prototype.addMarkerCallback = null;
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