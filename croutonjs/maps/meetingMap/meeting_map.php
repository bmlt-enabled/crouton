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
        public $options = array();

        public function __construct($options)
        {
            $this->options = $options;
        }
        // phpcs:disable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
        public function enqueueFrontendFiles()
        {
            $this->options['tile_provider'] = isset($this->options['tile_provider']) ? $this->options['tile_provider'] : 'OSM';
            if ($this->options['tile_provider'] == 'google') {
                wp_enqueue_style("meeting_map", plugin_dir_url(__FILE__)."css/meeting_map.css", false, filemtime(plugin_dir_path(__FILE__)."css/meeting_map.css"), false);
                wp_enqueue_script("gmapsDelegate", plugin_dir_url(__FILE__)."js/gmapsDelegate.js", false, filemtime(plugin_dir_path(__FILE__)."js/gmapsDelegate.js"), false);
                wp_enqueue_script("meeting_map", plugin_dir_url(__FILE__)."js/meeting_map.js", false, filemtime(plugin_dir_path(__FILE__)."js/meeting_map.js"), false);
            } else {
                wp_enqueue_style("leaflet", plugin_dir_url(__FILE__)."css/leaflet.css", false, filemtime(plugin_dir_path(__FILE__)."css/leaflet.css"), false);
                wp_enqueue_style("meeting_map", plugin_dir_url(__FILE__)."css/meeting_map.css", false, filemtime(plugin_dir_path(__FILE__)."css/meeting_map.css"), false);
                wp_enqueue_script("leaflet", plugin_dir_url(__FILE__)."js/leaflet.js", false, filemtime(plugin_dir_path(__FILE__)."js/leaflet.js"), false);
                //wp_enqueue_script("geocoder", plugin_dir_url(__FILE__) . "js/nominatim.js", false, filemtime(plugin_dir_path(__FILE__) . "js/nominatim.js"), false);
                wp_enqueue_script("osmDelegate", plugin_dir_url(__FILE__)."js/osmDelegate.js", false, filemtime(plugin_dir_path(__FILE__)."js/osmDelegate.js"), false);
                wp_enqueue_script("meeting_map", plugin_dir_url(__FILE__)."js/meeting_map.js", false, filemtime(plugin_dir_path(__FILE__)."js/meeting_map.js"), false);
            }
        }
        public function className()
        {
            return "MeetingMap";
        }
        public function getMapJSConfig($params)
        {
            $params['tile_provider'] = isset($params['tile_provider']) ? $params['tile_provider'] : 'OSM';
            switch ($params['tile_provider']) {
                case 'MapBox':
                    $params['tile_url'] =
                    'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}';
                    $params['tile_params'] = array(
                    'attribution'   => 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                    'id'            => 'mapbox.streets',
                    'accessToken'   => $params['api_key']
                    );
                    break;
                case "OSM DE":
                    $params['tile_url'] =
                    'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png';
                    $params['tile_params'] = array(
                    'attribution'   => 'Map data &copy; <a href="https://www.openstreetmap.de/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                    "maxZoom"       => '18',
                    //'subdomains'    => '["a","b","c"]'
                    );
                    break;
                case 'custom':
                    // http://tileserver.maptiler.com/campus/{z}/{x}/{y}.png
                    $params['tile_params'] = array(
                    'attribution'   => $params['tile_attribution'],
                    "maxZoom"       => '18',
                    );
                    break;
                case "OSM":
                default:
                    $params['tile_url'] =
                        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                    $params['tile_params'] = array(
                        'attribution'   => 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                        "maxZoom"       => '18',
                    );
                    break;
            }
            if (!isset($params['region_bias'])) {
                $params['region_bias'] = "";
            }
            if (!isset($params['bounds_north'])) {
                $params['bounds_north'] = "";
            }
            if (!isset($params['bounds_east'])) {
                $params['bounds_east'] = "";
            }
            if (!isset($params['bounds_south'])) {
                $params['bounds_south'] = "";
            }
            if (!isset($params['bounds_west'])) {
                $params['bounds_west'] = "";
            }
            if (!isset($params['lat'])) {
                $params['lat'] = "";
            }
            if (!isset($params['lng'])) {
                $params['lng'] = "";
            }
            if (!isset($params['zoom'])) {
                $params['zoom'] = "";
            }
            if (!isset($params['nominatim_url'])) {
                $params['nominatim_url'] = "";
            }
            if (!isset($params['api_key'])) {
                $params['api_key'] = "";
            }
            $ret = $this->createJavascriptConfig($params).", null,";
            $lat = $params['lat'];
            $lng = $params['lng'];
            $zoom = $params['zoom'];
            $ret .= "{'latitude':'$lat','longitude':'$lng','zoom':'$zoom'},true";
            return $ret;
        }
        /** Emulates the behavior from PHP 7 */
        private function hsc($field)
        {
            return htmlspecialchars($field, ENT_COMPAT);
        }
        private function createJavascriptConfig($options)
        {
            $ret = '{';
            //$ret .= 'BMLTPlugin_files_uri:\''.$this->hsc($this->getPluginPath()).'?\',' . (defined('_DEBUG_MODE_') ? "\n" : '');
            $ret .= "BMLTPlugin_images:'".$this->hsc(plugin_dir_url(__FILE__)."map_images")."'," . (defined('_DEBUG_MODE_') ? "\n" : '');
            $ret .= "BMLTPlugin_lang_dir:'".$this->hsc(plugin_dir_url(__FILE__)."lang")."'," . (defined('_DEBUG_MODE_') ? "\n" : '');
            $ret .= "BMLTPlugin_throbber_img_src:'".$this->hsc(plugin_dir_url(__FILE__)."map_images/Throbber.gif")."'," . (defined('_DEBUG_MODE_') ? "\n" : '');
            $ret .= 'region:"'.$options['region_bias'].'",';
            $ret .= 'bounds:{';
                $ret .= ' "north": "'.$options['bounds_north'].'",';
                $ret .= ' "east": "'.$options['bounds_east'].'",';
                $ret .= ' "south": "'.$options['bounds_south'].'",';
                $ret .= ' "west": "'.$options['bounds_west'].'"';
            $ret .= '},';
            $ret .= 'tileUrl:"'.$options['tile_url'].'",';
            $ret .= 'nominatimUrl:"'.$options['nominatim_url'].'",';
            $ret .= 'tileOptions:{';
            foreach ($options['tile_params'] as $key => $value) {
                $ret .= " '".$key."': '".$value."',";
            }
            $ret .= '},';
            $ret .= 'api_key:"'.$options['api_key'].'",';
            $ret .= '}';
            return $ret;
        }
    }
}
