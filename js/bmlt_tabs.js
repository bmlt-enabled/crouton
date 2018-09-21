jQuery(document).ready(function($) {

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
	$("#e2").select2({
		placeholder: "Cities",
		dropdownAutoWidth: true,
		dropdownMaxWidth: '100px',
		allowClear: false,
		width: "resolve",
		minimumResultsForSearch: 1
	});
	$("#e3").select2({
		placeholder: "Groups",
		dropdownAutoWidth: true,
		dropdownMaxWidth: '100px',
		allowClear: false,
		width: "resolve",
		minimumResultsForSearch: 1
	});
	$("#e4").select2({
		placeholder: "Locations",
		dropdownAutoWidth: true,
		allowClear: false,
		width: "resolve",
		minimumResultsForSearch: 1
	});
	$("#e5").select2({
		placeholder: "Zips",
		dropdownAutoWidth: true,
		allowClear: false,
		width: "resolve",
		minimumResultsForSearch: 1
	});
	$("#e6").select2({
		placeholder: "Formats",
		dropdownAutoWidth: true,
		allowClear: false,
		width: "resolve",
		minimumResultsForSearch: 1
	});
	$("#e7").select2({
		placeholder: "Counties",
		dropdownAutoWidth: true,
		allowClear: false,
		width: "resolve",
		minimumResultsForSearch: 1
	});
	$("#e8").select2({
		placeholder: "Areas",
		dropdownAutoWidth: true,
		allowClear: false,
		width: "resolve",
		minimumResultsForSearch: 1
	});
	$("#e2").select2({dropdownCssClass : 'bmlt-drop'}); 
	$("#e3").select2({dropdownCssClass : 'bmlt-drop'}); 
	$("#e4").select2({dropdownCssClass : 'bmlt-drop'}); 
	$("#e5").select2({dropdownCssClass : 'bmlt-drop-zip'}); 
	$("#e6").select2({dropdownCssClass : 'bmlt-drop-format'}); 
	$("#e7").select2({dropdownCssClass : 'bmlt-drop'});
	$("#e8").select2({dropdownCssClass : 'bmlt-drop'}); 
	if(jQuery.browser.mobile)
	{
		$("#e2").prop("readonly",true);
		$(".select2-search").css({"display":"none"});
		$(".select2-search").remove();
		$("#s2id_e2").css({"width":"99%","margin-bottom":"3px"});
		$("#s2id_e3").css({"width":"99%","margin-bottom":"3px"});
		$("#s2id_e4").css({"width":"99%","margin-bottom":"3px"});
		$("#s2id_e5").css({"width":"99%","margin-bottom":"3px"});
		$("#s2id_e6").css({"width":"99%","margin-bottom":"3px"});
		$("#s2id_e7").css({"width":"99%","margin-bottom":"3px"});
		$("#s2id_e8").css({"width":"99%","margin-bottom":"3px"});
		$(".bmlt-tabs .bmlt-button-weekdays").css({"width":"98%","margin-bottom":"3px"});
		$(".bmlt-tabs .bmlt-button-cities").css({"width":"98%","margin-bottom":"3px"});
	}
    $("#e2").on('select2:select', function(e) {
		if ( $( "#e3" ).length ) { $("#e3").select2("val", null); }
		if ( $( "#e4" ).length ) { $("#e4").select2("val", null); }
		if ( $( "#e5" ).length ) { $("#e5").select2("val", null); }
		if ( $( "#e6" ).length ) { $("#e6").select2("val", null); }
		if ( $( "#e7" ).length ) { $("#e7").select2("val", null); }
		if ( $( "#e8" ).length ) { $("#e8").select2("val", null); }
		if(jQuery.browser.mobile)
		{
			$("#e2").prop("readonly",true);
			$(".select2-search").css({"display":"none"});
			$(".select2-search").remove();
		}
        var val = $("#e2").val();
        $('.bmlt-page').each(function(index) {
			$("#" + this.id).removeClass("show").addClass("hide");
			$("#city").css({"background-color":"#93c3cd","color":"#000"});
			$("#day").css({"background-color":"#93c3cd","color":"#000"});
			showPage(val);
			return;
        });
    });
    $("#e3").on('select2:select', function(e) {
		if ( $( "#e2" ).length ) { $("#e2").select2("val", null); }
		if ( $( "#e4" ).length ) { $("#e4").select2("val", null); }
		if ( $( "#e5" ).length ) { $("#e5").select2("val", null); }
		if ( $( "#e6" ).length ) { $("#e6").select2("val", null); }
		if ( $( "#e7" ).length ) { $("#e7").select2("val", null); }
		if ( $( "#e8" ).length ) { $("#e8").select2("val", null); }
        var val = $("#e3").val();
        $('.bmlt-page').each(function(index) {
			$("#" + this.id).removeClass("show").addClass("hide");
			$("#city").css({"background-color":"#93c3cd","color":"#000"});
			$("#day").css({"background-color":"#93c3cd","color":"#000"});
			showPage(val);
			return;
        });
    });
    $("#e4").on('select2:select', function() {
		if ( $( "#e2" ).length ) { $("#e2").select2("val", null); }
		if ( $( "#e3" ).length ) { $("#e3").select2("val", null); }
		if ( $( "#e5" ).length ) { $("#e5").select2("val", null); }
		if ( $( "#e6" ).length ) { $("#e6").select2("val", null); }
		if ( $( "#e7" ).length ) { $("#e7").select2("val", null); }
		if ( $( "#e8" ).length ) { $("#e8").select2("val", null); }
        var val = $("#e4").val();
        $('.bmlt-page').each(function(index) {
			$("#" + this.id).removeClass("show").addClass("hide");
			$("#city").css({"background-color":"#93c3cd","color":"#000"});
			$("#day").css({"background-color":"#93c3cd","color":"#000"});
			showPage(val);
			return;
        });
    });
    $("#e5").on('select2:select', function() {
		if ( $( "#e2" ).length ) { $("#e2").select2("val", null); }
		if ( $( "#e3" ).length ) { $("#e3").select2("val", null); }
		if ( $( "#e4" ).length ) { $("#e4").select2("val", null); }
		if ( $( "#e6" ).length ) { $("#e6").select2("val", null); }
		if ( $( "#e7" ).length ) { $("#e7").select2("val", null); }
		if ( $( "#e8" ).length ) { $("#e8").select2("val", null); }
        var val = $("#e5").val();
        $('.bmlt-page').each(function(index) {
			$("#" + this.id).removeClass("show").addClass("hide");
			$("#city").css({"background-color":"#93c3cd","color":"#000"});
			$("#day").css({"background-color":"#93c3cd","color":"#000"});
			showPage(val);
			return;
        });
    });
    $("#e6").on('select2:select', function() {
		if ( $( "#e2" ).length ) { $("#e2").select2("val", null); }
		if ( $( "#e3" ).length ) { $("#e3").select2("val", null); }
		if ( $( "#e4" ).length ) { $("#e4").select2("val", null); }
		if ( $( "#e5" ).length ) { $("#e5").select2("val", null); }
		if ( $( "#e7" ).length ) { $("#e7").select2("val", null); }
		if ( $( "#e8" ).length ) { $("#e8").select2("val", null); }
        var val = $("#e6").val();
        $('.bmlt-page').each(function(index) {
			$("#" + this.id).removeClass("show").addClass("hide");
			$("#city").css({"background-color":"#93c3cd","color":"#000"});
			$("#day").css({"background-color":"#93c3cd","color":"#000"});
			showPage(val);
			return;
        });
    });
    $("#e7").on('select2:select', function() {
		if ( $( "#e2" ).length ) { $("#e2").select2("val", null); }
		if ( $( "#e3" ).length ) { $("#e3").select2("val", null); }
		if ( $( "#e4" ).length ) { $("#e4").select2("val", null); }
		if ( $( "#e5" ).length ) { $("#e5").select2("val", null); }
		if ( $( "#e6" ).length ) { $("#e6").select2("val", null); }
		if ( $( "#e8" ).length ) { $("#e8").select2("val", null); }
        var val = $("#e7").val();
        $('.bmlt-page').each(function(index) {
			$("#" + this.id).removeClass("show").addClass("hide");
			$("#city").css({"background-color":"#93c3cd","color":"#000"});
			$("#day").css({"background-color":"#93c3cd","color":"#000"});
			showPage(val);
			return;
        });
    });
    $("#e8").on('select2:select', function() {
		if ( $( "#e2" ).length ) { $("#e2").select2("val", null); }
		if ( $( "#e3" ).length ) { $("#e3").select2("val", null); }
		if ( $( "#e4" ).length ) { $("#e4").select2("val", null); }
		if ( $( "#e5" ).length ) { $("#e5").select2("val", null); }
		if ( $( "#e6" ).length ) { $("#e6").select2("val", null); }
		if ( $( "#e7" ).length ) { $("#e7").select2("val", null); }
        var val = $("#e8").val();
        $('.bmlt-page').each(function(index) {
			$("#" + this.id).removeClass("show").addClass("hide");
			$("#city").css({"background-color":"#93c3cd","color":"#000"});
			$("#day").css({"background-color":"#93c3cd","color":"#000"});
			showPage(val);
			return;
        });
    });
    $("#day").on('click', function() {
		if ( $( "#e2" ).length ) { $("#e2").select2("val", null); }
		if ( $( "#e3" ).length ) { $("#e3").select2("val", null); }
		if ( $( "#e4" ).length ) { $("#e4").select2("val", null); }
		if ( $( "#e5" ).length ) { $("#e5").select2("val", null); }
		if ( $( "#e6" ).length ) { $("#e6").select2("val", null); }
		if ( $( "#e7" ).length ) { $("#e7").select2("val", null); }
		if ( $( "#e8" ).length ) { $("#e8").select2("val", null); }
		$("#day").css({"background-color":"#DB4865","color":"#fff"});
		$("#city").css({"background-color":"#93c3cd","color":"#000"});
        $('.bmlt-page').each(function(index) {
			$("#" + this.id).removeClass("show").addClass("hide");
			showPage("days");
			showPage("nav-days");
			showPage("tabs-content");
			return;
        });
    });
    $("#city").on('click', function() {
		if ( $( "#e2" ).length ) { $("#e2").select2("val", null); }
		if ( $( "#e3" ).length ) { $("#e3").select2("val", null); }
		if ( $( "#e4" ).length ) { $("#e4").select2("val", null); }
		if ( $( "#e5" ).length ) { $("#e5").select2("val", null); }
		if ( $( "#e6" ).length ) { $("#e6").select2("val", null); }
		if ( $( "#e7" ).length ) { $("#e7").select2("val", null); }
		if ( $( "#e8" ).length ) { $("#e8").select2("val", null); }
		$("#city").css({"background-color":"#DB4865","color":"#fff"});
		$("#day").css({"background-color":"#93c3cd","color":"#000"});
        $('.bmlt-page').each(function(index) {
			$("#" + this.id).removeClass("show").addClass("hide");
			showPage("cities");
            return;
        });
    });
    $('.custom-ul').on('click', 'a', function(event) {
        $('.bmlt-page').each(function(index) {
			$("#" + this.id).removeClass("show").addClass("hide");
			showPage(event.target.id);
            return;
        });
    });
    // show the selected page
    function showPage(thisTarget) {
        $("#" + thisTarget).removeClass("hide").addClass("show");
    }
	$(".bmlt-header").removeClass("hide").addClass("show");
    $(".bmlt-tabs").removeClass("hide").addClass("show");			

});

