<h2><a id="config-documentation" class="anchor"></a>Documentation</h2>
<div id="accordion">
    <h3 class="help-accordian"><strong>Crouton Shortcode Usage</strong></h3>
    <div>
        <p>Crouton defines the following shortcodes.</p>
        <ul>
			<li><b>Main Shortcodes</b>
			<p>These shortcodes determine which meetings are included.  Only one of them can be included on a single page.</p>
			<ul>
            	<li><code>[bmlt_tabs]</code> -- generates a tabbed meeting list</li>
            	<li><code>[crouton_map]</code> -- generates a map-based interface from which geographic queries can be made. See "Map Search" below for details.</li>
				<li><code>[bmlt_map]</code> -- generates a map-based interface suitible for mobile devices.  Queries to the BMLT database, along with the available filters, are control by the usual <code>[bmlt_tabs]</code> parameters.</li>
				<li><code>[crouton_tabs]</code> -- generates a table-based interface from which geographic (text search or device location) queries can be made. See "Map Search" below for details.</li>
				<li><code>[init_crouton]</code> -- Do not generate a list, but make the seach results available for the summary shortcodes listed below.</li>
			</ul></li>
			<li><p><b>Secondary Shortcodes</b><p>
			<p>These shortcodes can be used to place additional/summary info about the meetings</p>
			<ul>
				<li><code>[meeting_count]</code></li>
            	<li><code>[group_count]</code></li>
            	<li><code>[service_body_names]</code></li>
				<li><code>[bmlt_handlebar]</code></li>
			</ul></li>
        </ul>
        <p>Example: <code>There are currently [group_count] groups, offering a total of [meeting_count] meetings per week.</code></p>
        <p>Detailed instructions for the shortcode parameters follow.</p>
    </div>
	<h3 class="help-accordian"><strong>Configuring Crouton</strong></h3>
	<div>
		<p>Before any of the shortcodes are useful, you have to set up crouton, at least to tell it where your BMLT root server is and which service bodies interest you.</p>
		<p>There are three places where crouton's parameters can be entered: through the WordPress backend, as attributes in the shortcodes, or in the query string of the URL that generates the page</p>
		<p>However things are set up here, in the WP backend, becomes the default whereever crouton is used on your site.  These defaults can be overridden by attributes in the shortcode.</p>
		<p>In some cases, though, you don't want to set up a different page for every option.  For instance, the meeting pages for all areas on a regional site might share the same design, the only thing that
		is changing is the areas being displayed.  In this case, you might want to use a single page, and specify the area in the query string of the URL.</p>
		<p>You can override any shortcode value.  You can also use two special values `this_title` and `sub_title` to set titles on your querystring to reuse a page easily.  Note: this only works for Wordpress based crouton, not croutonjs.
        <p>Please study the following URLs to get acquainted with the URL parameter structure.</p>
		<p><strong>Meetings for One Area.</strong></p>
		<p><a target="_blank" href="https://bmlt.app/crouton-sample/?root_server=https://bmlt.sezf.org/main_server&service_body=44&this_title=Crossroads%20Area%20Meetings">https://bmlt.app/crouton-sample/?<span style="color:red;">root_server</span>=https://bmlt.sezf.org/main_server&<span style="color:red;">service_body</span>=44&<span style="color:red;">this_title</span>=Crossroads%20Area%20Meetings</a></p>
		<p><strong>Meetings for Two (or more) Areas.</strong></p>
		<p><a target="_blank" href="https://bmlt.app/crouton-sample/?root_server=https://bmlt.sezf.org/main_server&service_body=44,45&this_title=Crossroads%20Area%20and%20Down%20East%20Area">https://bmlt.app/crouton-sample/?<span style="color:red;">root_server</span>=https://bmlt.sezf.org/main_server&<span style="color:red;">service_body</span>=44,45&<span style="color:red;">this_title</span>=Crossroads%20Area%20and%20Down%20East%20Area%20Meetings</a></p>
		<p><strong>Meetings for One Region.</strong></p>
		<p><a target="_blank" href="https://bmlt.app/crouton-sample/?root_server=https://bmlt.sezf.org/main_server&service_body_parent=43&this_title=North%20Carolina%20Region%20Meetings">https://bmlt.app/crouton-sample/?<span style="color:red;">root_server</span>=https://bmlt.sezf.org/main_server&<span style="color:red;">service_body_parent</span>=43&<span style="color:red;">this_title</span>=North%20Carolina%2-Region%20Meetings</a></p>
		<p><em>Title, meeting and group count have unique CSS classes that can be used for custom styling.</em></p>
	</div>
	<h3 class="help-accordian"><strong>Root Server</strong></h3>
	<div>
		<p>The <strong>root_server</strong> attribute can be used to set the BMLT root server.</p>
		<p><strong>[bmlt_tabs service_body="2" root_server="https://bmlt.sezf.org/main_server"]</strong></p>
		<p>When using the WordPress backednd to set the root server, hit save after entering the URL.  This will cause Crouton to load the service bodies so that you can select one or more of them.</p>
	</div>
	<h3 class="help-accordian"><strong>Service Body</strong></h3>
	<div>
		<p><strong>[bmlt_tabs service_body="2,3,4"]</strong></p>
		<p>service_body = one or more BMLT service body IDs.</p>
		<p>Using multiple IDs will combine meetings from each service body into the crouton interface.</p>
		<p><strong>[bmlt_tabs service_body_parent="1,2,3"]</strong></p>
		<p>service_body_parent = one or more BMLT parent service body IDs.</p>
		<p>An example parent service body is a Region.  This would be useful to get all meetings from a specific Region.</p>
		<p>You can find the service body ID (with shortcode) next to the Default Service Body dropdown above.</p>
		<p><em>You cannot combine the service_body and parent_service_body parameters.</em></p>
	</div>
	<h3 class="help-accordian"><strong>How Meetings are Organized into Views</strong></h3>
	<div>
		<p>Typically, crouton shows meetings organized by day and time.  In some cases, however, it may be better to view meetings grouped by city, state or by some other field.</p>
		<p>Crouton is very flexible in this regard: alternate views are provided and you may switch between them, or even define your own groupings.  Each grouping will be represented by
			a button in the header.  The groupings are defined using the "grouping_buttons" attribute.
		</p>
		<p><strong>[bmlt_tabs grouping_buttons="City:location_municipality"]</strong></p>
        <p>You can also include multiple buttons separated by commas.  Keep in mind that the first part is the word for the button.  If using multilingual option, that word must have a translation.</p>
		<p>The default value of this attribute is to define the "City" button, as shown above.  As a convenience, you may also disable this button using the "include_city_button" attribute.</p>
		<p><strong>[bmlt_tabs include_city_button="0|1"]</strong></p>
		<p>0 = exclude City button</p>
		<p>1 = include City button (default)</p>
		<p>By default, the meetings within each group are shown.  By by clicking on the group's header, the meetings in that group may be expanded or collapsed.  If you want the initial view to be collapsed,
			add ":closed" to the group's definition.</p>
		<p><strong>[bmlt_tabs grouping_buttons="City:location_municipality:closed"]</strong></p>
		<p>If you want to make it impossible to close a group, add "non-collapsable" instead of "closed".
	</div>

	<h3 class="help-accordian"><strong>Organizing Meetings by Format-Types</strong></h3>
	<div>
		<p>In BMLT, formats have types.  For instance, the format type "LANG" indicates the format specifies the language of the meeting.  Sometimes, it is useful or organize meetings by the value of a format within a specific type.</p>
		<p><strong>[bmlt_tabs formattype_grouping_buttons="Common Needs:FC3"]</strong></p>
		<p><strong>[bmlt_tabs formattype_grouping_buttons="Languages:LANG"]</strong></p>
        <p>You can also include multiple buttons with a comma after each pair.  Keep in mind that the first part is the word for the button.  If using multilingual option, that word must have a translation.</p>
	</div>
	<h3 class="help-accordian"><strong>Initial View</strong></h3>
	<div>
		<p>With the "view_by" attribute, you can set the initial view to meetings (with or without tabs) as long as the grouping_buttons was added ahead of time.</p>
		<p><strong>[bmlt_tabs view_by="weekday"]</strong></p>
		<p>weekday = view meetings by Weekdays (default)</p>
        <p>Another example could be "city", which would show the meetings organized by city.</p>
		<p>When using an embedded map, view_by=map works.</p>
		<p>When using crouton_map or crouton_tab, view_by=distance works.</p>
	</div>

	<h3 class="help-accordian"><strong>Weekday Tabs</strong></h3>
	<div>
		<p>Normally, Crouton shows meetings organized into tabs, one for every day of the week.  This is appropriate if there are enough meetings to fill up the tabs.  For a small number of meetings,
			it is better to organize them into a simple list.  Note that the number of meetings in the initial query may be large, but the set of meetings being displayed can shrink when a filter is applied.
		</p>
		<p>Crouton switches between the tabbed and untabbed views based on the number of meetings in the current (filtered) view.  To set the number of meetings where the switch should occur, use the <b>filter_tabs</b> attribute,</p>
        <p><strong>[bmlt_tabs filter_tabs="20"]</strong></p>
		<p>The default value of this attribute is 20.</p>
		<p>The <b>has_tabs</b> attribute has been deprecated but is still supported.</p>
	</div>
	<h3 class="help-accordian"><strong>Header or No Header</strong></h3>
	<div>
		<p>The header will show dropdowns.</p>
		<p><strong>[bmlt_tabs header="0|1"]</strong></p>
		<p>0 = do not display the header</p>
		<p>1 = display the header (default)</p>
	</div>
	<h3 class="help-accordian"><strong>Dropdown Filters</strong></h3>
	<div>
		<p>The results of the BMLT root server query can be interactively filtered.</p>
		<p>By default, filters for cities, formats and languages are displayed.  However, these may be deactivated, and any of a number of other filters may be activated.</p>
		<p><strong>[bmlt_tabs has_days='0|1' has_cities='0|1' has_groups='0|1' has_areas='0|1' has_regions='0|1' has_locations='0|1' has_sub_province='0|1' has_states='0|1' has_zip_codes='0|1' has_formats='0|1' has_neighborhoods='0|1' has_venues='0|1' has_languages='0|1' has_common_needs='0|1']</strong></p>
		<p>0 = hide dropdown (default, for <strong>has_languages</strong> and <strong>has_common_needs</strong>)<p>
		<p>1 = show dropdown (default, for all options other than <strong>has_languages</strong> and <strong>has_common_needs</strong>)<p>
	</div>
    <h3 class="help-accordian"><strong>Setting Initial Dropdown Filter Values</strong></h3>
    <div>
        <p>With this parameter you can set the default filter for dropdowns.</p>
        <p><strong>[bmlt_tabs default_filter_dropdown="formats=closed"]</strong></p>
        <p>Any of the dropdown choices are available for use.  Keep in mind that the dropdown must be visible and that the default selection exists.  Spaces should be separated with a hyphen.  Example [bmlt_tabs default_filter_dropdown="formats=Basic-Text"].</p>
    </div>
	<h3 class="help-accordian"><strong>Custom Query</strong></h3>
	<div>
		<p>With this parameter you can use a custom root server query.  This will take precedence over any other kind filtering parameters.</p>
		<p><strong>[bmlt_tabs custom_query=""]</strong></p>
		<p>Example: [bmlt_tabs custom_query="&meeting_key=location_sub_province&meeting_key_value=Sampson"]</p>
        <p>Multiple formats require the use of brackets `[]` which can break shortcodes.  Replace brackets with `%5B%5D`.</p>
		<p><em>This can be overridden using a querystring parameter as well, but use must URL encode the query.  Example: <a target="_blank" href="about:blank">http://localhost:8080/?page_id=5&custom_query=%26meeting_key%3Dlocation_sub_province%26meeting_key_value%3DSampson</a></em></p>
	</div>
	<h3 class="help-accordian"><strong>Query: Select by format</strong></h3>
	<div>
		<p>With this parameter you can add restrictions to root server query as an easy alternative to using a custom query.
		<p><strong>[bmlt_tabs formats="123,-VM"]</strong></p>
		<p>The formats are given in a comma separated list.  If an individual format is a number, it is interpreted as the ID of the format.
		The semantic workshop can be used to look up format ID.  The format's key string (in the default language) can also be used to identify the format.</p>
		<p>The ID can also be negative, which means that the meetings with that format should be excluded from the results.  Similarly, the key-string can also be prefix with a minus sign to indicate it should be excluded as opposed to being required.</p>
		<p>Key-strings cannot be used to identify formats if the aggregator is being used as the root server, as the key-strings are not unique in this case.</p>
	</div>

    <h3 class="help-accordian"><strong>Companion Map</strong></h3>
    <div>
        <p>With this parameter you can have crouton display a companion map of all the meetings.</p>
        <p><strong>[bmlt_tabs show_map="0|1|embed"]</strong></p>
        <p>0 = don't display map (default)</p>
        <p>1 = display map in a seperate window</p>
		<p>embed = display map in a pane, and have it listen for filtering requests.</p>
        <p>You can specify the maximum zoom level at which clustering is enabled, 15 is the default. This may be desirable with smaller data sets in which you don't want to cluster at all.</p>
        <p><strong>[bmlt_tabs show_map="1" max_zoom_level="7"]</strong></p>
		<p>Crouton allows the user to choose between a variety of map providers, including Google and OSM.  A list of compatible providers is available <a href="https://leaflet-extras.github.io/leaflet-providers/preview/">here.</a></p>
        <p><em>If you choose Google as your provider, the Google API Key must be entered on the crouton settings page. You must have the 'Google Maps JavaScript API' enabled on your key. For more information on setting up and configuring a Google Maps API key check out this blog article <a target="_blank" href="https://bmlt.app/google-api-key/">https://bmlt.app/google-api-key/</a></em></p>
		<p>OSM does not require an API Key.</p>
    </div>
	<h3 class="help-accordian"><strong>Companion Map as Filter</strong></h3>
    <div>
        <p>With this parameter you can have crouton display a companion map of all the meetings.</p>
        <p><strong>[bmlt_tabs filter_visible=1"]</strong></p>
        <p>0 = the table includes all meetings, whether or not they are currently visible in the map (default)</p>
        <p>1 = the table includes only those meetings that are currently visible in the map</p>
        <p>The value may be modified "live" using the menu button in the map.</p>
    </div>
    <h3 class="help-accordian"><strong>Map Search</strong></h3>
    <div>
        <p>With these shortcodes you can have crouton start with a map search with auto radius search. The default for the base shortcode is to detect your location and display the ~50 closest meetings (no regard to distance). </p>
        <p><strong>[crouton_map]</strong></p>
		<p><strong>[crouton_tabs]</strong></p>
        <p>The configurable options are as below to add to this shortcode (in addition to any other ones that you'd normally use on [bmlt_tabs])</p>
        <p><strong>[crouton_map map_search_auto="false"]</strong> - specifies you do NOT want to automatically use your current latitude and longitude to find meetings (default: true).</p>
        <p><strong>[crouton_map map_search_location="Greensboro, NC"]</strong> - specifies the starting search location on the map (default: none).</p>
        <p><strong>[crouton_map map_search_coordinates_search="true"]</strong> - specifies the starting search coordinates on the map, will use (and require) the latitude and longitude settings as mentioned here. (default: none).</p>
        <p><strong>[crouton_map map_search_latitude="0" map_search_longitude="0"]</strong> - specifies the starting latitude and longitude in the map view (default: 0, 0).</p>
        <p><strong>[crouton_map map_search_zoom="10"]</strong> - specifies the starting zoom level on the map (default: 10).</p>
        <p><strong>[crouton_map map_search_width="-50"]</strong> - specifies how many meetings to return, a positive integer means how many miles or kilometers to search.  A negative integer indicates the closest number of meetings from that point with no distance limits. (default: -50 [the fifty closest meetings to the point selected]).</p>
    </div>
	<h3 class="help-accordian"><strong>Time Format</strong></h3>
	<div>
		<p>With this parameter you can configure the time format.</p>
		<p><strong>[bmlt_tabs time_format="HH:mm"]</strong></p>
		<p>"HH:mm" = 24 Hour Time Format (14:00)</p>
		<p>"h:mm a" = 12 Hour Time Format (2:00 PM) (Default)</p>
		<p><em>Default is 12 Hour Time Format</em></p>
		<p>Refer to the <a style='color:#0073aa;' target='_blank' href='http://momentjs.com/docs/#/displaying/'>Moment.JS Date</a> function for other ways to configure the time.
	</div>
    <h3 class="help-accordian"><strong>Start of Week</strong></h3>
    <div>
        <p>With this parameter you can change the first day of the week.  Useful for other countries where the week doesn't start with Sunday.</p>
        <p><strong>[bmlt_tabs int_start_day_id="1"]</strong></p>
        <p>1 is the default which is Sunday.  2 is Monday and so on.</p>
    </div>
	<h3 class="help-accordian"><strong>Dropdown Width</strong></h3>
	<div>
		<p>With this parameter you can change the width of the dropdowns.</p>
		<p><strong>[bmlt_tabs service_body="2" dropdown_width="auto|130px|20%"]</strong></p>
		<p>auto = width will be calculated automatically (default)</p>
		<p>130px = width will be calculated in pixels</p>
		<p>20%" = width will be calculated as a percent of the container width</p>
	</div>
	<h3 class="help-accordian"><strong>Exclude Zip Codes</strong></h3>
	<div>
		<p>With this parameter you can exclude meetings in one or more zip codes.</p>
		<p><strong>[bmlt_tabs exclude_zip_codes="32750,32801,32714,etc"]</strong></p>
		<p><em>Warning: Meetings without zip codes will not be excluded.</em></p>
		<p><em><strong>Note: Be sure to "use exclude_zip_codes" in Group and Meeting Count shortcodes (below).</strong></em></p>
	</div>
	<h3 class="help-accordian"><strong>Meeting Count</strong></h3>
	<div>
		<p>Will return the number of meetings in the BMLT query.</p>
		<p><strong>[meeting_count]</strong></p>
		<p><strong>[meeting_count live="0|1"]</strong></p>
		<p>By default, [meeting_count] returns the total number of meetings in the BMLT query. By setting "live" to "1",
		the number displayed will be updated to reflect the current filters selection.  So, to get the number of meetings in an
		area, select the area in the appropriate filter and both the table and the meeting count will be updated.
		</p>
	</div>
	<h3 class="help-accordian"><strong>Group Count</strong></h3>
	<div>
		<p>Will return the number of groups in the BMLT query.</p>
		<p><strong>[group_count]</strong></p>
		<p><strong>[group_count live="0|1"]</strong></p>
		<p>By default, [group_count] returns the total number of groups in the BMLT query. By setting "live" to "1",
		the number displayed will be updated to reflect the current filters selection.  So, to get the number of meetings in an
		area, select the area in the appropriate filter and both the table and the meeting count will be updated.
		</p>
	</div>
    <h3 class="help-accordian"><strong>Sorting</strong></h3>
    <div>
        <p>You can sort the results in the response.</p>
        <p><strong>[bmlt_tabs sort_keys="start_time"]</strong></p>
        <p>start_time = (default)</p>
    </div>
    <h3 class="help-accordian"><strong>Time Zone Adjustments</strong></h3>
    <div>
        <p>With these parameters you can adjust the time for a specific timezone.</p>
        <p><strong>[bmlt_tabs auto_tz_adjust="0|1"]</strong></p>
        <p>0 = do not adjust timezone</p>
        <p>1 = adjust timezone relative to `base_tz` parameter</p>
        <p><strong>[bmlt_tabs base_tz="UTC"]</strong></p>
        <p>If no option is set, timezone will be assumed to the local PC time.</p>
        <p>In the example above, setting to UTC will inform the browser that each time is in UTC.  In conjunction with auto_tz_adjust parameter, time will be shown relative to that.</p>
    </div>
    <h3 class="help-accordian"><strong>Include Unpublished Meetings</strong></h3>
    <div>
        <p>With this parameter you can include unpublished meetings.  You could also use a custom query to accomplish this by adding "&advanced_published=0" into your query.</p>
        <p><strong>[bmlt_tabs include_unpublished="1"]</strong></p>
        <p>You can also set this to only include unpublished with the following.</p>
        <p><strong>[bmlt_tabs include_unpublished="-1"]</strong></p>
    </div>
	<h3 class="help-accordian"><strong>Extending Crouton</strong></h3>
    <div>
        <p>Handlebars is the template system used by Crouton.  You can add Helpers and Partials to Handlebars, and use
			them in your templates, or to modify meeting data.  An sample for doing this is available <a href="https://github.com/otrok7/CroutonExtensionsTemplate">here</a>.
			</p>
    </div>
    <h3 class="help-accordian"><strong>Multilingual Support</strong></h3>
    <div>
        <p>With this parameter you can have crouton display the results into a pre-translated language.</p>
        <p><strong>[bmlt_tabs language="en-US"]</strong></p>
        <p>You can find the currently supported languages <a href="https://github.com/bmlt-enabled/crouton/blob/main/croutonjs/src/js/crouton-localization.js" target="_blank">here</a>.</p>
        <p>Open a ticket if you want to assist with other translations <a href="https://github.com/bmlt-enabled/crouton/issues" target="_blank">here</a>.</p>
    </div>
    <h3 class="help-accordian"><strong>Virtual Meetings</strong></h3>
    <div>
        <p>If you use the format code "VM" it will render the virtual_meeting_link and phone_meeting_number in the metadata template column.  It will automatically turn them into hyperlinks.  This behavior is overridable through the metadata template functionality.  This will also place the description of the VM format above the links.</p>
        <p>If you want to display a QR Code along with this, set the short code <strong>[bmlt_tabs show_qrcode="1"]</strong>.</p>
    </div>
    <h3 class="help-accordian"><strong>Temporarily Closed</strong></h3>
    <div>
        <p>If you use the format code "TC" it will render the format description for that format above the meeting name with a flag icon.  It will show in the defined language (assuming that it was set in the root server).  This behavior is overridable through the meeting data template functionality.</p>
    </div>
    <h3 class="help-accordian"><strong>Suggest Change</strong></h3>
    <div>
        <p>You can set a short setting so that a button that says "Report an Update" appears.  When the button is clicked, it links back to a BMLT workflow page with that meeting.</p>
        <p><strong>[bmlt_tabs report_update_url="/edit-meeting"]</strong></p>
    </div>
</div>
