=== crouton ===  

Contributors: Jack S Florida Region, odathp, radius314, pjaudiomv
Tags: na, meeting list, meeting finder, maps, recovery, addiction, webservant, bmlt
Requires at least: 4.0
Required PHP: 5.6
Tested up to: 4.9.8
Stable tag: 1.0.1
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

= UNRELEASED =

* Added sub province (county) dropdown option.
* Added area dropdown option.
* Added option to show distance to meeting. This feature is available only in secure contexts (HTTPS), in some or all supporting browsers. A list of supported browsers can be found here https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition#Browser_compatibility.

= 1.0.1 =

* Some code cleanups.
* Disabled broken geolocation lookups until it can be reimplemented.

= 1.0.0 = 

* Forked from "bmlt-tabbed-ui" plugin.