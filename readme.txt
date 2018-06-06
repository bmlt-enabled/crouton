=== BMLT Tabbed UI ===  

Contributors: Jack S

Tags: na, meeting list, meeting finder, maps, recovery, addiction, webservant, bmlt

Requires at least: 3.6

Tested up to: 4.6.1

Stable tag: 6.0.14

BMLT Tabbed UI implements a Tabbed UI for BMLT.

== Description ==

This plugin provides a Tabbed UI and more for the Basic Meeting List Toolbox (BMLT).  Simply put the shortcode [bmlt_tabs] into a Wordpress page to get your very own tabbed interface to BMLT.  Not into a tabbed interface?  There is a shortcode parameter to display meetings without tabs.  This would be useful for Areas that have fewer meetings.  This plugin also provides various shortcodes to return the number of meetings and groups in specified service bodies.  Please visit settings - BMLT Tabbed UI for shortcode instructions.

== Installation ==

1. Place the 'bmlt-tabbed-ui' folder in your '/wp-content/plugins/' directory.

2. Activate bmlt-tabbed-ui.

3. Enter BMLT Root Server into Settings - BMLT Tabs

4. Enter shortcode into a new or existing Wordpress page.

5. For shortcode usage see Settings - BMLT Tabs.

6. View your site.

7. Adjust the CSS of your theme as needed.

== Screenshots ==

<a href="http://orlandona.org/meetings/">Go to this Web page to get an idea of how this works.</a>

== Changelog ==

= 6.0.14 =

* Fix - Further testing revealed bug in v6.0.13 fix for root server path.

= 6.0.13 =

* Fix - Use only root server path when user inadvertantly includes a filename.

= 6.0.12 =

* Fix - Added logic to support service_body_parent in URL parameters.

= 6.0.11 =

* New - Shortcode parameter "time_format".  This will allow configuring the meeting time using a given PHP format string. See BMLT-Settings-Help.

= 6.0.10 =* Fix: Google maps link was not working on smartphones.= 6.0.9 =

* Fix: Tabs click function interfering with other <a> elements.

= 6.0.8 =

* Fix: Geolocation failed. Removed location services from BMLT Tabs because Chrome changed requirement to get location. Now using simple map url.

= 6.0.7 =

* Fix: cURL was not allowing BMLT servers that use SSL.

= 6.0.6 =

* Fix - Introduced transient cache issue with BMLT Tabs v.6.0.5 update.

= 6.0.5 =

* Fix - Group count quit working with BMLT server v.2.6.31 update.

= 6.0.4 =

* Fix - More style changes for theme compatibility.

= 6.0.3 =

* Fix - Map popup style changes for theme compatibility.

= 6.0.2 =

* Fix - Tab style changes for theme compatibility.

= 6.0.1 =

* Fix - Weekday button not showing meetings when using has_tabs='0' shortcode parameter.

= 6.0 =

* New - Replaced jQuery-UI with Bootstrap framework.

* New - URL parameters for re-using one page for multiple service bodies. See admin screen for instructions.

* New - Distance (as the crow flies) to meeting under map button.

* Improved - Significant enhancement on mobile devices.

* Change - Removed spin.js (obsolete).

* Improved - Optimized and reduced style sheet size by 50%.

= 5.2.5 =

* Fix - Removed print map option. No longer supported by Google via url.

= 5.2.4 =

* Fix - Theme compatibility issue with jQuery.

= 5.2.3 =

* Fix - PHP encoding issue causing headers already sent error.

= 5.2.2 =

* Fix - Placeholder for Groups dropdown incorrectly had Cities.

* Fix - Style tweaks to correct dropdown alignment.

= 5.2.1 =

* No changes.

= 5.2 =

* Update - Added latest version of select2 javascript library.  This should fix conflict with All-in-One Event Calendar plugin.

* Fix - Cleaned up css on dropdowns.

= 5.1.5 =

* Fix - Apostrophe in format description was breaking html.

* Fix - On some sites having no meetings on a weekday was breaking tab.

* Fix - Cleaned up some css on the tabs.

= 5.1.4 =

* Fix - Prevent scripts from loading on other admin pages.

* Fix - Allow scripts to load on pages with BMLT shortcodes only.

* Fix - Eliminated maps modal popup due to inconsistancy with browsers especially smartphones.  Replaced with standard window in new tab / window.

= 5.1.3 =

* Fix - SVN Problem. Missing version number.

= 5.1.2 =

* Fix - Theme compatibility. Reduce tab width to accomodate sites with narrow page content width.

= 5.1.1 =

* Fix - SVN problem. CSS file was missing.= 5.1 =

* New - Combined header (dropdowns) with meetings into one interface.

* New - Added "Map" popup with options for directions, street map, earth map, print map and GPS coordinates.

* New - Show root server version in setup.

* New - Show service body id, parent service body and parent service body id in setup.

* Fix - More tweaks to the css for theme and smartphone compatibility.

* Fix - Return "[connect error]" to meeting and group count when root server is down.  Sites that have "[meeting_count]" shortcode on their homepage were hanging when root server was down.  This should help.

= 5.0.5 =

* Fix - Increased CURLOPT_CONNECTTIMEOUT to accomodate slower connections.