/*! Tablesaw - v2.0.2 - 2015-10-28
* https://github.com/filamentgroup/tablesaw
* Copyright (c) 2015 Filament Group; Licensed  */
;(function( $ ) {

	// DOM-ready auto-init of plugins.
	// Many plugins bind to an "enhance" event to init themselves on dom ready, or when new markup is inserted into the DOM
	$( function(){
		$( document ).trigger( "enhance.tablesaw" );
	});

})( jQuery );

/*! Tablesaw - v2.0.2 - 2015-10-28
* https://github.com/filamentgroup/tablesaw
* Copyright (c) 2015 Filament Group; Licensed  */
/*
* tablesaw: A set of plugins for responsive tables
* Stack and Column Toggle tables
* Copyright (c) 2013 Filament Group, Inc.
* MIT License
*/

if( typeof Tablesaw === "undefined" ) {
	Tablesaw = {
		i18n: {
			modes: [ 'Stack', 'Swipe', 'Toggle' ],
			columns: 'Col<span class=\"a11y-sm\">umn</span>s',
			columnBtnText: 'Columns',
			columnsDialogError: 'No eligible columns.',
			sort: 'Sort'
		},
		// cut the mustard
		mustard: 'querySelector' in document &&
			( !window.blackberry || window.WebKitPoint ) &&
			!window.operamini
	};
}
if( !Tablesaw.config ) {
	Tablesaw.config = {};
}
if( Tablesaw.mustard ) {
	jQuery( document.documentElement ).addClass( 'tablesaw-enhanced' );
}

