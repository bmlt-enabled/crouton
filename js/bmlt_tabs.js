var dayOfTheWeek = {1:"Sunday",2:"Monday",3:"Tuesday",4:"Wednesday",5:"Thursday",6:"Friday",7:"Saturday"};
jQuery(document).ready(function($) {
	var dropdownConfiguration = [
		{
			placeholder: "Cities",
			dropdownAutoWidth: true,
			dropdownMaxWidth: '100px',
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		},
		{
			placeholder: "Groups",
			dropdownAutoWidth: true,
			dropdownMaxWidth: '100px',
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		},
		{
			placeholder: "Locations",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		},
		{
			placeholder: "Zips",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop-zip'
		},
		{
			placeholder: "Formats",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop-format'
		},
		{
			placeholder: "Counties",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		},
		{
			placeholder: "Areas",
			dropdownAutoWidth: true,
			allowClear: false,
			width: "resolve",
			minimumResultsForSearch: 1,
			dropdownCssClass : 'bmlt-drop'
		}
	];
	for (var a = 2; a <= dropdownConfiguration.length + 1; a++) {
		-$("#e" + a).select2(dropdownConfiguration[a - 2]);
	}
	$('[data-toggle="popover"]').popover();
	$('html').on('click', function (e) {
		if ($(e.target).data('toggle') !== 'popover') { 
			$('[data-toggle="popover"]').popover('hide');
		}
	});
	$('.nav-tabs a').on('click', function (e) {
		e.preventDefault();
		$(this).tab('show');
	});
    var d = new Date();
    var n = d.getDay();
	n = n + 1;
	$('.nav-tabs a[href="#tab' + n + '"]').tab('show');
	$('#tab' + n).show();
	if(jQuery.browser.mobile) {
		$("#e2").prop("readonly", true);
		$(".select2-search").css({"display":"none"});
		$(".select2-search").remove();
		for (var j = 2; j <= dropdownConfiguration.length + 1; j++) {
			$("#s2id_e" + j).css({"width":"99%","margin-bottom":"3px"});
		}
		$(".bmlt-tabs .bmlt-button-weekdays").css({"width":"98%","margin-bottom":"3px"});
		$(".bmlt-tabs .bmlt-button-cities").css({"width":"98%","margin-bottom":"3px"});
	}
	for (var a = 2; a <= dropdownConfiguration.length + 1; a++) {
		$("#e" + a).on('select2:select', function (e) {
			for (var j = 2; j <= dropdownConfiguration.length + 1; j++) {
				if (this.id !== "e" + j) {
					if ($("#e" + j).length) {
						$("#e" + j).select2("val", null);
					}
				}
			}
			if (jQuery.browser.mobile) {
				$("#" + this.id).prop("readonly", true);
				$(".select2-search").css({"display": "none"});
				$(".select2-search").remove();
			}
			var val = $("#" + this.id).val();
			$('.bmlt-page').each(function (index) {
				hidePage("#" + this.id);
				lowlightButton("#city");
				lowlightButton("#day");
				filteredPage("#byday", e.target.getAttribute("data-placeholder").toLowerCase(), val.replace("a-", ""));
				return;
			});
		});
	}
    $("#day").on('click', function() {
		for (var a = 2; a <= dropdownConfiguration.length + 1; a++) {
			if ( $("#e" + a).length ) { $("#e" + a).select2("val", null); }
		}
		highlightButton("#day");
		lowlightButton("#city");
        $('.bmlt-page').each(function(index) {
			hidePage("#" + this.id);
			showPage("#days");
			showPage("#nav-days");
			showPage("#tabs-content");
			return;
        });
    });
    $("#city").on('click', function() {
		for (var a = 2; a <= dropdownConfiguration.length + 1; a++) {
			if ( $("#e" + a).length ) { $("#e" + a).select2("val", null); }
		}

		highlightButton("#city");
		lowlightButton("#day");
        $('.bmlt-page').each(function(index) {
			hidePage("#" + this.id);
			showPage("#cities");
            return;
        });
    });
    $('.custom-ul').on('click', 'a', function(event) {
        $('.bmlt-page').each(function(index) {
        	hidePage("#" + this.id);
			showPage("#" + event.target.id);
            return;
        });
    });

    function lowlightButton(id) {
		$(id).css({"background-color":"#93C3CD","color":"#000"});
	}

    function highlightButton(id) {
		$(id).css({"background-color":"#DB4865","color":"#FFF"});
	}

    function showPage(id) {
        $(id).removeClass("hide").addClass("show");
    }

    function hidePage(id) {
		$(id).removeClass("show").addClass("hide");
	}

    function filteredPage(id, dataType, dataValue) {
		showPage(id);
		$(".bmlt-data-row").removeClass("hide");
		$(".bmlt-data-row[data-" + dataType + "!='" + dataValue + "']").addClass("hide");
	}

	showPage(".bmlt-header");
    showPage(".bmlt-tabs");
});