= 5.0.4 =

* Fix - Calculation of end time was incorrect because of adding minutes twice. Thanks to ny_dave for reporting this.

= 5.0.3 =

* Fix - Tweaks to the cache code.

* Fix - Tweaks to the root server connection with better error reporting.

* Fix - Tweaks to the css for theme and smartphone compatibility.

= 5.0.2 =

* New - Default Service Body dropdown option field.  This will allow using the shortcode [bmlt_tabs], [bmlt_count] and [group_count] without a specifying a service body.

* New - Meeting Cache option field.  This will allow specifying the meeting cache time along with deleting the cache.

* New - Shortcode parameter "root_server".  This will allow displaying meetings from a different root server.* New - Shortcode parameter "view_by".  This will allowing listing meetings by weekday or city.

* New - Shortcode parameter "include_city_button".  This will allowing exluding the city button.

* New - Shortcode parameter "include_weekday_button".  This will allow excluding the weekday button.

* New - Meeting format tooltip.  This eliminates the format legend popup and replaces it with a more informative format legend per meeting.

* Replaced - jQueryui scripts with built in Wordpress jQueryui scripts.

* Improved - Included additional checks for connection to root server with informative error messages.

* Improved - Plugin code was partially re-written to be more efficient along with CSS style sheets.

* Future - Shortcode paramters will become option fields to allow saving as defaults (similiar to the Default Service Body).

= 4.8.8 =

* Fixed problem with connecting to some root servers (added CURLOPT_USERAGENT).

= 4.8.7 =

* Replaced jqueryui buttons with html for compatibility with bootstrap.css

* Replaced jqueryui popup modal with javascript for compatibility with bootstrap.css

* Removed 50% of jqueryui code making plugin more efficient.

= 4.8.6 =

* Fix problem with format legend styles.

= 4.8.5 =

* Fix problem with format legend styles.

= 4.8.4 =

* Fix problem with format legend styles.

= 4.8.3 =

* Fix problem with format legend styles.

= 4.8.2 =

* Fix problem with format legend styles.

= 4.8.1 =

* Problems with submitting.  See 4.8 for changes.

= 4.8 =

* Added formats dropdown to filter meetings with a specific format.

* Added shortcode parameter "has_formats" for hiding formats dropdown.

* Added CSS wrapper to help with style compatibility issues.

= 4.7 =

* Fixed css for table head - missed in 4.6.

= 4.6 =

* Fixed css for table head - missed in 4.5.

= 4.5 =

* Fixed unique_array problem.

* Fixed css for table head.

= 4.4 =

* Fixed problem with empty formats legend.

* Added zip codes dropdown.

* Added shortcode parameter "has_dropdowns" for hiding zip code dropdown.

* Added shortcode parameter "dropdown_width" for adjusting width of dropdowns.  Dropdowns were wrapping to next line on some sites.

= 4.3 =

* Problems with submitting

= 4.2 =

* Problems with submitting

= 4.1 =

* Problems with submitting

= 4.0 =

* Added option field for BMLT root server in settings - BMLT Tabs.  This root server is required.  BMLT Tabs can now be used on any BMLT server.

* Added header above weekday tabs giving the ability to display meetings by weekday, city, group or location.  Default is with the header.

* Added shortcode parameter "has_tabs" to allow meetings to be listed in a table instead of tabs.  This would be beneficial for service bodies with fewer groups. Default is with tabs.

* Added shortcode parameter "header" to allow removal of the drop-downs.  This will be helpful for backward compatibility.

* Added button for pop-up dialogue of meeting formats legend.

* Removed template support for now.  Using shortcode parameters instead.

= 3.4 =

* Fixed margin-top for format table.

= 3.3 =

* Fixed margin-top for meeting list table.

* Added missing help text.

= 3.2 =

* Added new template.  There are now 3 templates.

* Removed unnecessary styles and styles that over-wrote theme styles.

= 3.1 =

* Added some missing help text.

= 3.0 =

* Added shortcode parameter to display meeting in a table.

* Changed code to support additional templates in the future.

* Changed method in which meetings are fetched from the server to a more efficient JSON query.

* Removed unnecessary jquery scripts making code more efficient.

= 2.0 =

* Added the ability to include multiple service bodies in the tabbed UI list of meetings.

* Added the ability to include meetings from parent service bodies from the BMLT database in the tabbed UI list of meetings.

* Added a new shortcode [bmlt_count] to return the number of meetings in a specific service body, muliple service bodies or all meetings.

* Added a feature in which the tabbed UI interface defaults to the current day of week.

* Changed the theme for the tabbed UI user interface.

= 1.5 =

* Fixed accordian effect on slower connections by initial setting of display:none in class css-panes.

= 1.4 =

* Left out jquery dependency for tabs.js on 1.3

= 1.3 =

* Removed jquery.tools.min.js (which was being loaded from maxcdn which keeps going down)

* Added tabs.js to plugin directory (which is a component of jquery.tools library)

= 1.2 =

* Fixed URI on the screenshots page

* Changed Plugin URI to Wordpress plugin directory

= 1.1 =

* Complete rewrite of plugin to conform with Wordpress standards

= 1.0 =

* Released on January 20, 2012