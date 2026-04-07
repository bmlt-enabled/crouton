function MeetingMap(inConfig) {
	/****************************************************************************************
	 *										CLASS VARIABLES									*
	 ****************************************************************************************/

	var gDelegate = new MapDelegate(inConfig);
	var gModalDelegate = null;
	var gInDiv = null;
	const config = inConfig;
	if (!config.maxZoom) config.maxZoom = 17;
	if (!config.minZoom) config.minZoom = 6;
	if (!config.marker_contents_template) config.marker_contents_template = croutonDefaultTemplates.marker_contents_template;
	var gAllMeetings = [];
	var gMeetingIdsFromCrouton = null;
	var gSearchPoint = false;
	var loadedCallbackFunction = null;
	var loadedCallbackArgs = [];
	var oldBounds = false;
	var isMouseDown = false;
	function preloadApiLoadedCallback(f,a) {
		loadedCallbackFunction = f;
		loadedCallbackArgs = a;
	}
	function apiLoadedCallback() {
		loadedCallbackFunction(...loadedCallbackArgs);
	}

	function retrieveGeolocation() {
		return new Promise((resolve, reject) => {
			if (window.storedGeolocation) {
				resolve(window.storedGeolocation);
			} else if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition((position) => {
					window.storedGeolocation = {
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					};
					resolve(window.storedGeolocation);
				}, (error) => {
					reject(new Error('Error getting geolocation: ' + error.message));
				});
			} else {
				reject(new Error('Geolocation is not supported by this browser.'));
			}
		});
	}
	function isFilterVisible() {
		return config.filter_visible && config.filter_visible == 1;
	}
	/************************************************************************************//**
	 *	\brief Load the map and set it up.													*
	 ****************************************************************************************/

	function loadMap(inDiv, menuContext, handlebarMapOptions=null,cb=null,hide=false) {
		if (inDiv) {
			crouton_Handlebars.registerPartial("markerContentsTemplate", crouton_Handlebars.compile(config['marker_contents_template']));
			gInDiv = inDiv;
			createThrobber(inDiv);
			if (!config.map_search) showThrobber();
			else {
				if (!config.map_search.width) config.map_search.width = -50;
				if (!config.map_search.location && !config.map_search.coordinates_search)
					config.map_search.auto = true;
				if (config.map_search.latitude || config.map_search.longitude) {
					config.lat = config.map_search.latitude;
					config.lng = config.map_search.longitude;
				}
				if (config.map_search.zoom) {
					config.zoom = config.map_search.zoom;
				}
			}
			let loc = {latitude: config.lat, longitude: config.lng, zoom: config.zoom};
			if (handlebarMapOptions) loc = {latitude: handlebarMapOptions.lat, longitude: handlebarMapOptions.lng};
			if (gDelegate.createMap(inDiv, loc, hide)) {
				// crouton_map and filter_visible triggers a query, Otherwise, redraw markers
				if (config.map_search && isFilterVisible()) {
					gDelegate.addListener('idle', triggerCroutonMapNewQuery, false);
				} else {
					gDelegate.addListener('zoomend', function (ev) {
						if (shouldRedrawMarkers() && gAllMeetings) {
							if (listOnlyVisible) {
								const oldValue = filterVisible(false);
								searchResponseCallback();
								filterVisible(oldValue);
							} else searchResponseCallback();
						}
					}, false);
				}
				// set up control buttons in map
				if (config.map_search) gDelegate.addControl(createSearchButton(), 'topleft', cb);
				else {
					const menuImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAb0lEQVRYR2NkGGDAOMD2M4w6YDQEUEJg8eLF/7t2PqVpuixzl2aIjY2F2wtn0MNymM+QHTF4HAByHT1CAWcU0DTi8Rg+mg0HVwgMaCKkh+Wj5QAoBEbLAfQyaXBlw4EojkfbA6PtgdFcMBoCoyEAAJZTVCFyqxytAAAAAElFTkSuQmCC";
					if (menuContext) {
						menuContext.menuImage = menuImage;
						gDelegate.addControl(createNext24Toggle(), 'topleft');
						gDelegate.addControl(createMenuButton(menuContext), 'topright', cb);
					} else {
						menuContext = {menuImage: menuImage, config: config, dropdownData:false};
						gDelegate.addControl(createMenuButton(menuContext), 'topright', cb);
					}
				}
				if (config.caption) {
					const wrapper= document.createElement('div');
					wrapper.innerHTML= '<div class="map-caption">'+config.caption.replace('\n','<br/>')+'</div>';
					gDelegate.addControl(wrapper.firstChild, 'bottomleft', cb);
				}
			}
		};
	};
	var gSearchModal;
	function createSearchButton() {
		const template = hbs_Crouton.templates['mapSearch'];
		const controlDiv = document.createElement('div');
		const params = {};
		controlDiv.innerHTML = template(params);
		controlDiv.querySelector("#map-search-button").addEventListener('click', showBmltSearchDialog);
		controlDiv.querySelector("#bmltsearch-nearbyMeetings").addEventListener('click', nearMeSearch);
		controlDiv.querySelector("#bmltsearch-goto-text").addEventListener('keypress', function (event) {
			if (event.key === "Enter") {
				event.preventDefault();
				document.getElementById("bmltsearch-text-button").click();
			}
		});
		controlDiv.querySelector("#bmltsearch-text-button").addEventListener('click', function () {
			let text = document.getElementById("bmltsearch-goto-text").value.trim();
			if (text === "") return;
			showThrobber();
			gDelegate.callGeocoder(text, null, mapSearchGeocode);
			clearMessageAndClose(gSearchModal);
		});
		controlDiv.querySelector("#modal-seach-parameters").style.display = 'none';
		controlDiv.querySelector("#show-search-parameters").addEventListener('click', function (e) {
			const controlDiv = e.target.parentElement.parentElement;
			let w = config.map_search.width;
			let checked = '#search_radius';
			if (w < 0) {
				w = -w;
				checked = '#search_count';
			}
			controlDiv.querySelector(checked).checked = true;
			controlDiv.querySelector('#search_parameter').value = w;
			controlDiv.querySelector("#modal-seach-parameters").style.display = 'block';
			controlDiv.querySelector("#modal-search-page").style.display = 'none';
			controlDiv.querySelector("#search_radius_label").innerHTML = crouton.localization.getWord('Radius of search in $$').replace('$$', crouton.config.distance_units);
		});
		controlDiv.querySelector("#show-search-page").addEventListener('click', function (e) {
			const controlDiv = e.target.parentElement.parentElement;
			let w = controlDiv.querySelector('#search_parameter').value;
			if (controlDiv.querySelector('#search_count')) {
				w = -Math.round(w);
				if (w == 0) w = -1;
			}
			config.map_search.width = w;
			controlDiv.querySelector("#modal-seach-parameters").style.display = 'none';
			controlDiv.querySelector("#modal-search-page").style.display = 'block';
		});

		controlDiv.querySelector("#bmltsearch-clicksearch").addEventListener('click', clickSearch);
		[...controlDiv.getElementsByClassName('modal-close')].forEach((elem)=>elem.addEventListener('click', (e)=>clearMessageAndClose(e.target)));
		gSearchModal = controlDiv.querySelector("#bmltsearch_modal");
		gSearchModal.parentElement.removeChild(gSearchModal);

		return controlDiv;
	}
	var next24status = false;
	function createNext24Toggle() {
		const toggleSrc = `
	<div id="next24_toggle" title="Next24_toggle" style="background: rgba(0, 0, 0, 0); cursor: pointer;">
		 <div class="onoffswitch">
			 <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox" id="next24onoffswitch"/>
			 <label class="onoffswitch-label" for="next24onoffswitch">
				 <span class="onoffswitch-inner"></span>
				 <span class="onoffswitch-switch"></span>
			 </label>
		 </div>
	</div>`;
		let rules = `.onoffswitch-inner:before {
		content: "__text1__";
		padding-left: 10px;
		background-color: #2d5c88; color: #FFFFFF;
		}
		.onoffswitch-inner:after {
		content: "__text2__";
		padding-left: 30px;
		background-color: #EEEEEE; color: #2d5c88;
		text-align: left;
		}`
			.replace("__text1__", crouton.localization.getWord("Upcoming Meetings"))
			.replace("__text2__", crouton.localization.getWord("All Meetings"));
		var controlDiv = document.createElement('div');
		controlDiv.innerHTML = toggleSrc;
		controlDiv.querySelector(".onoffswitch").addEventListener('click', function (event) {
			if (event.pointerId < 0) return;
			next24status = !next24status;
			fitDuringFilter = false;
			crouton.filterNext24(next24status);
			fitDuringFilter = true;
		});
		let style = document.createElement('style');
    	style.innerHTML = rules;
   		document.head.appendChild(style);
		return controlDiv;
	}
	function createMenuButton(menuContext) {
		var template = hbs_Crouton.templates['mapMenu'];
		var controlDiv = document.createElement('div');
		controlDiv.innerHTML = template(menuContext);
		controlDiv.querySelector("#nearbyMeetings").addEventListener('click', function (e) {
			retrieveGeolocation().then(position => {
				filterVisible(false);
				gDelegate.setViewToPosition(position, filterMeetingsAndBounds, filterVisible);
				gSearchPoint = {"lat": position.latitude, "lng": position.longitude};
				crouton.updateDistances();

			}).catch(error => {
				console.log(error.message);
				jQuery('.geo').removeClass("hide").addClass("show").html(`<p>${error.message}</p>`);
			});
			dropdownContent = document.getElementById("map-menu-dropdown").style.display = "none";
		});

		controlDiv.querySelector("#lookupLocation").addEventListener('click', showGeocodingDialog);
		if (menuContext && menuContext.dropdownData) {
			controlDiv.querySelector("#filterMeetings").addEventListener('click', showFilterDialog);
			controlDiv.querySelector("#showAsTable").addEventListener('click', showListView);
		} else {
			controlDiv.querySelector("#filterTable").addEventListener('click', toggleVisible);
		}
		controlDiv.querySelector("#fullscreenMode").addEventListener('click', toggleFullscreen);
		controlDiv.querySelector("#map-menu-button").addEventListener('click', function (e) {
			let dropdownContent = document.getElementById("map-menu-dropdown");
			if (dropdownContent.style.display == "inline-block") {
				dropdownContent.style.display = "none";
			} else {
				jQuery("#filteringByVisibility").html(listOnlyVisible?'&#10004;':'');
				dropdownContent.style.display = "inline-block";
			}
		});
		[...controlDiv.getElementsByClassName('modal-close')].forEach((elem)=>elem.addEventListener('click', (e)=>closeModalWindow(e.target)));
		controlDiv.querySelector("#close_table").addEventListener('click', hideListView);
		controlDiv.querySelector("#goto-text").addEventListener('keydown', function (event) {
			if (event && event.key == "Enter") {
				closeModalWindow(event.target);
				lookupLocation(g_suspendedFullscreen);
			}
		});
		controlDiv.querySelector("#goto-button").addEventListener('click', function (event) {
			closeModalWindow(event.target);
			lookupLocation(g_suspendedFullscreen);
		});

		return controlDiv;
	}
	function hasMapSearch() {
		return 'map_search' in config;
	}
	function loadFromCrouton(inDiv_id, meetings_responseObject, menuContext = null, handlebarMapOptions = null, fitBounds = true, callback, hide) {
		if (!gDelegate.isApiLoaded()) {
			preloadApiLoadedCallback(loadFromCrouton, [inDiv_id, meetings_responseObject, menuContext, handlebarMapOptions, fitBounds, callback, hide]);
			gDelegate.loadApi();
			return;
		}
		let inDiv = document.getElementById(inDiv_id);
		loadMap(inDiv, menuContext, handlebarMapOptions, callback, hide);
		loadAllMeetings(meetings_responseObject, fitBounds, true);
	};
	function loadPopupMap(inDiv_id, meeting, handlebarMapOptions = null) {
		if (!gDelegate.isApiLoaded()) {
			preloadApiLoadedCallback(loadPopupMap, [inDiv_id, meeting, handlebarMapOptions]);
			gDelegate.loadApi();
			return;
		}
		let inDiv = document.getElementById(inDiv_id);
		if (!inDiv) return;
		let delegate = new MapDelegate(config);
		if (handlebarMapOptions) loc = {latitude: handlebarMapOptions.lat, longitude: handlebarMapOptions.lng, zoom: handlebarMapOptions.zoom};
		if (delegate.createMap(inDiv, loc)) {
			const marker = delegate.createMarker([meeting.latitude, meeting.longitude], false, null);
			delegate.bindPopup(marker, null, meeting.id_bigint, false);
			delegate.addClusterLayer();
			gModalDelegate = delegate;
		}
	};
	var fitDuringFilter = true;
	function filterFromCrouton(filter) {
		gMeetingIdsFromCrouton = filter;
		if (gAllMeetings)
			searchResponseCallback(fitDuringFilter && !listOnlyVisible);
	};
	function clearMessageAndClose(modal) {
		jQuery('#zoomed-out-message').not('.hide').addClass('hide');
		closeModalWindow(modal);
	}
	function nearMeSearch() {
		retrieveGeolocation().then(position => {
			showThrobber();
			gSearchPoint = {"lat": position.latitude, "lng": position.longitude};
			crouton.searchByCoordinates(position.latitude, position.longitude, config.map_search.width);
			if (activeModal == gSearchModal) clearMessageAndClose(gSearchModal);
		}).catch(error => {
			console.log(error.message);
			if (activeModal != gSearchModal) showBmltSearchDialog();
		});
	};
	function clickSearch(e) {
		croutonMap.showMap(false,false);
		gDelegate.clickSearch(e, function(lat,lng) {
			showThrobber();
			gSearchPoint = {"lat": lat, "lng": lng};
			crouton.searchByCoordinates(lat, lng, config.map_search.width);
		});
		clearMessageAndClose(gSearchModal);
	}
	function createThrobber(inDiv) {
		if (!inDiv.myThrobber) {
			inDiv.myThrobber = document.createElement("div");
			if (inDiv.myThrobber) {
				inDiv.myThrobber.id = inDiv.id + 'Throbber_div';
				inDiv.myThrobber.className = 'bmlt_map_throbber_div';
				inDiv.myThrobber.style.display = 'none';
				inDiv.appendChild(inDiv.myThrobber);
				var img = document.createElement("img");

				if (img) {
					img.src = config.BMLTPlugin_images ? config.BMLTPlugin_images + "/Throbber.gif"
					: "data:image/gif;base64,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";
					img.className = 'bmlt_mapThrobber_img';
					img.id = inDiv.id + 'Throbber_img';
					img.alt = 'AJAX Throbber';
					inDiv.myThrobber.appendChild(img);
				} else {
					inDiv.myThrobber = null;
				};
			};
		};
	};
	function showThrobber() {
		if (gInDiv.myThrobber) {
			gInDiv.myThrobber.style.display = 'block';
		};
	};
	function hideThrobber() {
		if (gInDiv.myThrobber) {
			gInDiv.myThrobber.style.display = 'none';
		};
	};
	function mapSearchGeocode(resp) {
		showThrobber();
		if (document.getElementById("bmltsearch-goto-text"))
			document.getElementById("bmltsearch-goto-text").value = "";
		let latlng = gDelegate.getGeocodeCenter(resp);
		if (!latlng) {
			hideThrobber();
			return;
		}
		gSearchPoint = {"lat": latlng.lat, "lng": latlng.lng};
		crouton.searchByCoordinates(latlng.lat, latlng.lng, config.map_search.width);
	}
	function loadAllMeetings(meetings_responseObject, fitBounds=true, fitAll=false) {
		if (meetings_responseObject === null && config.map_search) {
			if (config.map_search.auto) nearMeSearch();
			else if (config.map_search.coordinates_search) {
				showThrobber();
				config.map_search.coordinates_search = false;
				gSearchPoint = {"lat": config.map_search.latitude, "lng": config.map_search.longitude};
				crouton.searchByCoordinates(config.map_search.latitude, config.map_search.longitude, config.map_search.width);
			}
			else if (config.map_search.location) gDelegate.callGeocoder(config.map_search.location, null, mapSearchGeocode);
			else showBmltSearchDialog();
			return;
		}
		gAllMeetings = meetings_responseObject.filter(m => m.venue_type != 2);
		if (fitBounds) {
			let lat_lngs = gAllMeetings.reduce(function(a,m) {a.push([m.latitude, m.longitude]); return a;},[]);
			const maxRadius = config.maxTomatoWidth/2.0;
			if (gSearchPoint) lat_lngs.push([gSearchPoint.lat, gSearchPoint.lng]);
			if (config.map_search && isFilterVisible()) {
				lat_lngs.sort((a,b) =>  getDistance({"lat":a[0],"lng":a[1]},gSearchPoint) - getDistance({"lat":b[0],"lng":b[1]},gSearchPoint));
				while (getLatLngRadius(lat_lngs) > maxRadius && lat_lngs.length > 3) {
					lat_lngs = lat_lngs.slice(0, lat_lngs.length/2);
				}
				if (getLatLngRadius(lat_lngs) > maxRadius)
					lat_lngs = lat_lngs.slice(1,1);
			}
			if (lat_lngs.length > 0) gDelegate.fitBounds(lat_lngs);
		}
		searchResponseCallback();
		hideThrobber();
		if (isFilterVisible() || config.centerMe || config.goto) crouton.forceShowMap();
		if (config.centerMe) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					function (position) {
						coords = {latitude: position.coords.latitude, longitude: position.coords.longitude};
						filterVisible(false);
						if (config.zoom) gDelegate.setZoom(false, config.zoom);
						gDelegate.setViewToPosition(coords, filterMeetingsAndBounds, () => {
							filterVisible(isFilterVisible());
						});
						gSearchPoint = {"lat": position.coords.latitude, "lng": position.coords.longitude};
						crouton.updateDistances(true);
					},
					showGeocodingDialog
				);
			} else if (fitAll) {
				showGeocodingDialog();
			}
		} else {
			if ((!config.centerMe && !config.goto) && !(config.map_search && isFilterVisible())) {
			  gDelegate.afterInit(()=>filterVisible(isFilterVisible()));
			}
			if (config.goto) gDelegate.callGeocoder(config.goto, isFilterVisible() ? resetVisibleThenFilterMeetingsAndBounds : setVisibleThenFilterMeetingsAndBounds);
		}
	}
	function createCityHash(allMeetings) {
		return allMeetings.reduce(function(prev, meeting) {
			if (prev.hasOwnProperty(meeting.location_municipality))
				prev[meeting.location_municipality].push(meeting);
			else
				prev[meeting.location_municipality] = [meeting];
			return prev;
		}, {});
	}
	var g_suspendedFullscreen = false;
	var g_overflowX;
	var activeModal = null;
	var swipableModal = false;
	function closeModalWindow(modal) {
		gDelegate.modalOff();
		activeModal = null;
		if (!modal.classList.contains("modal"))
			return closeModalWindow(modal.parentNode);
		modal.style.display = "none";
		if (g_suspendedFullscreen) {
			g_suspendedFullscreen = false;
			if (!isFullscreen()) {
				toggleFullscreen();
			}
		}
		if (swipableModal) {
			const body = document.body;
			const scrollY = body.style.top;
			body.style.overflowX = g_overflowX;
			body.style.position = '';
			body.style.top = '';
			window.scrollTo(0, parseInt(scrollY || '0') * -1);
		}
	}
	document.addEventListener("keydown", function(event) {
		if (activeModal && event.key == "Escape") {
			closeModalWindow(activeModal);
		}
	}, true);
	function openModalWindow(modal,swipe=false) {
		if (isFullscreen()) {
			g_suspendedFullscreen = true;
			toggleFullscreen();
		}
		if (!modal) return;
		modal.style.display = "block";
		swipableModal = swipe;
		modal.focus();
		activeModal = modal;
		dd = document.getElementById("map-menu-dropdown");
		if (dd) dd.style.display = "none";
		gDelegate.modalOn();
		if (swipableModal) {
			const body = document.body;
			g_overflowX = body.style.overflowX;
			const newTop = -window.scrollY+'px';
			body.style.overflowX = 'hidden';
			body.style.position = 'fixed';
			body.style.width="100%";
			body.style.setProperty('top', newTop, 'important');
		}
	}
	function showFilterDialog(e) {
		openModalWindow(document.getElementById('filter_modal'));
	}
	function showBmltSearchDialog(e) {
		if (!document.getElementById('bmltsearch_modal')) gInDiv.appendChild(gSearchModal);
		if (gDelegate.isMapDefined())
			jQuery('#bmltsearch-clicksearch').parent().show();
		else
			jQuery('#bmltsearch-clicksearch').parent().hide();
		openModalWindow(gSearchModal);
	}
	function showGeocodingDialog(e=null) {
		openModalWindow(document.getElementById('geocoding_modal'));
	}
	function showListView(e=null) {
		filterVisible();
		jQuery("#bmlt-tabs").append(jQuery("#table_page"));
		jQuery("#table_page").removeClass("hide");
		jQuery("#bmlt-map").css("display", "none");
		jQuery("#table_page").css("max-height", jQuery("#bmlt-map").height());
		jQuery("#bmlt-maptable-div").css("height", jQuery("#bmlt-map").height()-jQuery("#bmlt-maptable-header").height());
		document.getElementById("map-menu-dropdown").style.display = "none";
	}
	function hideListView(e=null) {
		filterVisible(false);
		jQuery("#table_page").addClass("hide");
		jQuery("#bmlt-map").css("display", "block");
	}
	function resetVisibleThenFilterMeetingsAndBounds(bounds, center=null) {
		filterVisible(false);
		const ret = filterMeetingsAndBounds(bounds);
		filterVisible(true);
		if (gSearchPoint.lat != center.lat || gSearchPoint.lng != center.lng) {
			gSearchPoint = center;
			crouton.updateDistances();
		}
		return ret;
	}
	function setVisibleThenFilterMeetingsAndBounds(bounds, center=null) {
		filterVisible(false);
		const ret = filterMeetingsAndBounds(bounds);
		if (gSearchPoint.lat != center.lat || gSearchPoint.lng != center.lng) {
			gSearchPoint = center;
			crouton.updateDistances();
		}
		return ret;
	}
	function lookupLocation(fullscreen) {
		if (document.getElementById('goto-text').value != '') {
			if (fullscreen) {
				gDelegate.addListener('idle', function () {
					gDelegate.callGeocoder(document.getElementById('goto-text').value, resetVisibleThenFilterMeetingsAndBounds);
				}, true);
			} else {
				gDelegate.callGeocoder(document.getElementById('goto-text').value, resetVisibleThenFilterMeetingsAndBounds);
			}
		} else {
			alert("");
		};
		return true;
	};
	function searchResponseCallback(expand = false) {
		if (!gAllMeetings || !gAllMeetings.length) {
			return;
		};
		try {
			drawMarkers(expand);
			if (gSearchPoint) {
				gDelegate.markSearchPoint([gSearchPoint.lat, gSearchPoint.lng]);
			}
		} catch (e) {
			console.log(e);
			gDelegate.addListener('projection_changed', function (ev) {
				drawMarkers(expand);
				if (gSearchPoint) {
					gDelegate.markSearchPoint([gSearchPoint.lat, gSearchPoint.lng]);
				}
			}, true);
		}
	};
	/****************************************************************************************
	 *									CREATING MARKERS									*
	 ****************************************************************************************/
	var prevUseMarkerCluster;
	function useMarkerCluster() {
		if (config.groups) return true;
		if (typeof gDelegate.getZoom() === 'undefined') return true;
		if (typeof config.clustering === 'undefined') return false;
		return gDelegate.getZoom() < config.clustering;
	}
	function shouldRedrawMarkers() {
		if (typeof prevUseMarkerCluster === 'undefined') return true;
		if (prevUseMarkerCluster !== useMarkerCluster()) {
			prevUseMarkerCluster = useMarkerCluster();
			return true;
		}
		if (useMarkerCluster()===false) {
			return true;
		}
		return false;
	}
	function drawMarkers(expand = false) {
		if (!gDelegate.isMapDefined()) return;
		const openMarker = gDelegate.getOpenMarker();
		gDelegate.clearAllMarkers();
		gDelegate.removeClusterLayer();
		// This calculates which markers are the red "multi" markers.
		const filtered = filterMeetings(gAllMeetings);
		const overlap_map = config.groups ? filtered
			:	((useMarkerCluster() || filtered.length == 1)
				? filtered.map((m)=>[m])
				: mapOverlappingMarkersInCity(filtered));

		if (useMarkerCluster()) gDelegate.createClusterLayer();
		// Draw the meeting markers.
		markerCreator = config.groups ? createGroupMarker : createMapMarker;
		overlap_map.forEach(function (marker) {
			markerCreator(marker, openMarker);
		});
		gDelegate.addClusterLayer();
		if (expand) {
			const lat_lngs = filtered.reduce(function(a,m) {a.push([m.latitude, m.longitude]); return a;},[]);
			gDelegate.fitBounds(lat_lngs);
		}
	};
	function mapOverlappingMarkersInCity(in_meeting_array)	///< Used to draw the markers when done.
	{
		var tolerance = 8;	/* This is how many pixels we allow. */

		var ret = new Array;
		// We create this hash because we limit looking for "matches" to within one city.
		for (const [city, meetings] of Object.entries(createCityHash(in_meeting_array))) {
			// create a tmp object so we can mark which items haven't been matched yet.
			var tmp = meetings.map((meeting) => {
				item = new Object;
				item.matched = false;
				item.meeting = meeting;
				item.coords = gDelegate.fromLatLngToPoint(meeting.latitude, meeting.longitude);
				return item;
			});
			tmp.reduce(function(prev, item, index) {
				if (item.matched) return prev;
				matches = [item.meeting];
				var outer_coords = item.coords;
				for (c2 = index+1; c2<meetings.length; c2++) {
					if (tmp[c2].matched) continue;
					var inner_coords = tmp[c2].coords;

					var xmin = outer_coords.x - tolerance;
					var xmax = outer_coords.x + tolerance;
					var ymin = outer_coords.y - tolerance;
					var ymax = outer_coords.y + tolerance;

					/* We have an overlap. */
					if ((inner_coords.x >= xmin) && (inner_coords.x <= xmax) && (inner_coords.y >= ymin) && (inner_coords.y <= ymax)) {
						matches.push(tmp[c2].meeting);
						tmp[c2].matched = true;
					}
				}
				matches.sort(sortMeetingSearchResponseCallback)
				prev.push(matches);
				return prev;
			}, ret);
		}

		return ret;
	};
	function sortMeetingSearchResponseCallback(mtg_a, mtg_b) {
	var weekday_score_a = parseInt(mtg_a.weekday_tinyint, 10);
	var weekday_score_b = parseInt(mtg_b.weekday_tinyint, 10);

	if (weekday_score_a < config.start_week) {
		weekday_score_a += 7;
	}

	if (weekday_score_b < config.start_week) {
		weekday_score_b += 7;
	}

	if (weekday_score_a < weekday_score_b) {
		return -1;
	}
	else if (weekday_score_a > weekday_score_b) {
		return 1;
	};
	var time_a = mtg_a.start_time.toString().split(':');
	var time_b = mtg_b.start_time.toString().split(':');
	if (parseInt(time_a[0]) < parseInt(time_b[0])) {
		return -1;
	}
	if (parseInt(time_a[0]) > parseInt(time_b[0])) {
		return 1;
	}
	if (parseInt(time_a[1]) < parseInt(time_b[1])) {
		return -1;
	}
	if (parseInt(time_a[1]) > parseInt(time_b[1])) {
		return 1;
	}
	return 0;
};
	const markerTemplateSrc = `
	<div class="accordion">
	{{#each this}}<div>
			<input type="radio" name="panel" id="panel-{{this.id_bigint}}" {{#unless @index}}checked{{/unless}}/>
			<label for="panel-{{this.id_bigint}}">{{this.formatted_day}} {{this.start_time_formatted}}</label>
			<div class="marker_div_meeting" id="{{this.id_bigint}}">
				{{> markerContentsTemplate}}
			</div>
	</div>{{/each}}
	</div>
	`;
	const markerTemplate = crouton_Handlebars.compile(markerTemplateSrc);

	/************************************************************************************//**
	 *	 \brief	This creates a single meeting's marker on the map.							*
	 ****************************************************************************************/
	function createMapMarker(meetings, openMarker) {
		var main_point = [meetings[0].latitude, meetings[0].longitude];
		const marker_html = markerTemplate(meetings);
		const marker = gDelegate.createMarker(main_point, (meetings.length > 1), null);
		gDelegate.bindPopup(marker, marker_html, meetings.map((m)=>parseInt(m.id_bigint)), openMarker);
	};
	function createGroupMarker(group, openMarker) {
		var main_point = [group.latitude, group.longitude];
		const marker = gDelegate.createMarker(main_point, group['membersOfGroup'].length > 1, null);
		gDelegate.addMarkerCallback(marker, function() {
			crouton.openMeetingModal(group);
		});
	};
	var listOnlyVisible = false;
	var listener = null;
	function filterBounds(bounds) {
		return gAllMeetings.filter((meeting) => gDelegate.contains(bounds, meeting.latitude, meeting.longitude));
	}
	function onDragStart() {
		isMouseDown = true;
		// if no [crouton_map], then show all meetings
		if (!config.map_search) filterVisible(false);
		gDelegate.addListener('dragend', onDragEnd, true);
	}
	function onDragEnd() {
		isMouseDown = false;
		// if no [crouton_map], then turn filter visible back on.
		if (config.map_search && isFilterVisible()) triggerCroutonMapNewQuery(null);
		else filterVisible(true);
	}
	function triggerCroutonMapNewQuery(ev) {
		if (isMouseDown) return;
		gMeetingIdsFromCrouton = null;
		corners = gDelegate.getCorners();
		if (oldBounds && gDelegate.contains(oldBounds,corners.ne.lat,corners.ne.lng)
					  && gDelegate.contains(oldBounds,corners.sw.lat,corners.sw.lng)) {
			filterVisible();
		} else if (getScreenRadius('km') > config.maxTomatoWidth) {
			jQuery('#zoomed-out-message').removeClass('hide');
			showBmltSearchDialog(null);
		} else {
			oldBounds = gDelegate.getBounds();
			showThrobber();
			crouton.searchByCoordinates(gDelegate.getCenter().lat, gDelegate.getCenter().lng, getScreenRadius(), false);
		}
	}
	function filterVisible(on=true) {
		if (on==listOnlyVisible && !config.map_search) return on;
		let mtgs = on ? filterBounds(gDelegate.getBounds()) : gAllMeetings;
		let visible = mtgs.map((m)=>m.id_bigint);
		jQuery(".bmlt-data-row").each(function(index,row) {
			row.dataset.visible = (visible.includes(row.id.split('-').pop())) ? '1' : '0';
		});
		jQuery("#byday").removeClass('hide');
		jQuery("#filter-dropdown-visibile").val(on?'a-1':'');
		fitDuringFilter = false;
		crouton.simulateFilterDropdown();
		fitDuringFilter = true;
		jQuery("#filteringByVisibility").html(on?'&#10004;':'');
		listOnlyVisible = on;
		if (on) listener = gDelegate.addListener('dragstart', onDragStart, true);
		else if (listener) {
			gDelegate.removeListener(listener);
			listener = null;
		}
		return !on;
	}
	function toggleVisible() {
		filterVisible(!listOnlyVisible);
	}
	function filterBounds(bounds) {
		var ret = gAllMeetings.filter((meeting) =>
			gDelegate.contains(bounds, meeting.latitude, meeting.longitude));
		return ret;
	}
	function focusOnMeeting(meetingId) {
		let meeting = gAllMeetings.find((meeting) => meeting.id_bigint == meetingId);
		if (!meeting) return;
		if ((gDelegate.getZoom()>=14) && gDelegate.contains(gDelegate.getBounds(), meeting.latitude, meeting.longitude)) {
			gDelegate.openMarker(meetingId);
		} else {
			gDelegate.setViewToPosition({latitude: meeting.latitude, longitude: meeting.longitude}, filterMeetingsAndBounds, function() {gDelegate.openMarker(meetingId);});
		}
	}
	function filterMeetingsAndBounds(bounds) {
		return filterMeetings(filterBounds(bounds));
	}
	function filterMeetings(in_meetings_array) {
		var ret = in_meetings_array.filter(m => m.venue_type != 2);
		if (gMeetingIdsFromCrouton != null) {
			return ret.filter((m) => gMeetingIdsFromCrouton.includes(m.id_bigint));
		}
		return ret;
	}
	var _isPseudoFullscreen = false;
	function isFullscreen() {
		var fullscreenElement =
			document.fullscreenElement ||
			document.mozFullScreenElement ||
			document.webkitFullscreenElement ||
			document.msFullscreenElement;

		return (fullscreenElement === gInDiv) || _isPseudoFullscreen;
	}
	function toggleFullscreen(options) {
		var container = gInDiv;
		if (isFullscreen()) {
			if (options && options.pseudoFullscreen) {
				_setFullscreen(false);
			} else if (document.exitFullscreen) {
				document.exitFullscreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			} else if (document.msExitFullscreen) {
				document.msExitFullscreen();
			} else {
				_disablePseudoFullscreen(container);
			}
		} else {
			if (options && options.pseudoFullscreen) {
				_setFullscreen(true);
			} else if (container.requestFullscreen) {
				container.requestFullscreen();
			} else if (container.mozRequestFullScreen) {
				container.mozRequestFullScreen();
			} else if (container.webkitRequestFullscreen) {
				container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			} else if (container.msRequestFullscreen) {
				container.msRequestFullscreen();
			} else {
				_enablePseudoFullscreen(container);
			}
		}
	}
	var _isPseudoFullscreen = false;
	function _setFullscreen(fullscreen) {
		_isPseudoFullscreen = fullscreen;
		var container = gInDiv;
		if (fullscreen) {
			L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
		} else {
			L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
		}
		gDelegate.invalidateSize();
	}
	function showMap(isModal=false, fitBounds=true) {
		if (isModal && gModalDelegate) {
			gModalDelegate.invalidateSize();
			return;
		}
		gDelegate.invalidateSize();
		if (!gAllMeetings) return;
		if (fitBounds) gDelegate.fitBounds(
			((gMeetingIdsFromCrouton) ? gAllMeetings.filter((m) => gMeetingIdsFromCrouton.includes(m.id_bigint)) : gAllMeetings)
				.reduce(function(a,m) {a.push([m.latitude, m.longitude]); return a;},[])
		);
	}
	function rad(x) {
  		return x * Math.PI / 180;
	}

	function getDistance(p1, p2) {
		var R = 6378137; // Earth’s mean radius in meter
		var dLat = rad(p2.lat - p1.lat);
		var dLong = rad(p2.lng - p1.lng);
		var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    		Math.cos(rad(p1.lat)) * Math.cos(rad(p2.lat)) *
    		Math.sin(dLong / 2) * Math.sin(dLong / 2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c;
  		return d; // returns the distance in meter
	}
	function getDistanceFromSearch(p) {
		if (!gSearchPoint) return false;
		const d = getDistance(p, gSearchPoint);
		return {"km": d/1000.0, "miles": d*0.00062137119};
	}
	function getScreenRadius(units=false) {
		if (!units) units = crouton.config.distance_units;
		return getBoundsRadius(gDelegate.getCorners(), units);
	}
	function getBoundsRadius(corners, units = 'km') {
		return (getDistance(corners.ne, corners.sw)/2000.0) * ((units == 'km') ? 1.0 : 0.62137119);
	}
	function getLatLngRadius(lat_lngs) {
		return getBoundsRadius(gDelegate.getCorners(lat_lngs), 'km');
	}
	/****************************************************************************************
	 *								MAIN FUNCTIONAL INTERFACE								*
	 ****************************************************************************************/
	this.initialize = loadFromCrouton;
	this.showMap = showMap;
	this.fillMap = filterFromCrouton;
	this.rowClick = focusOnMeeting;
	this.apiLoadedCallback = apiLoadedCallback;
	this.refreshMeetings = loadAllMeetings;
	this.getDistanceFromSearch = getDistanceFromSearch;
	this.openModalWindow = openModalWindow;
	this.closeModalWindow = closeModalWindow;
	this.loadPopupMap = loadPopupMap;
	this.filterVisible = filterVisible;
	this.hasMapSearch = hasMapSearch;
};
MeetingMap.prototype.initialize = null;
MeetingMap.prototype.showMap = null;
MeetingMap.prototype.fillMap = null;
MeetingMap.prototype.rowClick = null;
MeetingMap.prototype.apiLoadedCallback = null;
MeetingMap.prototype.refreshMeetings = null;
MeetingMap.prototype.getDistanceFromSearch = null;

MeetingMap.prototype.openModalWindow = null;
MeetingMap.prototype.closeModalWindow = null;
MeetingMap.prototype.loadPopupMap = null;
MeetingMap.prototype.filterVisible = null;
MeetingMap.prototype.hasMapSearch = null;