function getUniqueValuesOfKey(array, key){
	return array.reduce(function(carry, item){
		if(item[key] && !~carry.indexOf(item[key])) carry.push(item[key]);
		return carry;
	}, []);
}

function getDay(day_id) {
	return dayOfTheWeek[day_id];
}

function getMeetings(meetingData, filter) {
	var meetings = [];
	for (var m = 0; m < meetingData.length; m++) {
		if (filter(meetingData[m])) {
			meetingData[m]['formatted_day'] = getDay(meetingData[m]['weekday_tinyint']);
			meetingData[m]['formatted_comments'] =
				meetingData[m]['comments'] != null
					? meetingData[m]['comments'].replace('/(http|https):\/\/([A-Za-z0-9\._\-\/\?=&;%,]+)/i', '<a style="text-decoration: underline;" href="$1://$2" target="_blank">$1://$2</a>')
					: "";
			var duration = meetingData[m]['duration_time'].split(":");
			meetingData[m]['start_time_formatted'] =
				moment(meetingData[m]['start_time'], "HH:mm:ss")
					.format("h:mm a");
			meetingData[m]['end_time_formatted']
				= moment(meetingData[m]['start_time'], "HH:mm:ss")
				.add(duration[0], 'hours')
				.add(duration[1], 'minutes')
				.format("h:mm a");

			var formats = meetingData[m]['formats'];
			var formats_expanded = [];
			for (var f = 0; f < formats.length; f++) {
				for (var g = 0; g < formatsData.length; g++) {
					if (formats[f] === formatsData[g]['key_string']) {
						formats_expanded.push(
							{
								"key": formats[f],
								"name": formatsData[g]['name_string'],
								"description": formatsData[g]['description_string']
							}
						)
					}
				}
			}
			meetingData[m]['formats_expanded'] = formats_expanded;
			var addressParts = [
				meetingData[m]['location_street'],
				meetingData[m]['location_municipality'].trim(),
				meetingData[m]['location_province'].trim(),
				meetingData[m]['location_postal_code_1'].trim()
			];
			meetingData[m]['formatted_address'] = addressParts.join(", ");
			meetingData[m]['formatted_location_info'] =
				meetingData[m]['location_info'] != null
					? meetingData[m]['location_info'].replace('/(http|https):\/\/([A-Za-z0-9\._\-\/\?=&;%,]+)/i', '<a style="text-decoration: underline;" href="$1://$2" target="_blank">$1://$2</a>')
					: "";
			meetings.push(meetingData[m])
		}
	}

	return meetings;
}

function renderView(templateElement, selector, context) {
	var source   = document.getElementById(templateElement).innerHTML;
	var template = Handlebars.compile(source);
	jQuery(selector).append(template(context));
}

Handlebars.registerHelper('formatDataPointer', function(str) {
	return str.toLowerCase().replace(/\W|_/g, "-");
});

