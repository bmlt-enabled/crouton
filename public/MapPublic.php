<?php
namespace Crouton;

/* Disallow direct access to the plugin file */
if (! defined('WPINC')) {
    die;
}

if (!class_exists("Crouton\MapPublic")) {
    class MapPublic
    {
        private MapOptions $map;
        public function __construct($map)
        {
            $this->map = $map;
        }
        public function enqueueFrontendFiles()
        {
            if ($this->map->isGoogle()) {
                wp_enqueue_script("gmapsDelegate", plugin_dir_url(__DIR__)."croutonjs/dist/crouton-gmaps.min.js", false, filemtime(plugin_dir_path(__DIR__)."croutonjs/dist/crouton-gmaps.min.js"), false);
            } else {
                wp_enqueue_style("leaflet", plugin_dir_url(__DIR__)."croutonjs/dist/crouton-leaflet.min.css", false, filemtime(plugin_dir_path(__DIR__)."croutonjs/dist/crouton-leaflet.min.css"), false);
                wp_enqueue_script("leaflet", plugin_dir_url(__DIR__)."croutonjs/dist/crouton-map.min.js", false, filemtime(plugin_dir_path(__DIR__)."croutonjs/dist/crouton-map.min.js"), false);
            }
        }
        public function className()
        {
            return "MeetingMap";
        }
        public function getMapJSConfig($params, $croutonMap = false)
        {
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
            unset($params['map_search']);
            if ($croutonMap) {
                $this->addCroutonMapParameters($params);
            }
            return $this->createJavascriptConfig($params);
        }
        private function addCroutonMapParameters(&$params)
        {
            $params['map_search'] = [];
            if (isset($params['map_search_option'])) {
                foreach (explode(",", $params['map_search_option']) as $item) {
                    $setting = explode(":", $item);
                    $key = trim($setting[0]);
                    $value = trim($setting[1]);
                    $params['map_search'][$key] = $value;
                }
            }
            if (!empty($params['map_search']['latitude'])) {
                $params['lat'] = $params['map_search']['latitude'];
            }
            if (!empty($params['map_search_latitude'])) {
                $params['lat'] = $params['map_search_latitude'];
                $params['map_search']['latitude'] = $params['map_search_latitude'];
            }
            if (!empty($params['map_search']['longitude'])) {
                $params['lng'] = $params['map_search']['longitude'];
            }
            if (!empty($params['map_search_longitude'])) {
                $params['lng'] = $params['map_search_longitude'];
                $params['map_search']['longitude'] = $params['map_search_longitude'];
            }
            if (!empty($params['map_search']['zoom'])) {
                $params['zoom'] = $params['map_search']['zoom'];
            }
            if (!empty($params['map_search_zoom'])) {
                $params['zoom'] = $params['map_search_zoom'];
                $params['map_search']['zoom'] = $params['map_search_zoom'];
            }
            if (!empty($params['map_search_width'])) {
                $params['map_search']['width'] = $params['map_search_width'];
            }
            if (!empty($params['map_search_auto'])) {
                $params['map_search']['auto'] = $params['map_search_auto'];
            }
            if (!empty($params['map_search_location'])) {
                $params['map_search']['location'] = $params['map_search_location'];
            }
            if (!empty($params['map_search_location'])) {
                $params['map_search']['location'] = $params['map_search_location'];
            }
            if (!empty($params['map_search_coordinates_search'])) {
                $params['map_search']['coordinates_search'] = $params['map_search_ coordinates_search'];
            }
        }
        /** Emulates the behavior from PHP 7 */
        private function hsc($field)
        {
            return htmlspecialchars($field, ENT_COMPAT);
        }
        private function createJavascriptConfig($options)
        {
            $ret = [];
            $ret["BMLTPlugin_images"] = $this->hsc(plugin_dir_url(__DIR__)."croutonjs/mapImages");
            $ret["BMLTPlugin_throbber_img_src"] = $this->hsc(plugin_dir_url(__DIR__)."croutonjs/mapImages/#f");
            $ret['region'] = $options['region_bias'];
            $ret['bounds'] = [
                "north" => $options['bounds_north'],
                "east"  => $options['bounds_east'],
                "south" => $options['bounds_south'],
                "west"  => $options['bounds_west']
            ];
            $ret['tileUrl'] = $options['tile_url'];
            $ret['clustering'] = $options['clustering'];
            $ret['nominatimUrl'] = $options['nominatim_url'];
            $ret['tileOptions'] = $options['tile_params'];
            $ret['api_key'] = $options['api_key'];
            $ret['lat'] = $options['lat'];
            $ret['lng'] = $options['lng'];
            $ret['zoom'] = $options['zoom'];
            $ret['minZoom'] = $options['min_zoom'];
            $ret['maxZoom'] = $options['max_zoom'];
            $ret['filter_visible'] = $options['filter_visible'];
            if (!empty($options['center_me'])) {
                $ret['centerMe'] = $options['center_me'];
            }
            if (!empty($options['goto'])) {
                $ret['goto'] = $options['goto'];
                if (isset($_GET['goto'])) {
                    $ret['centerMe'] = '';
                }
            }
            if (isset($options['map_search'])) {
                $ret['map_search'] = $options['map_search'];
            }
            $ret["marker_contents_template"] = $options['marker_contents_template'];
            if (isset($options['noMap'])) {
                $ret['noMap'] = $options['noMap'];
            }
            return json_encode($ret);
        }
    }
}
