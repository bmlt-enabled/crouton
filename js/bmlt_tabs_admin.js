﻿
function resetCodemirrorToDefault(textAreaId) {
	let cm = jQuery('#'+textAreaId).next()[0].CodeMirror;
	cm.setValue(croutonDefaultTemplates[textAreaId]);
}
jQuery(document).ready(function($) {
	var aggregator = "https://aggregator.bmltenabled.org/main_server";
	$("#accordion").accordion({
		heightStyle: "content",
		active: false,
		collapsible: true
	});
	$(".service_body_select").chosen({
		inherit_select_classes: true,
		width: "40%"
	});
	$(".theme_select").chosen({
		inherit_select_classes: true,
		width: "20%"
	});
	$("#select_filters").chosen({
		inherit_select_classes: true,
		width: "60%"
	});
	$("#extra_meetings").chosen({
		no_results_text: "Oops, nothing found!",
		width: "60%",
		placeholder_text_multiple: "Select Extra Meetings",
		search_contains: true
	});
	$('#extra_meetings').on('chosen:showing_dropdown', function(evt, params) {
		$(".ctrl_key").show();
	});
	$('#extra_meetings').on('chosen:hiding_dropdown', function(evt, params) {
		$(".ctrl_key").hide();
	});
	$(window).on("load", function () {
		if($('#use_aggregator').is(':checked')) {
			$("#root_server").prop("readonly", true);
		}
	});
	$('#use_aggregator').click(function() {
		if($(this).is(':checked')) {
			$("#root_server").val(aggregator);
			$("#root_server").prop("readonly", true);
		} else {
			$("#root_server").val("");
			$("#root_server").prop("readonly", false);
		}
	});
	var rootServerValue = $('#root_server').val();
	if(~rootServerValue.indexOf(aggregator)) {
		$("#use_aggregator").prop("checked", true);
	}
	$('.tooltip').tooltipster({
		animation: 'grow',
		delay: 200,
		theme: 'tooltipster-noir',
		hideOnClick: true,
		contentAsHTML: true,
		positionTracker: false,
		icon: '(?)',
		iconCloning: true,
		iconDesktop: true,
		iconTouch: false,
		iconTheme: 'tooltipster-icon',
		interactive: true,
		arrow: true,
		position: 'right',
		trigger: 'click'
	});
	$('.handlebarsCode').each(function(i,textArea) {
		let template = textArea.value;
		textArea.value = template.replace("___DEFAULT___", croutonDefaultTemplates[textArea.id]);
		textArea.dataset.codeMirror = CodeMirror.fromTextArea(textArea, {
			matchBrackets: true,
			lineNumbers: true,
			mode: {name: 'handlebars', base: 'text/html'},
			viewportMargin: Infinity,
			indentUnit: 4,
			indentWithTabs: true
		});
	});
	$('#custom_css').each(function(i,textArea) {
		CodeMirror.fromTextArea(textArea, {
			lineNumbers: true,
			mode: 'css',
        	extraKeys: {"Ctrl-Space": "autocomplete"}
      });
	});
	showOrHide($("#tile_provider").val());
    $("#tile_provider").change(function() {
        showOrHide($("#tile_provider").val());
    })
    function showOrHide(val) {
    	if (val == 'google') {
        	$("#nominatim_div").hide();
        	$("#custom_tile_provider").hide();
        	$("#api_key_div").show();
    	} else if (val == 'custom') {
        	$("#nominatim_div").show();
        	$("#custom_tile_provider").show();
        	$("#api_key_div").hide();
    	} else {
        	$("#nominatim_div").show();
        	$("#custom_tile_provider").hide();
        	$("#api_key_div").hide();
    	}
	}
	var tabs;
/**
 * Get Tab Key
 */
function getTabKey(href) {
  return href.replace('#', '');
}
/**
 * Hide all tabs
 */
function hideAllTabs() {
    tabs.each(function(){
        var href = getTabKey(jQuery(this).attr('href'));
        jQuery('#' + href).hide();
    });
}
/**
 * Activate Tab
 */
function activateTab(tab) {
    var href = getTabKey(tab.attr('href'));
    tabs.removeClass('nav-tab-active');
    tab.addClass('nav-tab-active');
    jQuery('#' + href).show();
}
jQuery(document).ready(function($){
    var activeTab, firstTab;
    // First load, activate first tab or tab with nav-tab-active class
    firstTab = false;
    activeTab = false;
    tabs = $('a.nav-tab');
    hideAllTabs();
    tabs.each(function(){
        var href = $(this).attr('href').replace('#', '');
        if (!firstTab) {
            firstTab = $(this);
        }
        if ($(this).hasClass('nav-tab-active')) {
            activeTab = $(this);
        }
    });
    if (!activeTab) {
        activeTab = firstTab;
    }
    activateTab(activeTab);
    //Click tab
    tabs.click(function(e) {
        e.preventDefault();
        hideAllTabs();
        activateTab($(this));
    });
});
});