// http://spin.js.org/#v2.3.2
!function(a,b){"object"==typeof module&&module.exports?module.exports=b():"function"==typeof define&&define.amd?define(b):a.Spinner=b()}(this,function(){"use strict";function a(a,b){var c,d=document.createElement(a||"div");for(c in b)d[c]=b[c];return d}function b(a){for(var b=1,c=arguments.length;c>b;b++)a.appendChild(arguments[b]);return a}function c(a,b,c,d){var e=["opacity",b,~~(100*a),c,d].join("-"),f=.01+c/d*100,g=Math.max(1-(1-a)/b*(100-f),a),h=j.substring(0,j.indexOf("Animation")).toLowerCase(),i=h&&"-"+h+"-"||"";return m[e]||(k.insertRule("@"+i+"keyframes "+e+"{0%{opacity:"+g+"}"+f+"%{opacity:"+a+"}"+(f+.01)+"%{opacity:1}"+(f+b)%100+"%{opacity:"+a+"}100%{opacity:"+g+"}}",k.cssRules.length),m[e]=1),e}function d(a,b){var c,d,e=a.style;if(b=b.charAt(0).toUpperCase()+b.slice(1),void 0!==e[b])return b;for(d=0;d<l.length;d++)if(c=l[d]+b,void 0!==e[c])return c}function e(a,b){for(var c in b)a.style[d(a,c)||c]=b[c];return a}function f(a){for(var b=1;b<arguments.length;b++){var c=arguments[b];for(var d in c)void 0===a[d]&&(a[d]=c[d])}return a}function g(a,b){return"string"==typeof a?a:a[b%a.length]}function h(a){this.opts=f(a||{},h.defaults,n)}function i(){function c(b,c){return a("<"+b+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',c)}k.addRule(".spin-vml","behavior:url(#default#VML)"),h.prototype.lines=function(a,d){function f(){return e(c("group",{coordsize:k+" "+k,coordorigin:-j+" "+-j}),{width:k,height:k})}function h(a,h,i){b(m,b(e(f(),{rotation:360/d.lines*a+"deg",left:~~h}),b(e(c("roundrect",{arcsize:d.corners}),{width:j,height:d.scale*d.width,left:d.scale*d.radius,top:-d.scale*d.width>>1,filter:i}),c("fill",{color:g(d.color,a),opacity:d.opacity}),c("stroke",{opacity:0}))))}var i,j=d.scale*(d.length+d.width),k=2*d.scale*j,l=-(d.width+d.length)*d.scale*2+"px",m=e(f(),{position:"absolute",top:l,left:l});if(d.shadow)for(i=1;i<=d.lines;i++)h(i,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(i=1;i<=d.lines;i++)h(i);return b(a,m)},h.prototype.opacity=function(a,b,c,d){var e=a.firstChild;d=d.shadow&&d.lines||0,e&&b+d<e.childNodes.length&&(e=e.childNodes[b+d],e=e&&e.firstChild,e=e&&e.firstChild,e&&(e.opacity=c))}}var j,k,l=["webkit","Moz","ms","O"],m={},n={lines:12,length:7,width:5,radius:10,scale:1,corners:1,color:"#000",opacity:.25,rotate:0,direction:1,speed:1,trail:100,fps:20,zIndex:2e9,className:"spinner",top:"50%",left:"50%",shadow:!1,hwaccel:!1,position:"absolute"};if(h.defaults={},f(h.prototype,{spin:function(b){this.stop();var c=this,d=c.opts,f=c.el=a(null,{className:d.className});if(e(f,{position:d.position,width:0,zIndex:d.zIndex,left:d.left,top:d.top}),b&&b.insertBefore(f,b.firstChild||null),f.setAttribute("role","progressbar"),c.lines(f,c.opts),!j){var g,h=0,i=(d.lines-1)*(1-d.direction)/2,k=d.fps,l=k/d.speed,m=(1-d.opacity)/(l*d.trail/100),n=l/d.lines;!function o(){h++;for(var a=0;a<d.lines;a++)g=Math.max(1-(h+(d.lines-a)*n)%l*m,d.opacity),c.opacity(f,a*d.direction+i,g,d);c.timeout=c.el&&setTimeout(o,~~(1e3/k))}()}return c},stop:function(){var a=this.el;return a&&(clearTimeout(this.timeout),a.parentNode&&a.parentNode.removeChild(a),this.el=void 0),this},lines:function(d,f){function h(b,c){return e(a(),{position:"absolute",width:f.scale*(f.length+f.width)+"px",height:f.scale*f.width+"px",background:b,boxShadow:c,transformOrigin:"left",transform:"rotate("+~~(360/f.lines*k+f.rotate)+"deg) translate("+f.scale*f.radius+"px,0)",borderRadius:(f.corners*f.scale*f.width>>1)+"px"})}for(var i,k=0,l=(f.lines-1)*(1-f.direction)/2;k<f.lines;k++)i=e(a(),{position:"absolute",top:1+~(f.scale*f.width/2)+"px",transform:f.hwaccel?"translate3d(0,0,0)":"",opacity:f.opacity,animation:j&&c(f.opacity,f.trail,l+k*f.direction,f.lines)+" "+1/f.speed+"s linear infinite"}),f.shadow&&b(i,e(h("#000","0 0 4px #000"),{top:"2px"})),b(d,b(i,h(g(f.color,k),"0 0 1px rgba(0,0,0,.1)")));return d},opacity:function(a,b,c){b<a.childNodes.length&&(a.childNodes[b].style.opacity=c)}}),"undefined"!=typeof document){k=function(){var c=a("style",{type:"text/css"});return b(document.getElementsByTagName("head")[0],c),c.sheet||c.styleSheet}();var o=e(a("group"),{behavior:"url(#default#VML)"});!d(o,"transform")&&o.adj?i():j=d(o,"animation")}return h});
