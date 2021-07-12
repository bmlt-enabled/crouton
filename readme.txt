=== crouton ===

Contributors: odathp, radius314, pjaudiomv, californiasteve9390, Paul N, alanb2718, jbraswell
Tags: na, meeting list, meeting finder, maps, recovery, addiction, webservant, bmlt
Requires at least: 4.0
Required PHP: 5.6
Tested up to: 5.7.1
Stable tag: 3.12.2
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
crouton implements a Tabbed UI for BMLT.

== Description ==

Crouton was forked from BMLT Tabbed UI plugin in 2018.  This plugin provides a Tabbed UI and more for the Basic Meeting List Toolbox (BMLT).  Simply put the shortcode [bmlt_tabs] into a Wordpress page to get your very own tabbed interface to BMLT.  Not into a tabbed interface?  There is a shortcode parameter to display meetings without tabs.  This would be useful for Areas that have fewer meetings.  This plugin also provides various shortcodes to return the number of meetings and groups in specified service bodies.  Please visit settings - BMLT Tabbed UI for shortcode instructions.

== Installation ==

1. Place the 'crouton' folder in your '/wp-content/plugins/' directory.

2. Activate crouton.

3. Enter BMLT Root Server into Settings - BMLT Tabs

4. Enter shortcode into a new or existing Wordpress page.

5. For shortcode usage see Settings - BMLT Tabs.

6. View your site.

7. Adjust the CSS of your theme as needed.

== Screenshots ==

https://demo.bmlt.app/crouton

== Changelog ==

= 3.12.2 =
* Share button
* Added additional Dutch and German translations, fixed missing item for Italian.
* Additional helper functions for templating for venue types added.  `isInPersonOrHybrid`, `isInPersonOnly`, `isVirtualOrHybrid`.

