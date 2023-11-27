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

        public function __construct(&$options)
        {
            if (!isset($options['region_bias'])) {
                $options['region_bias'] = "";
            }
            if (!isset($options['bounds_north'])) {
                $options['bounds_north'] = "";
            }
            if (!isset($options['bounds_east'])) {
                $options['bounds_east'] = "";
            }
            if (!isset($options['bounds_south'])) {
                $options['bounds_south'] = "";
            }
            if (!isset($options['bounds_west'])) {
                $options['bounds_west'] = "";
            }
            if (!isset($options['lat'])) {
                $options['lat'] = "";
            }
            if (!isset($options['lng'])) {
                $options['lng'] = "";
            }
            if (!isset($options['zoom'])) {
                $options['zoom'] = "";
            }
            if (!isset($options['nominatim_url'])) {
                $options['nominatim_url'] = "";
            }
            if (!isset($options['api_key'])) {
                $options['api_key'] = "";
            }
            if (!isset($options['tile_provider'])) {
                if (!empty($options['google_api_key'])) {
                    $options['tile_provider'] = 'google';
                    $options['api_key'] = $options['google_api_key'];
                } else {
                    $options['tile_provider'] = "OSM";
                    $options['api_key'] = "";
                }
            }
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
                wp_enqueue_script("google.markercluster", plugin_dir_url(__FILE__)."js/google.markercluster.min.js", false, filemtime(plugin_dir_path(__FILE__)."js/google.markercluster.min.js"), false);
            } else {
                wp_enqueue_style("leaflet", plugin_dir_url(__FILE__)."css/leaflet.css", false, filemtime(plugin_dir_path(__FILE__)."css/leaflet.css"), false);
                wp_enqueue_style("leaflet-markercluster-default", plugin_dir_url(__FILE__)."css/MarkerCluster.Default.css", false, filemtime(plugin_dir_path(__FILE__)."css/MarkerCluster.Default.css"), false);
                wp_enqueue_style("leaflet-markercluster", plugin_dir_url(__FILE__)."css/MarkerCluster.css", false, filemtime(plugin_dir_path(__FILE__)."css/MarkerCluster.css"), false);
                wp_enqueue_style("meeting_map", plugin_dir_url(__FILE__)."css/meeting_map.css", false, filemtime(plugin_dir_path(__FILE__)."css/meeting_map.css"), false);
                wp_enqueue_script("leaflet", plugin_dir_url(__FILE__)."js/leaflet.js", false, filemtime(plugin_dir_path(__FILE__)."js/leaflet.js"), false);
                wp_enqueue_script("leaflet.markercluster", plugin_dir_url(__FILE__)."js/leaflet.markercluster.js", false, filemtime(plugin_dir_path(__FILE__)."js/leaflet.markercluster.js"), false);
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
        public function adminSection()
        {
            ?>
                    <div style="padding: 0 15px;" class="postbox">
                         <h3>Map Tile Provider</h3>
                        <select name="tile_provider" id="tile_provider">
                            <option value="OSM" <?php echo ( 'OSM' == $this->options['tile_provider'] ? 'selected' : '' )?>>Open Street Map</option>
                            <option value="OSM DE" <?php echo ( 'OSM DE' == $this->options['tile_provider'] ? 'selected' : '' )?>>German Open Street Map</option>
                            <option value="google" <?php echo ( 'google' == $this->options['tile_provider'] ? 'selected' : '' )?>>Google Maps</option>
                            <option value="custom" <?php echo ( 'custom' == $this->options['tile_provider'] ? 'selected' : '' )?>>Custom</option>
                        </select>
                        <div id="custom_tile_provider">
                            <label for="tile_url">URL for tiles: </label>
                            <input id="tile_url" type="text" size="60" name="tile_url" value="<?php echo $this->options['tile_url']; ?>" />
                            <br>
                            <label for="tile_attribution">Attribution: </label>
                            <input id="tile_attribution" type="text" size="60" name="tile_attribution" value="<?php echo esc_html($this->options['tile_attribution']); ?>" />
                        </div>
                        <div id="api_key_div">
                            <label for="api_key">API Key: </label>
                            <input id="api_key" type="text" size="40" name="api_key" value="<?php echo $this->options['api_key']; ?>" />
                        </div>
                        <h3>GeoCoding Parameters</h3>
                        <div id="nominatim_div">
                            <label for="nominatim_url">Nominatim URL: </label>
                            <input id="nominatim_url" type="text" size="40" name="nominatim_url" value="<?php echo $this->options['nominatim_url']; ?>" />
                        </div>
                        <ul>
                            <li>
                                <label for="region_bias">Region/ Country Code (optional): </label>
                                <input id="region_bias" type="text" size="2" name="region_bias" value="<?php echo $this->options['region_bias']; ?>" />
                            </li>
                            <li>
                            <table>
                            <tr>
                            <td>Geolocation Bounds (optional)</td>
                            <td>
                                <label for="bounds_north">North: </label>
                                <input id="bounds_north" type="text" size="8" name="bounds_north" value="<?php echo $this->options['bounds_north']; ?>" />
                                <label for="bounds_east">East: </label>
                                <input id="bounds_east" type="text" size="8" name="bounds_east" value="<?php echo $this->options['bounds_east']; ?>" />
                                <br>
                                <label for="bounds_south">South: </label>
                                <input id="bounds_south" type="text" size="8" name="bounds_south" value="<?php echo $this->options['bounds_south']; ?>" />
                                <label for="bounds_west">West: </label>
                                <input id="bounds_west" type="text" size="8" name="bounds_west" value="<?php echo $this->options['bounds_west']; ?>" />
                             </td>
                            </tr>
                            </table>
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3>Default Latitude and Longitude of map</h3>
                        <p>Open Google Maps, right click on a point, and select "what is here?"</p>
                        <ul>
                            <li>
                                <label for="lat">Latitude: </label>
                                <input id="lat" type="text" size="10" name="lat" value="<?php echo $this->options['lat']; ?>" />
                            </li>
                            <li>
                                <label for="lng">longitude: </label>
                                <input id="lng" type="text" size="10" name="lng" value="<?php echo $this->options['lng']; ?>" />
                            </li>
                            <li>
                                <label for="zoom">zoom: </label>
                                <input id="zoom" type="text" size="3" name="zoom" value="<?php echo $this->options['zoom']; ?>" />
                            </li>                           
                        </ul>
                    </div>
            <?php
        }
        public function processUpdate(&$options)
        {
            $options['google_api_key'] = $_POST['api_key'];
            $options['tile_provider'] = $_POST['tile_provider'];
        }
    }
}