;(function( $ ) {
	var pluginName = "table",
		classes = {
			toolbar: "tablesaw-bar"
		},
		events = {
			create: "tablesawcreate",
			destroy: "tablesawdestroy",
			refresh: "tablesawrefresh"
		},
		defaultMode = "stack",
		initSelector = "table[data-tablesaw-mode],table[data-tablesaw-sortable]";

	var Table = function( element ) {
		if( !element ) {
			throw new Error( "Tablesaw requires an element." );
		}

		this.table = element;
		this.$table = $( element );

		this.mode = this.$table.attr( "data-tablesaw-mode" ) || defaultMode;

		this.init();
	};

	Table.prototype.init = function() {
		// assign an id if there is none
		if ( !this.$table.attr( "id" ) ) {
			this.$table.attr( "id", pluginName + "-" + Math.round( Math.random() * 10000 ) );
		}

		this.createToolbar();

		var colstart = this._initCells();

		this.$table.trigger( events.create, [ this, colstart ] );
	};

	Table.prototype._initCells = function() {
		var colstart,
			thrs = this.table.querySelectorAll( "thead tr" ),
			self = this;

		$( thrs ).each( function(){
			var coltally = 0;

			$( this ).children().each( function(){
				var span = parseInt( this.getAttribute( "colspan" ), 10 ),
					sel = ":nth-child(" + ( coltally + 1 ) + ")";

				colstart = coltally + 1;

				if( span ){
					for( var k = 0; k < span - 1; k++ ){
						coltally++;
						sel += ", :nth-child(" + ( coltally + 1 ) + ")";
					}
				}

				// Store "cells" data on header as a reference to all cells in the same column as this TH
				this.cells = self.$table.find("tr").not( thrs[0] ).not( this ).children().filter( sel );
				coltally++;
			});
		});

		return colstart;
	};

	Table.prototype.refresh = function() {
		this._initCells();

		this.$table.trigger( events.refresh );
	};

	Table.prototype.createToolbar = function() {
		// Insert the toolbar
		// TODO move this into a separate component
		var $toolbar = this.$table.prev().filter( '.' + classes.toolbar );
		if( !$toolbar.length ) {
			$toolbar = $( '<div>' )
				.addClass( classes.toolbar )
				.insertBefore( this.$table );
		}
		this.$toolbar = $toolbar;

		if( this.mode ) {
			this.$toolbar.addClass( 'mode-' + this.mode );
		}
	};

	Table.prototype.destroy = function() {
		// Don�t remove the toolbar. Some of the table features are not yet destroy-friendly.
		this.$table.prev().filter( '.' + classes.toolbar ).each(function() {
			this.className = this.className.replace( /\bmode\-\w*\b/gi, '' );
		});

		var tableId = this.$table.attr( 'id' );
		$( document ).unbind( "." + tableId );
		$( window ).unbind( "." + tableId );

		// other plugins
		this.$table.trigger( events.destroy, [ this ] );

		this.$table.removeAttr( 'data-tablesaw-mode' );

		this.$table.removeData( pluginName );
	};

	// Collection method.
	$.fn[ pluginName ] = function() {
		return this.each( function() {
			var $t = $( this );

			if( $t.data( pluginName ) ){
				return;
			}

			var table = new Table( this );
			$t.data( pluginName, table );
		});
	};

	$( document ).on( "enhance.tablesaw", function( e ) {
		// Cut the mustard
		if( Tablesaw.mustard ) {
			$( e.target ).find( initSelector )[ pluginName ]();
		}
	});

}( jQuery ));

