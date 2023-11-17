<?php
namespace MeetingMap;

/* Disallow direct access to the plugin file */
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    // die('Sorry, but you cannot access this page directly.');
}


if (!class_exists("MeetingMap/Controller")) {
    class Controller
    {
        // phpcs:enable PSR1.Classes.ClassDeclaration.MissingNamespace
        public $optionsName = 'bmlt_meeting_map_options';
        public $options = array();

        public function __construct()
        {
            $this->getOptions();
            add_action("crouton_map_enqueue_scripts", array(&$this, "enqueueFrontendFiles"), 0);
            add_filter("crouton_map_create_control", array(&$this, "createMeetingMap"), 10, 4);
        }
        public function enhanceTileProvider()
        {
            switch ($this->options['tile_provider']) {
                case 'MapBox':
                    $this->options['tile_url'] =
                    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
                    $this->options['tile_params'] = array(
                    'attribution'   => 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    'id'            => 'mapbox.streets',
                    'accessToken'   => $this->options['api_key']
                    );
                    break;
                case "OSM DE":
                    $this->options['tile_url'] =
                    'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png';
                    $this->options['tile_params'] = array(
                    'attribution'   => 'Map data &copy; <a href="https://www.openstreetmap.de/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                    "maxZoom"       => '18',
                    //'subdomains'    => '["a","b","c"]'
                    );
                    break;
                case 'custom':
                    // http://tileserver.maptiler.com/campus/{z}/{x}/{y}.png
                    $this->options['tile_params'] = array(
                    'attribution'   => $this->options['tile_attribution'],
                    "maxZoom"       => '18',
                    );
                    break;
                case "OSM":
                default:
                    $this->options['tile_url'] =
                    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                    $this->options['tile_params'] = array(
                    'attribution'   => 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                    "maxZoom"       => '18',
                    );
                    break;
            }
        }
        // phpcs:disable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
        public function enqueueFrontendFiles()
        {
            if ($this->options['tile_provider'] == 'google') {
                wp_enqueue_style("meeting_map", plugin_dir_url(__FILE__) . "css/meeting_map.css", false, filemtime(plugin_dir_path(__FILE__) . "css/meeting_map.css"), false);
                wp_enqueue_script("gmapsDelegate", plugin_dir_url(__FILE__) . "js/gmapsDelegate.js", false, filemtime(plugin_dir_path(__FILE__) . "js/gmapsDelegate.js"), false);
                wp_enqueue_script("meeting_map", plugin_dir_url(__FILE__) . "js/meeting_map.js", false, filemtime(plugin_dir_path(__FILE__) . "js/meeting_map.js"), false);
            } else {
                wp_enqueue_style("leaflet", plugin_dir_url(__FILE__) . "css/leaflet.css", false, filemtime(plugin_dir_path(__FILE__) . "css/leaflet.css"), false);
                wp_enqueue_style("meeting_map", plugin_dir_url(__FILE__) . "css/meeting_map.css", false, filemtime(plugin_dir_path(__FILE__) . "css/meeting_map.css"), false);
                wp_enqueue_script("leaflet", plugin_dir_url(__FILE__) . "js/leaflet.js", false, filemtime(plugin_dir_path(__FILE__) . "js/leaflet.js"), false);
                //wp_enqueue_script("geocoder", plugin_dir_url(__FILE__) . "js/nominatim.js", false, filemtime(plugin_dir_path(__FILE__) . "js/nominatim.js"), false);
                wp_enqueue_script("osmDelegate", plugin_dir_url(__FILE__) . "js/osmDelegate.js", false, filemtime(plugin_dir_path(__FILE__) . "js/osmDelegate.js"), false);
                wp_enqueue_script("meeting_map", plugin_dir_url(__FILE__) . "js/meeting_map.js", false, filemtime(plugin_dir_path(__FILE__) . "js/meeting_map.js"), false);
            }
        }
        /**
         * Retrieves the plugin options from the database.
         * @return array
         */
        public function getOptions()
        {
            // Don't forget to set up the default options
            if (!$theOptions = get_option($this->optionsName)) {
                $theOptions = array(
                    'root_server' => '',
                    'api_key' => '',
                    'lat' => 52.533849,
                    'lng' => 13.418893,
                    'zoom' => 12
                );
                update_option($this->optionsName, $theOptions);
            }
            $this->options = $theOptions;
            if (!isset($this->options['tile_provider'])) {
                $this->options['tile_provider'] = 'OSM';
            }
            if (!isset($this->options['nominatim_url'])) {
                $this->options['nominatim_url'] = 'https://nominatim.openstreetmap.org/';
            }
            if (!isset($this->options['lang'])) {
                $this->options['lang'] = 'en';
            }
            if (!isset($this->options['tile_url'])) {
                $this->options['tile_url'] = '';
            }
            if (!isset($this->options['tile_attribution'])) {
                $this->options['tile_attribution'] = '';
            }
            if (!isset($this->options['region_bias'])) {
                $this->options['region_bias'] = '';
            }
        }
        public function createMeetingMap($ret, $lang, $control, $detailsPage = '')
        {
            include(dirname(__FILE__)."/lang/translate_".$lang.".php");
            $lat = $this->options['lat'];
            $lng = $this->options['lng'];
            $zoom = $this->options['zoom'];
            $ret = "$control = new MeetingMap( ".$this->createJavascriptConfig($translate, $this->options, $detailsPage).", null,";
            $ret .= "{'latitude':$lat,'longitude':$lng,'zoom':$zoom},true);";
            return $ret;
        }
        /** Emulates the behavior from PHP 7 */
        private function hsc($field)
        {
            return htmlspecialchars($field, ENT_COMPAT);
        }
        private function createJavascriptConfig($translate, $options, $detailsPage = null)
        {
            $this->enhanceTileProvider();
            $ret = '{';
            $ret .= 'no_meetings_found:"'.$this->hsc($translate['NO_MEETINGS']).'",';
            $ret .= 'server_error:"'.$this->hsc($translate['SERVER_ERROR']).'",';
            $ret .= 'weekdays:'.$this->hsc($translate['WEEKDAYS']).',';
            $ret .= 'weekdays_short:'.$this->hsc($translate['WKDYS']).',';
            $ret .= 'menu_search:"'.$this->hsc($translate['MENU_SEARCH']).'",';
            $ret .= 'searchPrompt:"'.$this->hsc($translate['SEARCH_PROMPT']).'",';
            $ret .= 'menu_filter:"'.$this->hsc($translate['MENU_FILTER']).'",';
            $ret .= 'menu_list:"'.$this->hsc($translate['MENU_LIST']).'",';
            $ret .= 'address_lookup_fail:"'.$this->hsc($translate['ADDRESS_LOOKUP_FAIL']).'",';
            $ret .= 'menu_nearMe:"'.$this->hsc($translate['MENU_NEAR_ME']).'",';
            $ret .= 'menu_fullscreen:"'.$this->hsc($translate['MENU_FULLSCREEN']).'",';
            $ret .= 'menu_tooltip:"'.$this->hsc($translate['MENU_TOOLTIP']).'",';
            //$ret .= 'BMLTPlugin_files_uri:\''.$this->hsc($this->getPluginPath()).'?\',' . (defined('_DEBUG_MODE_') ? "\n" : '');
            $ret .= "BMLTPlugin_images:'".$this->hsc($this->getPluginPath()."/map_images")."'," . (defined('_DEBUG_MODE_') ? "\n" : '');
            $ret .= "BMLTPlugin_lang_dir:'".$this->hsc($this->getPluginPath()."/lang")."'," . (defined('_DEBUG_MODE_') ? "\n" : '');
            $ret .= "BMLTPlugin_throbber_img_src:'".$this->hsc($this->getPluginPath()."/map_images/Throbber.gif")."'," . (defined('_DEBUG_MODE_') ? "\n" : '');
            $ret .= 'more_info_text:"'.$this->hsc($translate['more_info']).'",';
            $ret .= 'map_link_text:"'.$this->hsc($translate['OPEN_GOOGLE']).'",';
            $ret .= 'hygene_header:"'.$this->hsc($translate['Hygene_Header']).'",';
            $ret .= 'hygene_button:"'.$this->hsc($translate['Hygene_Button']).'",';
            $ret .= 'hygene_back:"'.$this->hsc($translate['Hygene_Back']).'",';
            $ret .= 'region:"'.$options['region_bias'].'",';
            $ret .= 'bounds:{';
                $ret .= ' "north": "'.$this->options['bounds_north'].'",';
                $ret .= ' "east": "'.$this->options['bounds_east'].'",';
                $ret .= ' "south": "'.$this->options['bounds_south'].'",';
                $ret .= ' "west": "'.$this->options['bounds_west'].'"';
            $ret .= '},';
            $ret .= 'time_format:"'.$this->options['time_format'].'",';
            $ret .= 'tileUrl:"'.$this->options['tile_url'].'",';
            $ret .= 'nominatimUrl:"'.$this->options['nominatim_url'].'",';
            $ret .= 'tileOptions:{';
            foreach ($this->options['tile_params'] as $key => $value) {
                $ret .= " '".$key."': '".$value."',";
            }
            $ret .= '},';
            $ret .= 'Meetings_on_Map:"'.$this->hsc($translate['Meetings_on_Map']).'",';
            $ret .= 'meeting_details_href:"'.$this->getMeetingDetailsHref($detailsPage).'",';
            $ret .= 'start_week:2,';
            $ret .= 'api_key:"'.$this->options['api_key'].'",';
            $ret .= '}';
            return $ret;
        }
        private function getMeetingDetailsHref($detailsPage)
        {
            if (!is_null($detailsPage)) {
                return $detailsPage;
            }
            $croutonOptions = get_option('bmlt_tabs_options');
            return $croutonOptions
                ? (isset($croutonOptions['meeting_details_href']) ? $croutonOptions['meeting_details_href'] : '')
                : '';
        }
        protected function getPluginPath()
        {
            // phpcs:enable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
            return plugin_dir_url(__FILE__);
        }
    }
}