= 3.12.1 =
* Added a new feature to hide Weekday headers when filtering  `hide_byday_headers="true"`.
* Fixes issue with Weekday headers on filtered view which showing days of the week where there is no data. [#332]

= 3.12.0 =
* Venue Type Dropdown Filter. [#327]
* Fixed blog link for Google API for maps. [#330]

= 3.11.15 =
* Added support for Dutch. [#324]

= 3.11.14 =
* Add support for [service_body_names] shortcode
* Improve documentation of how shortcode parameters interact [#265]

= 3.11.13 =
* Fix for regressions of descriptions with tomato.

= 3.11.12 =
* Fix for descriptions for VM, TC, and HY in non-English languages.

= 3.11.11 =
* Fix for case when there are no formats for a meeting [#309]

= 3.11.10 =
* Allow for different codes for VM, TC, and HY in non-English languages.
* New theme: gold-coast. [#304]

= 3.11.9 =
* Gracefully handle scenarios when there are no format descriptions returned for a specific language.
* Responsive overflow fixes on some elements.
* Added support `croutonjsdebug=1` querystring parameter for disabling minification for croutonjs.

= 3.11.8 =
* Fixed another edge case where meetings on the current day could be sorted incorrectly.

= 3.11.7 =
* Fixed an issue where meetings on the current day could be sorted incorrectly.

= 3.11.6 =
* Added support for upcoming root server time_zone field, primarly for use with virtual-na.org
* New theme: seattle-rain
* New theme: quebec

= 3.11.5 =
* Changed meeting-additional-info css to work better with darker themes.
* Additional Polish (pl-PL) translations. [#283]

= 3.11.4 =
* New theme asheboro to match root server aesthetic.

= 3.11.3 =
* Add field virtual_meeting_additional_info to Meeting Data Template. This is intended to hold information such as a meeting ID and password (requires root server 2.15.4).
* Added observer fields. [#268]

= 3.11.2 =
* Bug fix for handling long URLs in 3rd column. [#231]

= 3.11.1 =
* Bug fix with multi-lingual support. [#254]

= 3.11.0 =
* Custom query support for [crouton_map]. [#242]
* Queries optimized, eliminated one. [#238]
* Support for if/else operators on custom handlebars helpers. [#245]
* Support for VM only meetings through metadata template enhancement. [#249]
* Added hasFormats custom helper.
* Better no query results messaging. [#251]

= 3.10.1 =
* Fixes for hybrid meetings to not include logic with VM + TC.

= 3.10.0 =
* Hybrid meeting support.

= 3.9.6 =
* ru-RU translations.

= 3.9.5 =
* Added the ability to show only unpulished meetings with `include_unpublished="-1"` (requires root server v2.15.2).

= 3.9.4 =
* Added initial map coordinates search feature.
* Added the ability to use new shortcode option `include_unpublished="1"` to display unpublished meetings (requires root server v2.15.2)
* Added new theme: Truth.

= 3.9.3 =
* Compatibility support for WP 5.4.
* Added new theme: Florida-Nights.
* Fix for legacy issue with da-DK in the root server where it doesn't follow ISO 639 standards.

= 3.9.2 =
* Null condition fixes for meeting_data_template and metadata_template.

= 3.9.1 =
* Swedish Translations

= 3.9.0 =
* Native support for Virtual Meetings (VM format) that automatically shows the new virtual_meeting_link and phone_meeting_number (requires root server 2.15.0).
* Native support for QR codes for Virtual Meetings (VM format) with new shortcodes `show_qrcode="1"`.
* Native support for Temporary Closed (TC format) that automatically displays a flag and the description field text.
* Three new themes: Orange Monster, One-Nine and Frog.
* CSS changes to support virtual meetings + responsive displays.
* Fix for configuration screen saved confirmation.
* Removal of misconfigured root server header on admin UI.

= 3.8.8 =
* Fix for MarkerClusterer not working.  [#216]

= 3.8.7 =
* Fix for IE11 by disabling MarkerCluster which isn't supported.

= 3.8.6 =
* Added ability to use train, bus lines and custom BMLT fields.

= 3.8.5 =
* Added feature to allow Handlebars built-in helpers (http://handlebarsjs.com/guide/builtin-helpers.html#if)

= 3.8.4 =
* Fix for metadata_template not pulling non-standard fields.

= 3.8.3 =
* Fix for upgrade issues for 3.8.x for templates. [#212]

= 3.8.2 =
* Fix for template shortcodes not working until you saved on the admin page the first time.

= 3.8.1 =
* Added feature to keep tabs on dropdown filtering (e.g. `filter_tabs="1"`) [#21]
* Added feature to fully customize content template of the 3rd (metadata) column. [#159]

= 3.7.1 =
* Fix for header shortcode not working. [#208]

= 3.7.0 =
* Added new shortcode tag `default_filter_dropdown` for specifying any dropdown default selection (e.g `default_filter_dropdown="formats=closed"`

= 3.6.1 =
* Fix for has_languages dropdown which wasn't working.

= 3.6.0 =
* Added row click and highlight map synchronization [#189]
* Added languages format selection dropdown [#200]
* Added translations for [crouton_map] feature. [#195]

= 3.5.2 =
* Fix for backward compatibility for include_city_button="0" (for hiding City button)

= 3.5.1 =
* Fix javascript null callback error affecting "show_map" shortcode. [#190]

= 3.5.0 =
* Search by map text, click or automatically by location with [crouton_map] shortcode. [#126]
* Added checkbox for using tomato as root server. [#181]
* Added neighborhood dropdown feature. [#175]
* Added "sezf" theme.
* Fixed bug with multiple meetings and clustering before clicking (red pins).
* Swapped red (multiple) and blue (single) meeting pins, for consistency sake.

= 3.4.7 =
* pt-BR translations added.

= 3.4.6 =
* Added on_complete callback for croutonjs
* pl-PL translations added.

= 3.4.5 =
* Fix for localizing Map modal word [#165]

= 3.4.4 =
* fa-IR translations added [#164]

= 3.4.3 =
* de-DE translations added [#162]

= 3.4.2 =
* Added the ability to override the language once already initialized [#163]
* Added media queries patch for "kevin" theme. [#155]
* Fix for meeting formats displaying in the selected language. [#161]
* Fix for bug with Custom CSS escaping.

= 3.4.1 =
* Fix for bug with backward compatibility with `meeting_data_template`.

= 3.4.0 =
* Added the ability to create a custom template for meeting data [#154]
* Added the ability to set pre-packaged CSS themes.

= 3.3.3 =
* Fix for greedy dropdown filtering of formats on HTML attributions. [#152]

= 3.3.2 =
* Fix for regression in the recursive flag behavior. [#149]
* Fixes for Italian translations.

= 3.3.1 =
* Fix for group by sort not working [#147]

= 3.3.0 =
* Added the ability to change the start of the week sequence. [#143]
* Added the ability to create custom group by buttons using `button_filters`.
* All shortcodes can be overridden via querystring for the Wordpress plugin. [#141]
* Fixes for sorting results for auto timezone.

** Breaking Changes **
* #city selector button was replaced with the class .filterButton.
* croutonjs no longer support `include_city_button`, use `button_filters` instead.  Wordpress plugin is not affected, however users should move to `button_filters_options`.

= 3.2.5 =
* Added translation of UK English (en-UK).
* Allowed for setting language via querystring.

= 3.2.4 =
* Added translation for New Zealand and Austrailian English (en-NZ and en-AU).

= 3.2.3 =
* Added translation for US Spanish (es-US).

= 3.2.2 =
* Fixed an edge case with plugins that might use handlebars.js and clash with croutonjs.

= 3.2.0 =
* Added new shortcode option to be able to control sort results.
* Fix for default time sort not working [#132]

= 3.1.1 =
* Several minor bug fixes.
* Extra meetings enabled flag is not always checked now.

= 3.1.0 =
* Distance based searches from browser location now possible
* Adding <div> wrapper to make selection a little better for hiding [#125]

= 3.0.6 =
* Added banner

= 3.0.5 =
* Temporary patch for language information not rendering [#124]

= 3.0.4 =
* Legacy logic regression for parent service bodies [#121]

= 3.0.3 =
* Bundle croutonjs without jQuery for Wordpress which automatically loads it, to prevent clashing [#119]
* Fix for shortcode croutonjs initializing issue [#118]

= 3.0.2 =
* Fix for filemtime calculation for cache busting CSS + JS files for crouton [#117]
* Fix for extra_meetings and several other warnings [#116]
* Using minified versions of crouton.js and crouton.css.

= 3.0.1 =
* Fix for virtual meetings not rendering with WP shortcode [#115]

= 3.0.0 =
* Rewritten to load fully with javascript inside a browser. This is enables usage on any website, not just Wordpress. [#98]
* Text from "comments" field that starts with tel: or http(s) in will be turned into a URL [#104]
* Timezone and auto adjust to users' local timezone, it will also automatically backfill the day if the timezone causes it to shift. [#103]
* Fix for non-display on IE11 [#106]
* Fix for non-display on K-meleon [#114]

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