;(function( win, $, undefined ){

	var classes = {
		stackTable: 'tablesaw-stack',
		cellLabels: 'tablesaw-cell-label',
		cellContentLabels: 'tablesaw-cell-content'
	};

	var data = {
		obj: 'tablesaw-stack'
	};

	var attrs = {
		labelless: 'data-tablesaw-no-labels',
		hideempty: 'data-tablesaw-hide-empty'
	};

	var Stack = function( element ) {

		this.$table = $( element );

		this.labelless = this.$table.is( '[' + attrs.labelless + ']' );
		this.hideempty = this.$table.is( '[' + attrs.hideempty + ']' );

		if( !this.labelless ) {
			// allHeaders references headers, plus all THs in the thead, which may include several rows, or not
			this.allHeaders = this.$table.find( "th" );
		}

		this.$table.data( data.obj, this );
	};

	Stack.prototype.init = function( colstart ) {
		this.$table.addClass( classes.stackTable );

		if( this.labelless ) {
			return;
		}

		// get headers in reverse order so that top-level headers are appended last
		var reverseHeaders = $( this.allHeaders );
		var hideempty = this.hideempty;
		
		// create the hide/show toggles
		reverseHeaders.each(function(){
			var $t = $( this ),
				$cells = $( this.cells ).filter(function() {
					return !$( this ).parent().is( "[" + attrs.labelless + "]" ) && ( !hideempty || !$( this ).is( ":empty" ) );
				}),
				hierarchyClass = $cells.not( this ).filter( "thead th" ).length && " tablesaw-cell-label-top",
				// TODO reduce coupling with sortable
				$sortableButton = $t.find( ".tablesaw-sortable-btn" ),
				html = $sortableButton.length ? $sortableButton.html() : $t.html();

			if( html !== "" ){
				if( hierarchyClass ){
					var iteration = parseInt( $( this ).attr( "colspan" ), 10 ),
						filter = "";

					if( iteration ){
						filter = "td:nth-child("+ iteration +"n + " + ( colstart ) +")";
					}
					$cells.filter( filter ).prepend( "<b class='" + classes.cellLabels + hierarchyClass + "'>" + html + "</b>"  );
				} else {
					$cells.wrapInner( "<span class='" + classes.cellContentLabels + "'></span>" );
					$cells.prepend( "<b class='" + classes.cellLabels + "'>" + html + "</b>"  );
				}
			}
		});
	};

	Stack.prototype.destroy = function() {
		this.$table.removeClass( classes.stackTable );
		this.$table.find( '.' + classes.cellLabels ).remove();
		this.$table.find( '.' + classes.cellContentLabels ).each(function() {
			$( this ).replaceWith( this.childNodes );
		});
	};

	// on tablecreate, init
	$( document ).on( "tablesawcreate", function( e, Tablesaw, colstart ){
		if( Tablesaw.mode === 'stack' ){
			var table = new Stack( Tablesaw.table );
			table.init( colstart );
		}

	} );

	$( document ).on( "tablesawdestroy", function( e, Tablesaw ){

		if( Tablesaw.mode === 'stack' ){
			$( Tablesaw.table ).data( data.obj ).destroy();
		}

	} );

}( this, jQuery ));

