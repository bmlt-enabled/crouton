<h2>Instructions</h2>
<p> Please open a ticket <a href="https://github.com/radius314/crouton/issues" target="_top">https://github.com/radius314/crouton/issues</a> with problems, questions or comments.</p>
<div id="accordion">
	<h3 class="help-accordian"><strong>URL Parameters (New)</strong></h3>
	<div>
		<p>This feature will provide the capabity to re-use one page to generate a Tabbed UI for unlimited service bodies.</p>
		<p>Example: A Region would have seperate pages for each Area with a Tabbed UI.</p>
		<p>Instead: One page can be used to display a Tabbed UI for all Areas.</p>
		<p>1. Insert the [bmlt_tabs] into a page.</p>
		<p>2. Link to that page using parameters as described below.</p>
		<p>Accepted Parameters: root_server, service_body, service_body_parent, this_title, meeting_count, group_count.
		<p><em>"service_body" parameter required - all others optional</em></p>
		<p><em>"service_body_parent" parameter for regional meetings</em></p>
		<p>Please study the following URLs to get acquainted with the URL parameter structure.</p>
		<p><strong>Meetings for One Area.</strong></p>
		<p><a target="_blank" href="https://nameetinglist.org/bmlt-tabs/?root_server=https://naflorida.org/bmlt_server&service_body=2&this_title=Greater%20Orlando%20Area%20Meetings&meeting_count=1&group_count=1">https://nameetinglist.org/bmlt-tabs/?<span style="color:red;">root_server</span>=https://naflorida.org/bmlt_server&<span style="color:red;">service_body</span>=2&<span style="color:red;">this_title</span>=Greater%20Orlando%20Area%20Meetings&<span style="color:red;">meeting_count</span>=1&<span style="color:red;">group_count</span>=1</a></p>
		<p><strong>Meetings for Two (or more) Areas.</strong></p>
		<p><a target="_blank" href="https://nameetinglist.org/bmlt-tabs/?root_server=https://naflorida.org/bmlt_server&service_body=2,18&this_title=Greater%20Orlando%20Area%20and%20Central%20Florda%20Area&meeting_count=1&group_count=1">https://nameetinglist.org/bmlt-tabs/?<span style="color:red;">root_server</span>=https://naflorida.org/bmlt_server&<span style="color:red;">service_body</span>=2,18&<span style="color:red;">this_title</span>=Greater%20Orlando%20Area%20and%20Central%20Florda%20Area%20Meetings&<span style="color:red;">meeting_count</span>=1&<span style="color:red;">group_count</span>=1</a></p>
		<p><strong>Meetings for One Region.</strong></p>
		<p><a target="_blank" href="https://nameetinglist.org/bmlt-tabs/?root_server=https://naflorida.org/bmlt_server&service_body_parent=1&this_title=Florida%20Region%20Meetings&meeting_count=1&group_count=1">https://nameetinglist.org/bmlt-tabs/?<span style="color:red;">root_server</span>=https://naflorida.org/bmlt_server&<span style="color:red;">service_body_parent</span>=1&<span style="color:red;">this_title</span>=Florida%20Region%20Meetings&<span style="color:red;">meeting_count</span>=1&<span style="color:red;">group_count</span>=1</a></p>
		<p><em>Title, meeting and group count have unique CSS classes that can be used for custom styling.</em></p>
	</div>
	<h3 class="help-accordian"><strong>Time Format (New)</strong></h3>

	<div>
		<p>With this parameter you can configure the time format.</p>
		<p><strong>[bmlt_tabs time_format="G:i"]</strong></p>
		<p>"G:i" = 24 Hour Time Format (14:00)</p>
		<p>"g:i A" = 12 Hour Time Format (2:00 PM) (Default)</p>
		<p><em>Default is 12 Hour Time Fomat</em></p>
		<p>Refer to the <a style='color:#0073aa;' target='_blank' href='https://php.net/manual/en/function.date.php'>PHP Date</a> function for other ways to configure the time.
	</div>
	<h3 class="help-accordian"><strong>crouton Shortcode Usage</strong></h3>
	<div>
		<p>Insert the following shortcodes into a page.</p>
		<p><strong>[bmlt_tabs]</strong></p>
		<p><strong>[meeting_count]</strong></p>
		<p><strong>[group_count]</strong></p>
		<p><strong>Example: We now have [group_count] groups with [meeting_count] per week.</strong></p>
		<p><em>Detailed instructions for each shortcode are provided as follows.</em></p>
	</div>

	<h3 class="help-accordian"><strong>Service Body Parameter</strong></h3>
	<div>
		<p>For all shortcodes the service_body parameter is optional.</p>
		<p>When no service_body is specified the default service body will be used.</p>
		<p><strong>[bmlt_tabs service_body="2,3,4"]</strong></p>
		<p>service_body = one or more BMLT service body IDs.</p>
		<p>Using multiple IDs will combine meetings from each service body into the crouton interface.</p>
		<p><strong>[bmlt_tabs service_body_parent="1,2,3"]</strong></p>
		<p>service_body_parent = one or more BMLT parent service body IDs.</p>
		<p>An example parent service body is a Region.  This would be useful to get all meetings from a specific Region.</p>
		<p>You can find the service body ID (with shortcode) next to the Default Service Body dropdown above.</p>
		<p><em>You cannot combine the service_body and parent_service_body parameters.</em></p>
	</div>
	<h3 class="help-accordian"><strong>Root Server</strong></h3>
	<div>
		<p>Use a different Root Server.</p>
		<p><strong>[bmlt_tabs service_body="2" root_server="https://naflorida.org/bmlt_server"]</strong></p>
		<p>Useful for displaying meetings from a different root server.</p>
		<em><p>Hint: To find service body IDs enter the different root server into the "BMLT Root Server URL" box and save.</p>
			<p>Remember to enter your current Root Server back into the "BMLT Root Server URL".</p></em>
	</div>
	<h3 class="help-accordian"><strong>View By City or Weekday</strong></h3>
	<div>
		<p>With this parameter you can initially view meetings by City or Weekday.</p>
		<p><strong>[bmlt_tabs view_by="city|weekday"]</strong></p>
		<p>city = view meetings by City</p>
		<p>weekday = view meetings by Weekdays (default)</p>
	</div>
	<h3 class="help-accordian"><strong>Exclude City Button</strong></h3>
	<div>
		<p>With this parameter you can exclude the City button.</p>

		<p><strong>[bmlt_tabs include_city_button="0|1"]</strong></p>

		<p>0 = exclude City button</p>

		<p>1 = include City button (default)</p>

		<p><em>City button will be included when view_by = "city" (include_city_button will be set to "1").</em></p>
	</div>
	<h3 class="help-accordian"><strong>Exclude Weekday Button</strong></h3>
	<div>
		<p>With this parameter you can exclude the Weekday button.</p>
		<p><strong>[bmlt_tabs include_weekday_button="0|1"]</strong></p>
		<p>0 = exclude Weekday button</p>
		<p>1 = include Weekday button (default)</p>
		<p><em>Weekday button will be included when view_by = "weekday" (include_weekday_button will be set to "1").</em></p>
	</div>
	<h3 class="help-accordian"><strong>Tabs or No Tabs</strong></h3>
	<div>
		<p>With this parameter you can display meetings without weekday tabs.</p>
		<p><strong>[bmlt_tabs has_tabs="0|1"]</strong></p>
		<p>0 = display meetings without tabs</p>
		<p>1 = display meetings with tabs (default)</p>
		<p><em>Hiding weekday tabs is useful for smaller service bodies.</em></p>
	</div>
	<h3 class="help-accordian"><strong>Header or No Header</strong></h3>
	<div>
		<p>The header will show dropdowns.</p>
		<p><strong>[bmlt_tabs header="0|1"]</strong></p>
		<p>0 = do not display the header</p>
		<p>1 = display the header (default)</p>
	</div>
	<h3 class="help-accordian"><strong>Dropdowns</strong></h3>
	<div>
		<p>With this parameter you can show or hide the dropdowns.</p>
		<p><strong>[bmlt_tabs has_cities='0|1' has_groups='0|1' has_areas='0|1' has_locations='0|1' has_sub_province='0|1' has_zip_codes='0|1' has_formats='0|1']</strong></p>
		<p>0 = hide dropdown<p>
		<p>1 = show dropdown (default)<p>
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
		<p>Will return the number of meetings for one or more BMLT service bodies.</p>
		<p><strong>[meeting_count]</strong> <em>Will use the default service body (above).</em></p>
		<p><strong>[meeting_count service_body="2,3,4"]</strong></p>
		<p><strong>[meeting_count service_body_parent="1,2,3"]</strong></p>
		<p>Will return the number of meetings in one or more BMLT parent service bodies.</p>
		<p><strong>[meeting_count service_body="2" subtract="3"]</strong></p>
		<p>subtract = number of meetings to subtract from total meetings (optional)</p>
		<p><em>Subtract is useful when you are using BMLT for subcommittee meetings and do want to count those meetings.</em></p>
	</div>
	<h3 class="help-accordian"><strong>Group Count</strong></h3>
	<div>
		<p>Will return the number of Groups for one or more BMLT service bodies.</p>
		<p><strong>[group_count]</strong> <em>Will use the default service body (above).</em></p>
		<p><strong>[group_count service_body="2,3,4"]</strong></p>
		<p><strong>[group_count service_body_parent="1,2,3"]</strong></p>
		<p>Will return the number of Groups in one or more BMLT parent service bodies.</p>
	</div>
	<h3 class="help-accordian"><strong>Distance to Meeting</strong></h3>
	<div>
		<p>With this parameter you can display the users distance to meetings under the map link button.</p>
		<p><strong>[bmlt_tabs show_distance="0|1"]</strong></p>
		<p>0 = don't display distance to meeting (default)</p>
		<p>1 = display distance to meeting</p>
		<p><em>User has to have geolocation permissions turned on.</em></p>
	</div>
	<h3 class="help-accordian"><strong>Custom Query</strong></h3>
	<div>
		<p>With this parameter you can use a custom root server query.  This will take precedence over any other kind filtering parameters.</p>
		<p><strong>[bmlt_tabs custom_query=""]</strong></p>
		<p>Example: [bmlt_tabs custom_query="&meeting_key=location_sub_province&meeting_key_value=Sampson"]</p>
		<p><em>This can be overridden using a querystring parameter as well, but use must URL encode the query.  Example: <a target="_blank" href="about:blank">http://localhost:8080/?page_id=5&custom_query=%26meeting_key%3Dlocation_sub_province%26meeting_key_value%3DSampson</a></em></p>
	</div>
</div>
