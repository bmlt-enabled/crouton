
function resetCodemirrorToDefault(textAreaId) {
	let cm = jQuery('#'+textAreaId).next()[0].CodeMirror;
	cm.setValue(croutonDefaultTemplates[textAreaId]);
}
function clearCodemirror(textAreaId) {
	let cm = jQuery('#'+textAreaId).next()[0].CodeMirror;
	cm.setValue("");
}
jQuery(document).ready(function($) {
	var aggregator = "https://aggregator.bmltenabled.org/main_server";
	$("#accordion").accordion({
		heightStyle: "content",
		active: false,
		collapsible: true
	});
	$(".service_body_select").select2({
		width: "40%"
	});
	$(".theme_select").select2({
		width: "20%"
	});
	$("#select_filters").select2({
		width: "60%"
	});
	$("#extra_meetings").select2({
		width: "60%",
		placeholder: "Select Extra Meetings",
	});
	ask_bmlt = function(query, success, fail) {
        const url = $("#root_server").val()+"/client_interface/jsonp/?"+query;
        fetchJsonp(url)
          .then((response) => {
            if (response.ok) {
                return response.json();
            }
            return Promise.reject(response); // 2. reject instead of throw
        })
        .then((json) => {
            success(json);
            return json;
        })
        .catch((response) => {
            fail(response)
            return false;
        })
	}
	handle_error = function(error) {
    	console.log(error);
    }
	test_root_server = function() {
		if (!$('#root_server').val()) {
		    $('#connected_message').hide();
			$('#disconnected_message').hide();
			fill_service_bodies([]);
			fill_extra_meetings([]);
			fill_field_keys([]);
			return;
		}
        ask_bmlt("switcher=GetServerInfo",
        	(info) => {
				$('#server_version').html(info[0].version);
                $('#connected_message').show();
				$('#disconnected_message').hide();
				ask_bmlt('switcher=GetServiceBodies', fill_service_bodies, handle_error);
				if ($('#extra_meetings_enabled').is(':checked')) {
					$("#extra_meetings_select").hide();
					$("#fetching_meetings").show();
					ask_bmlt('switcher=GetSearchResults', fill_extra_meetings, handle_error);
				} else {
					fill_extra_meetings([]);
				}
				ask_bmlt('switcher=GetFieldKeys', fill_field_keys, handle_error);
				fill_language_options();
            },
            (error) => {
                $('#connected_message').hide();
				$('#disconnected_message').show();
				fill_service_bodies([]);
				fill_extra_meetings([]);
				fill_field_keys([]);
            }
		);
	}
	test_root_server();
	write_service_body_with_childern = function(options, sb, parents, my_parent, level) {
    	let prefix = '';
        for (i=0; i<level; i++) prefix += '-';
        const sbVal = [sb.name,sb.id,sb.parent_id, my_parent].join(',');
        options.push('<option value="'+sbVal+'" '+(crouton_admin.service_bodies_selected.includes(sb.id)?'selected':'')+'>'+prefix+sb.name+'('+sb.id+
			')</option>');
        found = parents.find((p) => p.id == sb.id);
        if (typeof found !== 'undefined')
            found.children.forEach((child) =>
                options = write_service_body_with_childern(options, child, parents, sb.name, level+1));
        return options;
    }
	fill_service_bodies = function(service_bodies) {
		crouton_admin.service_bodies = service_bodies.reduce((carry,item) => {carry[item.id] = item; return carry;}, {});
        service_bodies = service_bodies.sort((a,b) => a.name.localeCompare(b.name));
        const roots = service_bodies.filter((sb) => sb.parent_id=='0');
        const parents = service_bodies.reduce((carry,item) => {
            const found = carry.find((p) => p.id == item.parent_id);
            if (found) {
                found.children.push(item);
            } else {
                carry.push({id: item.parent_id, children:[item]})
            }
            return carry;
            }, []);
        let options = [];
        roots.forEach((sb) => {
            options = write_service_body_with_childern(options, sb, parents, 'ROOT', 0);
        });
        $('#service_bodies').html(options.join(''));
    }
    root_server_keypress = function(event) {
        if (event.code == 'Enter') {
			this.test_root_server();
			event.preventDefault();
		}
		return true;
    }
	fill_extra_meetings = function(extra_meetings_array) {
		$("#fetching_meetings").hide();
		if (!extra_meetings_array.length) {
			$("#extra_meetings_select").hide();
		} else {
			$("#extra_meetings_select").show();
		}
		const options = extra_meetings_array.map((extra_meeting) =>
			'<option value="'+extra_meeting.id_bigint+'" '+(crouton_admin.extra_meetings.includes(extra_meeting.id_bigint)?'selected':'')+'>'+
				extra_meeting.meeting_name+' ['+extra_meeting.weekday_tinyint+']['+extra_meeting.start_time+']['+crouton_admin.service_bodies[extra_meeting.service_body_bigint].name+']['+extra_meeting.service_body_bigint+']</option>');
		$('#extra_meetings').html(options.join(''));
	}
	fill_field_keys = function(field_keys_array) {
		var html = '<tr><th>Name</th><th>Description</th></tr>';
		field_keys_array.forEach((field) => {
			html += '<tr><td>'+field.key+'</td><td>'+field.description+'</td></tr>';
		});
		$('#fields_table').html(html);
	}
	fill_language_options = function() {
		const languages = new CroutonLocalization('en-US');
		$('.language_select').html(
			'<option value="">Select Language</option>'+
			languages.getAllLanguages().map((language) => '<option value="'+language+'">'+language+'</option>').join(''));
	}
	enable_download_translation_button = function(language) {
		if (language) {
			$('#download_translation_button').prop('disabled', false);
		} else {
			$('#download_translation_button').prop('disabled', true);
		}
	}
	download_translation_csv = function(event) {
		event.preventDefault();
		language = $('#translation_select').val();
		if (!language) return;
		const languages = new CroutonLocalization('en-US');
		try {
			if ($('#custom_translations').val()) {
				console.log("Existing custom translations found, merging with defaults");
				console.log($('#custom_translations').val())
				languages.customizeTranslations(JSON.parse($('#custom_translations').val() ?? '{}'));
			}
		} catch (e) {
			console.error('Error parsing existing translations:', e);
		}
		let ret = 'key;en-US;'+language+'\n';
		const translations = languages.getTranslations(language);
		translations.forEach((translation) => {
			if (Array.isArray(translation.translation)
				|| typeof translation.translation === 'object') {
				translation.translation = JSON.stringify(translation.translation);
			}
			ret += translation.key+';'+translation.english+';'+translation.translation+'\n';
		});
    	const blob = new Blob([ret], { type: 'text/csv' });
    	const url = URL.createObjectURL(blob);
    	const a = document.createElement('a');
		a.disabled = false;
    	a.href = url;
    	a.download = 'crouton-translations-'+language+'.csv';
		a.click();
		URL.revokeObjectURL(url);
		a.remove();
	}
	upload_translation_csv = function(event) {
		const file = event.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = function(e) {
			const contents = e.target.result;
			const rows = contents.split('\n');
			if (rows.length < 2 || !rows[0].startsWith('key;en-US;')) {
				alert('Invalid CSV file');
				return;
			}
			const lang = rows[0].replace('key;en-US;', '').trim();
			rows.shift(); // remove header
        	const data = rows.reduce((carry, row) => {
				const columns = row.split(';');
				if (columns.length < 3) return carry;
				carry[columns[0]] = columns[2].trim();
				return carry;
			}, {});
			const custom_translations = new CroutonLocalization('en-US').filterCustomTranslations(lang, data);
			let existing_translations = {};
			try {
				if ($('#custom_translations').val()) {
					existing_translations = JSON.parse($('#custom_translations').val() ?? '{}');
				}
			} catch (e) {
				console.error('Error parsing existing translations:', e);
			}
			existing_translations[lang] = custom_translations;
			$('#custom_translations').val(JSON.stringify(existing_translations));
			alert('Translations uploaded successfully! Don\'t forget to click "Save Changes" to save your translations.');
		}
		reader.readAsText(file);
	}
	clear_custom_translations = function(event) {
		event.preventDefault();
		if (confirm('Are you sure you want to clear all custom translations?')) {
			$('#custom_translations').val('');
			alert('Custom translations cleared.');
		}
	}
	$(window).on("load", function () {
		if($('#use_aggregator').is(':checked')) {
			$("#root_server").prop("readonly", true);
		}
	});
	$('#use_aggregator').click(function() {
		if($(this).is(':checked')) {
			$("#root_server").val(aggregator);
			$("#root_server").prop("readonly", true);
			test_root_server();
		} else {
			$("#root_server").val("");
			$("#root_server").prop("readonly", false);
			test_root_server();
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