// http://spin.js.org/#v2.3.2
!function(a,b){"object"==typeof module&&module.exports?module.exports=b():"function"==typeof define&&define.amd?define(b):a.Spinner=b()}(this,function(){"use strict";function a(a,b){var c,d=document.createElement(a||"div");for(c in b)d[c]=b[c];return d}function b(a){for(var b=1,c=arguments.length;c>b;b++)a.appendChild(arguments[b]);return a}function c(a,b,c,d){var e=["opacity",b,~~(100*a),c,d].join("-"),f=.01+c/d*100,g=Math.max(1-(1-a)/b*(100-f),a),h=j.substring(0,j.indexOf("Animation")).toLowerCase(),i=h&&"-"+h+"-"||"";return m[e]||(k.insertRule("@"+i+"keyframes "+e+"{0%{opacity:"+g+"}"+f+"%{opacity:"+a+"}"+(f+.01)+"%{opacity:1}"+(f+b)%100+"%{opacity:"+a+"}100%{opacity:"+g+"}}",k.cssRules.length),m[e]=1),e}function d(a,b){var c,d,e=a.style;if(b=b.charAt(0).toUpperCase()+b.slice(1),void 0!==e[b])return b;for(d=0;d<l.length;d++)if(c=l[d]+b,void 0!==e[c])return c}function e(a,b){for(var c in b)a.style[d(a,c)||c]=b[c];return a}function f(a){for(var b=1;b<arguments.length;b++){var c=arguments[b];for(var d in c)void 0===a[d]&&(a[d]=c[d])}return a}function g(a,b){return"string"==typeof a?a:a[b%a.length]}function h(a){this.opts=f(a||{},h.defaults,n)}function i(){function c(b,c){return a("<"+b+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',c)}k.addRule(".spin-vml","behavior:url(#default#VML)"),h.prototype.lines=function(a,d){function f(){return e(c("group",{coordsize:k+" "+k,coordorigin:-j+" "+-j}),{width:k,height:k})}function h(a,h,i){b(m,b(e(f(),{rotation:360/d.lines*a+"deg",left:~~h}),b(e(c("roundrect",{arcsize:d.corners}),{width:j,height:d.scale*d.width,left:d.scale*d.radius,top:-d.scale*d.width>>1,filter:i}),c("fill",{color:g(d.color,a),opacity:d.opacity}),c("stroke",{opacity:0}))))}var i,j=d.scale*(d.length+d.width),k=2*d.scale*j,l=-(d.width+d.length)*d.scale*2+"px",m=e(f(),{position:"absolute",top:l,left:l});if(d.shadow)for(i=1;i<=d.lines;i++)h(i,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(i=1;i<=d.lines;i++)h(i);return b(a,m)},h.prototype.opacity=function(a,b,c,d){var e=a.firstChild;d=d.shadow&&d.lines||0,e&&b+d<e.childNodes.length&&(e=e.childNodes[b+d],e=e&&e.firstChild,e=e&&e.firstChild,e&&(e.opacity=c))}}var j,k,l=["webkit","Moz","ms","O"],m={},n={lines:12,length:7,width:5,radius:10,scale:1,corners:1,color:"#000",opacity:.25,rotate:0,direction:1,speed:1,trail:100,fps:20,zIndex:2e9,className:"spinner",top:"50%",left:"50%",shadow:!1,hwaccel:!1,position:"absolute"};if(h.defaults={},f(h.prototype,{spin:function(b){this.stop();var c=this,d=c.opts,f=c.el=a(null,{className:d.className});if(e(f,{position:d.position,width:0,zIndex:d.zIndex,left:d.left,top:d.top}),b&&b.insertBefore(f,b.firstChild||null),f.setAttribute("role","progressbar"),c.lines(f,c.opts),!j){var g,h=0,i=(d.lines-1)*(1-d.direction)/2,k=d.fps,l=k/d.speed,m=(1-d.opacity)/(l*d.trail/100),n=l/d.lines;!function o(){h++;for(var a=0;a<d.lines;a++)g=Math.max(1-(h+(d.lines-a)*n)%l*m,d.opacity),c.opacity(f,a*d.direction+i,g,d);c.timeout=c.el&&setTimeout(o,~~(1e3/k))}()}return c},stop:function(){var a=this.el;return a&&(clearTimeout(this.timeout),a.parentNode&&a.parentNode.removeChild(a),this.el=void 0),this},lines:function(d,f){function h(b,c){return e(a(),{position:"absolute",width:f.scale*(f.length+f.width)+"px",height:f.scale*f.width+"px",background:b,boxShadow:c,transformOrigin:"left",transform:"rotate("+~~(360/f.lines*k+f.rotate)+"deg) translate("+f.scale*f.radius+"px,0)",borderRadius:(f.corners*f.scale*f.width>>1)+"px"})}for(var i,k=0,l=(f.lines-1)*(1-f.direction)/2;k<f.lines;k++)i=e(a(),{position:"absolute",top:1+~(f.scale*f.width/2)+"px",transform:f.hwaccel?"translate3d(0,0,0)":"",opacity:f.opacity,animation:j&&c(f.opacity,f.trail,l+k*f.direction,f.lines)+" "+1/f.speed+"s linear infinite"}),f.shadow&&b(i,e(h("#000","0 0 4px #000"),{top:"2px"})),b(d,b(i,h(g(f.color,k),"0 0 1px rgba(0,0,0,.1)")));return d},opacity:function(a,b,c){b<a.childNodes.length&&(a.childNodes[b].style.opacity=c)}}),"undefined"!=typeof document){k=function(){var c=a("style",{type:"text/css"});return b(document.getElementsByTagName("head")[0],c),c.sheet||c.styleSheet}();var o=e(a("group"),{behavior:"url(#default#VML)"});!d(o,"transform")&&o.adj?i():j=d(o,"animation")}return h});
