function MeetingMap(inConfig, inDiv, inCoords, inMeetingDetail) {
	/****************************************************************************************
	 *										CLASS VARIABLES									*
	 ****************************************************************************************/

	var gDelegate = new MapDelegate(inConfig);
	const config = inConfig;

	var gAllMeetings = null;
	var gFormatHash = null;
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
	/************************************************************************************//**
	 *	\brief Load the map and set it up.													*
	 ****************************************************************************************/

	function loadMap(handlebarMapOptions=null) {
		if (!gDelegate.isApiLoaded()) {
			preloadApiLoadedCallback(loadMap, []);
			gDelegate.loadApi();
			return;
		}
		let location = inCoords;
		if (handlebarMapOptions) {
			location = {latitude: handlebarMapOptions.lat, longitude: handlebarMapOptions.lng};
		}
		if (inDiv) {
			inDiv.myThrobber = null;

			if (gDelegate.createMap(inDiv, location)) {
				createThrobber(inDiv);
				gDelegate.addListener('zoomend', function (ev) {
					if (gAllMeetings &&
						gFormatHash) {
						searchResponseCallback();
					}
				}, false);
				showThrobber();
				var pixel_width = inDiv.offsetWidth;
				if (!inMeetingDetail) {
					gDelegate.addControl(createFilterMeetingsToggle(), 'topleft');
					gDelegate.addControl(createMenuButton(pixel_width), 'topright');
				}
			};
		};
	};
	function loadFromCrouton(inDiv_id, meetings_responseObject, formats_responseObject, handlebarMapOptions = null) {
		if (!gDelegate.isApiLoaded()) {
			preloadApiLoadedCallback(loadFromCrouton, [inDiv_id, meetings_responseObject, formats_responseObject, handlebarMapOptions]);
			gDelegate.loadApi();
			return;
		}
		inDiv = document.getElementById(inDiv_id);
		loadMap(handlebarMapOptions);
		loadAllMeetings(meetings_responseObject, formats_responseObject, 0, '', true);
		const lat_lngs = gAllMeetings.reduce(function(a,m) {a.push([m.latitude, m.longitude]); return a;},[]);
		gDelegate.fitBounds(lat_lngs);
	};
	function filterFromCrouton(filter) {
		gMeetingIdsFromCrouton = filter;
		if (gAllMeetings)
			searchResponseCallback(true);
	};
	/************************************************************************************//**
	 *	\brief 
	 ****************************************************************************************/

	function createThrobber(inDiv) {
		if (!inDiv.myThrobber) {
			inDiv.myThrobber = document.createElement("div");
			if (inDiv.myThrobber) {
				inDiv.myThrobber.id = inDiv.id + 'Throbber_div';
				inDiv.myThrobber.className = 'bmlt_mapThrobber_div';
				inDiv.myThrobber.style.display = 'none';
				inDiv.appendChild(inDiv.myThrobber);
				var img = document.createElement("img");

				if (img) {
					img.src = config.BMLTPluginThrobber_img_src;
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
		if (inDiv.myThrobber) {
			inDiv.myThrobber.style.display = 'block';
		};
	};
	function hideThrobber() {
		if (inDiv.myThrobber) {
			inDiv.myThrobber.style.display = 'none';
		};
	};
	function loadAllMeetings(meetings_responseObject, formats_responseObject, centerMe, goto, fitAll=false) {
		gAllMeetings = meetings_responseObject.filter(m => m.venue_type != 2);
		gFormatHash = createFormatHash(formats_responseObject);
		searchResponseCallback();
		if (centerMe != 0) {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					function (position) {
						coords = {latitude: position.coords.latitude, longitude: position.coords.longitude};
						gDelegate.setViewToPosition(coords, filterMeetingsAndBounds);
					},
					function () {
						showSearchDialog(null);
					}
				);
			} else if (fitAll) {
				showSearchDialog(null);
			}
		} else if (goto != '') {
			gDelegate.callGeocoder(goto, filterMeetingsAndBounds);
		}
		hideThrobber();
	}
	function createFormatHash(format_arr) {
		var ret = [];
		for (i = 0; i < format_arr.length; i++) {
			ret[format_arr[i].key_string] = format_arr[i];
		}
		return ret;
	};
	function createCityHash(allMeetings) {
		return allMeetings.reduce(function(prev, meeting) {
			if (prev.hasOwnProperty(meeting.location_municipality))
				prev[meeting.location_municipality].push(meeting);
			else
				prev[meeting.location_municipality] = [meeting];
			return prev;
		}, {});
	}
	function searchResponseCallback(expand = false) {
		if (!gAllMeetings.length) {
			alert(config.no_meetings_found);
			return;
		};
		try {
			drawMarkers(expand);
		} catch (e) {
			gDelegate.addListener('projection_changed', function (ev) {
				drawMarkers(expand);
			}, true);
		}
	};
	/****************************************************************************************
	 *									CREATING MARKERS									*
	 ****************************************************************************************/
	function drawMarkers(expand = false) {
		gDelegate.clearAllMarkers();

		// This calculates which markers are the red "multi" markers.
		const filtered = filterMeetings(gAllMeetings);
		var overlap_map = mapOverlappingMarkersInCity(filtered);

		// Draw the meeting markers.
		overlap_map.forEach(function (marker) {
			createMapMarker(marker);
		});
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
	/************************************************************************************//**
	 *	 \brief	This creates a single meeting's marker on the map.							*
	 ****************************************************************************************/
	function createMapMarker(in_mtg_obj_array	/**< A meeting object array. */) {
		var main_point = [in_mtg_obj_array[0].latitude, in_mtg_obj_array[0].longitude];
		var marker_html = '<div class="accordion">';
		var checked = ' checked';
		var marker_title = '';
		for (var c = 0; c < in_mtg_obj_array.length; c++) {
			marker_html += '<div><input type="radio" name="panel" id="panel-' + in_mtg_obj_array[c].id_bigint + '"' + checked + '>';
			if (c > 0) {
				marker_title += '; ';
			}
			var dayAndTime = getDayAndTime(in_mtg_obj_array[c]);
			marker_title += dayAndTime;
			checked = '';
			marker_html += '<label for="panel-' + in_mtg_obj_array[c].id_bigint + '">' + dayAndTime + '</label>';
			marker_html += marker_make_meeting(in_mtg_obj_array[c],false);
			marker_html += '</div>';
		}
		marker_html += '</div>';
		gDelegate.createMarker(main_point,
			(in_mtg_obj_array.length > 1),
			marker_html, marker_title,in_mtg_obj_array.map((m)=>parseInt(m.id_bigint)));
	};
	function getDayAndTime(in_meeting_obj) {
		return config.weekdays[in_meeting_obj.weekday_tinyint] + " " + formattedTime(in_meeting_obj.start_time);
	}
	function formattedTime(in_time) {
		var time = in_time.toString().split(':');
		if (config.time_format == '12') {
			var h = time[0] % 12 || 12;
			var ampm = (time[0] < 12 || time[0] === 24) ? "AM" : "PM";
			return h + ':' + time[1] + ampm;
		}
		return time[0] + ':' + time[1];
	}
	function getLangs(in_meeting_obj) {
		var ret = '';
		if (in_meeting_obj.formats && in_meeting_obj.formats.length > 0) {
			var myFormatKeys = in_meeting_obj.formats.split(',');
			for (i = 0; i < myFormatKeys.length; i++) {
				theFormat = gFormatHash[myFormatKeys[i]];
				if (typeof theFormat == 'undefined') continue;
				if (theFormat.format_type_enum == 'LANG') {
					var a = config.BMLTPlugin_images + '/../lang/' + theFormat.key_string + ".png";
					ret += ' <img src="' + a + '">';
				}
			}
		}
		return ret;
	}
	function marker_make_meeting(in_meeting_obj, listView) {
		var id = in_meeting_obj.id_bigint.toString();
		var myFormatKeys = in_meeting_obj.formats.split(',');
		var covidFormats = new Array;
		var regFormats = new Array;
		var address_class = 'active';
		var hygene_class = 'hidden';
		for (i=0; i<myFormatKeys.length; i++) {
			theFormat = gFormatHash[myFormatKeys[i]];
			if (typeof theFormat == 'undefined') continue;
			if (theFormat.format_type_enum=='FC2' || theFormat.format_type_enum=='FC3' || theFormat.format_type_enum=='Covid' || 
				((typeof theFormat.format_type_enum!=='undefined')&&theFormat.format_type_enum.charAt(0)=='O')) {
				regFormats.push(theFormat);
			}
			else if (theFormat.format_type_enum=='xCovidx') {
				covidFormats.push(theFormat);
				address_class = listView ? 'active' : 'hidden';
				hygene_class = 'active';
			} 
		}
		var ret = '<div class="marker_div_meeting" id="' + id + '">';
		ret += '<h4>' + in_meeting_obj.meeting_name.toString() + getLangs(in_meeting_obj) + '</h4>';
		var address_id = "meeting_address_" + id;
		var hygene_id = "meeting_hygene_" + id;


		ret += '<div id="' + address_id + '" class="'+address_class+'">';
		if (in_meeting_obj.comments) {
			ret += '<em>' + in_meeting_obj.comments + '</em>';
		}

		if (in_meeting_obj.location_text) {
			ret += '<div class="marker_div_location_text">' + in_meeting_obj.location_text.toString() + '</div>';
		};

		var location = '';
		if (in_meeting_obj.location_street) {
			location = in_meeting_obj.location_street.toString();
		};

		if (in_meeting_obj.location_municipality) {
			location += ', ' + in_meeting_obj.location_municipality.toString();

			if (in_meeting_obj.location_city_subsection) {
				location += ' ' + in_meeting_obj.location_city_subsection + ', ';
			}
		};
		if (location.length > 0) {
			ret += '<div class="marker_div_location_address">' + location + "</div>";
		}
		if (in_meeting_obj.location_info) {
			ret += '<div class="marker_div_location_info">' + in_meeting_obj.location_info.toString() + '</div>';
		};
		if (config.meeting_details_href.length) {
			ret += '<div class="marker_div_location_maplink"><a href="';
			ret += config.meeting_details_href + '?meeting-id=' + in_meeting_obj.id_bigint;
			ret += '" target="_blank">' + config.more_info_text + '</a>';
			ret += '</div>';
		} else {
			ret += '<div class="marker_div_location_maplink"><a href="';
			ret += 'https://www.google.com/maps/dir/?api=1&destination='
				+ encodeURIComponent(in_meeting_obj.latitude.toString()) + ',' + encodeURIComponent(in_meeting_obj.longitude.toString());
			ret += '" rel="external" target="_blank">' + config.map_link_text + '</a>';
			ret += '</div>';
		}
		if (regFormats.length > 0) {
			ret += '<div class="marker_div_formats">';
			regFormats.forEach(function(format) {
				ret += format['name_string'] + '; ';
			});
			ret += '</div>';
		};
		if (covidFormats.length > 0 && !listView) {
			ret += '<button class="hygene-button" onClick=\'exchange("' + address_id + '", "' + hygene_id + '")\'>' + config.hygene_button + '</button>';
		}
		ret += '</div>';
		if (covidFormats.length > 0) {
			ret += '<div id="' + hygene_id + '" class="'+hygene_class+'">';
			ret += '<div class="bmlt-hygene-header">' + config.hygene_header + '</div>';
			ret += '<div class="bmlt-hygene-descr">';
			covidFormats.forEach(function(format) {
				ret += format['description_string'] + '; ';
			});
			ret += '</div>';
			if (!listView)
				ret += '<button class="hygene-button" onClick=\'exchange("' + hygene_id + '", "' + address_id + '")\'>' + config.hygene_back + '</button>';
			ret += '</div>';
		}
		ret += '</div>';


		return ret;
	};
	function filterBounds(bounds) {
		var ret = new Array;
		gAllMeetings.forEach(function (meeting) {
			if (gDelegate.contains(bounds, meeting.latitude, meeting.longitude)) {
				ret.push(meeting);
			}
		});
		return ret;
	}
	function filterVisible() {
		return filterBounds(gDelegate.getBounds());
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
	var g_suspendedFullscreen = false;
	function closeModalWindow(modal) {
		modal.style.display = "none";
		if (g_suspendedFullscreen) {
			g_suspendedFullscreen = false;
			if (!isFullscreen()) {
				toggleFullscreen();
			}
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
	function meetingTimes(meeting) {
		var duration = meeting.duration_time.split(':');
		var minutes = parseInt(duration[0]) * 60;
		if (duration.length > 1)
			minutes += parseInt(duration[1]);
		var startDate = new Date(new Date().toDateString() + ' ' + meeting.start_time);
		var endDate = new Date(startDate.getTime() + minutes * 60000);
		var startTimeSplit = meeting.start_time.split(':');
		var startTime = formattedTime(meeting.start_time);
		var endTime = '' + endDate.getHours() + ':';
		if (endDate.getMinutes() == 0) {
			endTime += '00';
		} else if (endDate.getMinutes() < 10) {
			endTime += '0' + endDate.getMinutes();
		} else {
			endTime += endDate.getMinutes();
		}
		endTime = formattedTime(endTime);
		return startTime + "&nbsp;-&nbsp;" + endTime;
	}
	function meetingDayAndTimes(meeting) {
		return config.weekdays[meeting.weekday_tinyint] + ' ' + meetingTimes(meeting);
	}
	var _isPseudoFullscreen = false;
	function isFullscreen() {
		var fullscreenElement =
			document.fullscreenElement ||
			document.mozFullScreenElement ||
			document.webkitFullscreenElement ||
			document.msFullscreenElement;

		return (fullscreenElement === inDiv) || _isPseudoFullscreen;
	}
	function toggleFullscreen(options) {
		var container = inDiv;
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
		var container = inDiv;
		if (fullscreen) {
			L.DomUtil.addClass(container, 'leaflet-pseudo-fullscreen');
		} else {
			L.DomUtil.removeClass(container, 'leaflet-pseudo-fullscreen');
		}
		gDelegate.invalidateSize();
	}
	var _firstShow = true;
	function showMap() {
		if (!_firstShow) return;
		//_firstShow = false;
		gDelegate.invalidateSize();
		gDelegate.fitBounds(
			((gMeetingIdsFromCrouton) ? gAllMeetings.filter((m) => gMeetingIdsFromCrouton.includes(m.id_bigint)) : gAllMeetings)
				.reduce(function(a,m) {a.push([m.latitude, m.longitude]); return a;},[])
		);
	}
	/****************************************************************************************
	 *								MAIN FUNCTIONAL INTERFACE								*
	 ****************************************************************************************/
	if (inDiv && inCoords) {
		if (!inMeetingDetail) loadMap();
		this.getMeetingsExt = getMeetings;
		this.openTableViewExt = openTableView;
	};
	this.initialize = loadFromCrouton;
	this.showMap = showMap;
	this.fillMap = filterFromCrouton;
	this.rowClick = focusOnMeeting;
	this.apiLoadedCallback = apiLoadedCallback;
	this.filterVisibleExt = filterVisible;
};
MeetingMap.prototype.getMeetingsExt = null;
MeetingMap.prototype.openTableViewExt = null;
MeetingMap.prototype.initialize = null;
MeetingMap.prototype.showMap = null;
MeetingMap.prototype.fillMap = null;
MeetingMap.prototype.rowClick = null;
MeetingMap.prototype.apiLoadedCallback = null;
MeetingMap.prototype.filterVisibleExt = null;
