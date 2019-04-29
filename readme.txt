=== crouton ===  

Contributors: odathp, radius314, pjaudiomv
Tags: na, meeting list, meeting finder, maps, recovery, addiction, webservant, bmlt
Requires at least: 4.0
Required PHP: 5.6
Tested up to: 5.1.1
Stable tag: 2.6.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
crouton implements a Tabbed UI for BMLT.

== Description ==

Crouton is a "Fork" of the BMLT Tabbed UI plugin. This plugin provides a Tabbed UI and more for the Basic Meeting List Toolbox (BMLT).  Simply put the shortcode [bmlt_tabs] into a Wordpress page to get your very own tabbed interface to BMLT.  Not into a tabbed interface?  There is a shortcode parameter to display meetings without tabs.  This would be useful for Areas that have fewer meetings.  This plugin also provides various shortcodes to return the number of meetings and groups in specified service bodies.  Please visit settings - BMLT Tabbed UI for shortcode instructions.

== Installation ==

1. Place the 'crouton' folder in your '/wp-content/plugins/' directory.

2. Activate crouton.

3. Enter BMLT Root Server into Settings - BMLT Tabs

4. Enter shortcode into a new or existing Wordpress page.

5. For shortcode usage see Settings - BMLT Tabs.

6. View your site.

7. Adjust the CSS of your theme as needed.

== Screenshots ==

<a href="https://orlandona.org/meetings/">Go to this Web page to get an idea of how this works.</a>

== Changelog ==

= 2.6.0 =
* Added multilingual support [#88]
* Added support for setting distance units (miles, kilometers and nautical miles) [#90]
* Fix for Gutenburg autosave issue [#81]
* Fix for regression with has_tabs="0" and header="0" not group by day [#95]
* Dropdowns and tabs refactored to use client side rendering (speed improvements) [#53]
* Removed used_formats feature which has been deprecated for some time [#100]

= 2.4.2 + 2.5.3 =
* Fix for [meeting_count] and [group_count] render issues if they appeared after [bmlt_tabs] [#86]

= 2.4.1 =
* Fix for empty div with the new map feature [#87]

= 2.4.0 =
* Added companion map feature. [#52]
* More robust way to count groups. [#85]
* Added case-insensitive sorting.

= 2.3.2 =
* Version bump, IE fix for city view.

= 2.3.1 =
* Added ability to only display used formats. [#73]
* Fixed support for Internet Explorer. [#72]

= 2.3.0 =
* Added ability to add extra meetings. [#66]
* Fixed default caching to be disabled and generally broken caching mechanism.
* Added debugging capabilities to the docker image.

= 2.2.1 =
* Selected dropdown option not always being respected for new searchable dropdown, however selected option was. [#64]

= 2.2.0 =
* Add chosen for searchable dropdown service body config. [#60]

= 2.1.4 =
* Another fix for greedy url handling. [#57]

= 2.1.3 =
* Fixed a bug with greedy file path handling causing root server URLs to be munged. [#57]

= 2.1.2 =
* Made an error in the minimum version required.

= 2.1.1 =
* Tested for 5.0.0

= 2.1.0 =
* Added state-dropdown option.
* Fixed some issues with how CSS was applied to the buttons with Javascript, instead applying classes.
* Bug fix javascript error for when [meeting_count] or [group_count] is used alone. [#54]
* Bug fix for custom query in shortcode which wasn't working at all [#50]

= 2.0.0 =
* Major rewrite to render the plugin on the client side.
* Time formatting has been reimplemented using moment.js (this is a breaking change, use these format codes http://momentjs.com/docs/#/displaying/, "HH:mm" for 24hr formatting)
* Added the ability to recurse service bodies.
* Added the ability to do custom queries at a default, shortcode and url level.
* Added the ability to set and save custom CSS from the admininstration section.
* Added sub-province (county) dropdown option.
* Added area-dropdown option.
* Added option to show distance to meeting. This feature is available only in secure contexts (HTTPS), in some or all supporting browsers. A list of supported browsers can be found here https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition#Browser_compatibility.
* Compatability fixes for PHP 7.2.9
* Removed hardcodings

= 1.0.1 =
* Some code cleanups.
* Disabled broken geolocation lookups until it can be reimplemented.

= 1.0.0 =
* Forked from "bmlt-tabbed-ui" plugin.
