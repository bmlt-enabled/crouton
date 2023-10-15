function getValueSelected() 
{
	var x = document.bmlt_tabs_options.service_body_1.selectedIndex;
	var res = document.bmlt_tabs_options.service_body_1.options[x].value.split(",");
	//document.getElementById("txtSelectedValues1").innerHTML = '<span class="bmlt_sb">[bmlt_tabs service_body="' + res[1] + '"]</span>';
	//document.getElementById("txtSelectedValues2").value = '[bmlt_tabs service_body_parent="' + res[2] + '"]';
	document.getElementById("txtSelectedValues1").innerHTML = '<b>Service Body ID:</b> <span class="bmlt_sb">' + res[1] + '</span>';
	document.getElementById("txtSelectedValues2").innerHTML = '<b>Service Body Parent:</b> <span class="bmlt_sb">' + res[3] + '</span>, <b>Service Body Parent ID:</b> <span class="bmlt_sb">' + res[2] + '</span>';
};

function numbersonly(myfield, e, dec)
{
	var key;
	var keychar;
	if (window.event)
	   key = window.event.keyCode;
	else if (e)
	   key = e.which;
	else
	   return true;
	keychar = String.fromCharCode(key);
	// control keys
	if ((key==null) || (key==0) || (key==8) || 
		(key==9) || (key==13) || (key==27) )
	   return true;
	// numbers
	else if ((("0123456789").indexOf(keychar) > -1))
	   return true;
	// decimal point jump
	else if (dec && (keychar == "."))
	   {
	   myfield.form.elements[dec].focus();
	   return false;
	   }
	else
	   return false;
};

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
	jQuery('.handlebarsCode').each(function(i,textArea) {
		CodeMirror.fromTextArea(textArea, {
			matchBrackets: true,
			lineNumbers: true,
			mode: {name: 'handlebars', base: 'text/html'},
			indentUnit: 4,
			indentWithTabs: true
		});
	});
	jQuery('#custom_css').each(function(i,textArea) {
		CodeMirror.fromTextArea(textArea, {
			lineNumbers: true,
			mode: 'css',
        	extraKeys: {"Ctrl-Space": "autocomplete"}
      });
	});
});
function show_create_detail_option(me) {
	if (me.value && me.value.trim().length > 0) {
		document.getElementById('meeting_details_options').innerHTML =
			'<input type="checkbox" id="create_default_page" name="create_default_page">' +
			'<label for="create_default_page">If page doesn\'t exist, create it.</label>'
		;
	} else {
		document.getElementById('meeting_details_options').innerHTML = '';
	}
}
