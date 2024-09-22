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
	var gAllMeetings = null;
	var gMeetingIdsFromCrouton = null;
	var loadedCallbackFunction = null;
	var loadedCallbackArgs = [];
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

	/************************************************************************************//**
	 *	\brief Load the map and set it up.													*
	 ****************************************************************************************/

	function loadMap(inDiv, menuContext, handlebarMapOptions=null,cb=null) {
		if (inDiv) {
			crouton_Handlebars.registerPartial("markerContentsTemplate", config['marker_contents_template']);
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
			if (gDelegate.createMap(inDiv, loc)) {
				gDelegate.addListener('zoomend', function (ev) {
					if (shouldRedrawMarkers() && gAllMeetings) {
						if (listOnlyVisible) {
							const oldValue = filterVisible(false);
							searchResponseCallback();
							filterVisible(oldValue);
						} else searchResponseCallback();
					}
				}, false);
				if (config.map_search) {
					gDelegate.addControl(createSearchButton(), 'topleft', cb);
				}
				else if (menuContext) {
					menuContext.imageDir = config.BMLTPlugin_images;
					gDelegate.addControl(createNext24Toggle(), 'topleft');
					gDelegate.addControl(createMenuButton(menuContext), 'topright', cb);
				}
				else {
					menuContext = {imageDir: config.BMLTPlugin_images, config: config, dropdownData:false};
					gDelegate.addControl(createMenuButton(menuContext), 'topright', cb);
				}
			}
		};
	};
	var gSearchModal;
	function createSearchButton(menuContext) {
		var template = hbs_Crouton.templates['mapSearch'];
		var controlDiv = document.createElement('div');
		controlDiv.innerHTML = template();
		controlDiv.querySelector("#map-search-button").addEventListener('click', showBmltSearchDialog);
		controlDiv.querySelector("#bmltsearch-nearbyMeetings").addEventListener('click', nearMeSearch);
		controlDiv.querySelector("#bmltsearch-text-button").addEventListener('click', function () {
			let text = document.getElementById("bmltsearch-goto-text").value.trim();
			if (text === "") return;
			showThrobber();
			gDelegate.callGeocoder(text, null, mapSearchGeocode);
			closeModalWindow(gSearchModal);
		});
		controlDiv.querySelector("#bmltsearch-clicksearch").addEventListener('click', clickSearch);
		[...controlDiv.getElementsByClassName('modal-close')].forEach((elem)=>elem.addEventListener('click', (e)=>closeModalWindow(e.target)));
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
		rules = [`.onoffswitch-inner:before {
		content: "__text__";
		padding-left: 10px;
		background-color: #2d5c88; color: #FFFFFF;
		}`,
		`.onoffswitch-inner:after {
		content: "__text__";
		padding-left: 30px;
		background-color: #EEEEEE; color: #2d5c88;
		text-align: left;
		}`];
		rules[0] = rules[0].replace("__text__", crouton.localization.getWord("Upcoming Meetings"));
		rules[1] = rules[1].replace("__text__", crouton.localization.getWord("All Meetings"));
		var controlDiv = document.createElement('div');
		controlDiv.innerHTML = toggleSrc;
		controlDiv.querySelector(".onoffswitch").addEventListener('click', function (event) {
			if (event.pointerId < 0) return;
			next24status = !next24status;
			fitDuringFilter = false;
			crouton.filterNext24(next24status);
			fitDuringFilter = true;
		});
		document.styleSheets[0].insertRule(rules[0]);
		document.styleSheets[0].insertRule(rules[1]);
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
			}).catch(error => {
				console.error(error.message);
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

	function loadFromCrouton(inDiv_id, meetings_responseObject, menuContext = null, handlebarMapOptions = null, fitBounds = true, callback) {
		if (!gDelegate.isApiLoaded()) {
			preloadApiLoadedCallback(loadFromCrouton, [inDiv_id, meetings_responseObject, menuContext, handlebarMapOptions, fitBounds, callback]);
			gDelegate.loadApi();
			return;
		}
		let inDiv = document.getElementById(inDiv_id);
		loadMap(inDiv, menuContext, handlebarMapOptions,callback);
		loadAllMeetings(meetings_responseObject, fitBounds, true);
	};
	function loadPopupMap(inDiv_id, meeting, handlebarMapOptions = null) {
		if (!gDelegate.isApiLoaded()) {
			preloadApiLoadedCallback(loadPopupMap, [inDiv_id, meeting, handlebarMapOptions]);
			gDelegate.loadApi();
			return;
		}
		let inDiv = document.getElementById(inDiv_id);
		let delegate = new MapDelegate(config);
		if (handlebarMapOptions) loc = {latitude: handlebarMapOptions.lat, longitude: handlebarMapOptions.lng, zoom: handlebarMapOptions.zoom};
		if (delegate.createMap(inDiv, loc)) {
			delegate.createMarker([meeting.latitude, meeting.longitude], false, null, "", [parseInt(meeting.id_bigint)]);
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
	function nearMeSearch() {
		retrieveGeolocation().then(position => {
			showThrobber();
			crouton.searchByCoordinates(position.latitude, position.longitude, config.map_search.width);
			if (activeModal == gSearchModal) closeModalWindow(gSearchModal);
		}).catch(error => {
			console.error(error.message);
			if (activeModal != gSearchModal) showBmltSearchDialog();
		});
	};
	function clickSearch(e) {
		croutonMap.showMap(false,false);
		gDelegate.clickSearch(e, function(lat,lng) {
			showThrobber();
			crouton.searchByCoordinates(lat, lng, config.map_search.width);
		});
		closeModalWindow(gSearchModal);
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
					img.src = config.BMLTPlugin_throbber_img_src;
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
		let latlng = gDelegate.getGeocodeCenter(resp);
		if (document.getElementById("bmltsearch-goto-text"))
			document.getElementById("bmltsearch-goto-text").value = "";
		showThrobber();
		crouton.searchByCoordinates(latlng.lat, latlng.lng, config.map_search.width);
	}
	function loadAllMeetings(meetings_responseObject, fitBounds=true, fitAll=false) {
		if (meetings_responseObject === null && config.map_search) {
			if (config.map_search.auto) nearMeSearch();
			else if (config.map_search.coordinates_search) {
				showThrobber();
				config.map_search.coordinates_search = false;
				crouton.searchByCoordinates(config.map_search.latitude, config.map_search.longitude, config.map_search.width);
			}
			else if (config.map_search.location) gDelegate.callGeocoder(config.map_search.location, null, mapSearchGeocode);
			else showBmltSearchDialog();
			return;
		}
		gAllMeetings = meetings_responseObject.filter(m => m.venue_type != 2);
		if (fitBounds) {
			const lat_lngs = gAllMeetings.reduce(function(a,m) {a.push([m.latitude, m.longitude]); return a;},[]);
			gDelegate.fitBounds(lat_lngs);
		}
		searchResponseCallback();
		hideThrobber();
		if (config.filter_visible || config.centerMe || config.goto) crouton.forceShowMap();
		if (config.centerMe) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					function (position) {
						coords = {latitude: position.coords.latitude, longitude: position.coords.longitude};
						filterVisible(false);
						gDelegate.setViewToPosition(coords, filterMeetingsAndBounds, filterVisible);
					},
					showGeocodingDialog
				);
			} else if (fitAll) {
				showGeocodingDialog();
			}
		} else {
			if (!config.centerMe && !config.goto) gDelegate.afterInit(()=>filterVisible(config.filter_visible));
			if (config.goto) gDelegate.callGeocoder(config.goto, resetVisibleThenFilterMeetingsAndBounds);
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
		openModalWindow(gSearchModal);
	}
	function showSearchDialog(e) {
		if (!document.getElementById('bmltsearch_modal')) gInDiv.appendChild(gSearchModal);
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
	function resetVisibleThenFilterMeetingsAndBounds(bounds) {
		filterVisible(false);
		const ret = filterMeetingsAndBounds(bounds);
		filterVisible(true);
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
		if (!gAllMeetings) return;
		if (!gAllMeetings.length) {
			alert ( crouton.localization.getWord("no meetings found") );
			return;
		};
		try {
			drawMarkers(expand);
		} catch (e) {
			console.log(e);
			gDelegate.addListener('projection_changed', function (ev) {
				drawMarkers(expand);
			}, true);
		}
	};
	/****************************************************************************************
	 *									CREATING MARKERS									*
	 ****************************************************************************************/
	var prevUseMarkerCluster;
	function useMarkerCluster() {
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
		gDelegate.clearAllMarkers();
		gDelegate.removeClusterLayer();
		// This calculates which markers are the red "multi" markers.
		const filtered = filterMeetings(gAllMeetings);

		var overlap_map = (useMarkerCluster() || filtered.length == 1)
			? filtered.map((m)=>[m])
			: mapOverlappingMarkersInCity(filtered);

		if (useMarkerCluster()) gDelegate.createClusterLayer();
		// Draw the meeting markers.
		overlap_map.forEach(function (marker) {
			createMapMarker(marker);
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

	/************************************************************************************//**
	 *	 \brief	This creates a single meeting's marker on the map.							*
	 ****************************************************************************************/
	function createMapMarker(meetings) {
		var main_point = [meetings[0].latitude, meetings[0].longitude];
		let markerTemplate = crouton_Handlebars.compile(markerTemplateSrc);
		var marker_html = markerTemplate(meetings);
		gDelegate.createMarker(main_point,
			(meetings.length > 1),
			marker_html, null ,meetings.map((m)=>parseInt(m.id_bigint)));
	};
	var listOnlyVisible = false;
	var listener = null;
	function filterBounds(bounds) {
		return gAllMeetings.filter((meeting) => gDelegate.contains(bounds, meeting.latitude, meeting.longitude));
	}
	function showAllMeetings() {
		filterVisible(false);
		gDelegate.addListener('dragend', filterVisible, true);
	}
	function filterVisible(on=true) {
		if (on==listOnlyVisible) return on;
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
		if (on) listener = gDelegate.addListener('dragstart', showAllMeetings, true);
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
	/****************************************************************************************
	 *								MAIN FUNCTIONAL INTERFACE								*
	 ****************************************************************************************/
	this.initialize = loadFromCrouton;
	this.showMap = showMap;
	this.fillMap = filterFromCrouton;
	this.rowClick = focusOnMeeting;
	this.apiLoadedCallback = apiLoadedCallback;
	this.refreshMeetings = loadAllMeetings;

	this.openModalWindow = openModalWindow;
	this.closeModalWindow = closeModalWindow;
	this.loadPopupMap = loadPopupMap;
	this.filterVisible = filterVisible;
};
MeetingMap.prototype.initialize = null;
MeetingMap.prototype.showMap = null;
MeetingMap.prototype.fillMap = null;
MeetingMap.prototype.rowClick = null;
MeetingMap.prototype.apiLoadedCallback = null;
MeetingMap.prototype.refreshMeetings = null;

MeetingMap.prototype.openModalWindow = null;
MeetingMap.prototype.closeModalWindow = null;
MeetingMap.prototype.loadPopupMap = null;
MeetingMap.prototype.filterVisible = null;
