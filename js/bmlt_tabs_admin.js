function getValueSelected() 
{
	var x = document.bmlt_tabs_options.service_body_1.selectedIndex;
	var res = document.bmlt_tabs_options.service_body_1.options[x].value.split(",");
	//document.getElementById("txtSelectedValues1").innerHTML = '<span class="bmlt_sb">[bmlt_tabs service_body="' + res[1] + '"]</span>';
	//document.getElementById("txtSelectedValues2").value = '[bmlt_tabs service_body_parent="' + res[2] + '"]';
	document.getElementById("txtSelectedValues1").innerHTML = 'Service Body ID: <span class="bmlt_sb">' + res[1] + '</span>';
	document.getElementById("txtSelectedValues2").innerHTML = 'Service Body Parent: <span class="bmlt_sb">' + res[3] + '</span>Service Body Parent ID: <span class="bmlt_sb">' + res[2] + '</span>';
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
	$("#accordion").accordion({
		heightStyle: "content",
		active: false,
		collapsible: true
	});
});
