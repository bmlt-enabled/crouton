<?php
namespace Crouton;

/* Disallow direct access to the plugin file */
if (! defined('WPINC')) {
    die;
}

if (!class_exists("Crouton\MapAdmin")) {
    class MapAdmin
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
        public function className(): string
        {
            return "MeetingMap";
        }
        public function getMapJSConfig(array $params, $croutonMap = false): string
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
        public function adminSection($options)
        {
            ?>
                    <div style="padding: 0 15px;" class="postbox">
                         <h3>Map Tile Provider</h3>
                        <select name="tile_provider" id="tile_provider">
                            <option value="OSM" <?php echo ( 'OSM' == $options['tile_provider'] ? 'selected' : '' )?>>Open Street Map</option>
                            <option value="OSM DE" <?php echo ( 'OSM DE' == $options['tile_provider'] ? 'selected' : '' )?>>German Open Street Map</option>
                            <option value="google" <?php echo ( 'google' == $options['tile_provider'] ? 'selected' : '' )?>>Google Maps</option>
                            <option value="custom" <?php echo ( 'custom' == $options['tile_provider'] ? 'selected' : '' )?>>Custom</option>
                        </select>
                        <div id="custom_tile_provider">
                            <label for="tile_url">URL for tiles: </label>
                            <input id="tile_url" type="text" size="60" name="tile_url" value="<?php echo esc_html($options['tile_url']); ?>" />
                            <br>
                            <label for="tile_attribution">Attribution: </label>
                            <input id="tile_attribution" type="text" size="60" name="tile_attribution" value="<?php echo esc_html($options['tile_attribution']); ?>" />
                        </div>
                        <div id="api_key_div">
                            <label for="api_key">API Key: </label>
                            <input id="api_key" type="text" size="40" name="api_key" value="<?php echo esc_html($options['api_key']); ?>" />
                        </div>
                        <h3>GeoCoding Parameters</h3>
                        <div id="nominatim_div">
                            <label for="nominatim_url">Nominatim URL: </label>
                            <input id="nominatim_url" type="text" size="40" name="nominatim_url" value="<?php echo esc_url($options['nominatim_url']); ?>" />
                        </div>
                        <ul>
                            <li>
                                <label for="region_bias">Region/ Country Code (optional): </label>
                                <input id="region_bias" type="text" size="2" name="region_bias" value="<?php echo esc_html($options['region_bias']); ?>" />
                            </li>
                            <li>
                            <table>
                            <tr>
                            <td>Geolocation Bounds (optional)</td>
                            <td>
                                <label for="bounds_north">North: </label>
                                <input id="bounds_north" type="text" size="8" name="bounds_north" value="<?php echo esc_html($options['bounds_north']); ?>" />
                                <label for="bounds_east">East: </label>
                                <input id="bounds_east" type="text" size="8" name="bounds_east" value="<?php echo esc_html($options['bounds_east']); ?>" />
                                <br>
                                <label for="bounds_south">South: </label>
                                <input id="bounds_south" type="text" size="8" name="bounds_south" value="<?php echo esc_html($options['bounds_south']); ?>" />
                                <label for="bounds_west">West: </label>
                                <input id="bounds_west" type="text" size="8" name="bounds_west" value="<?php echo esc_html($options['bounds_west']); ?>" />
                             </td>
                            </tr>
                            </table>
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3>Default Latitude and Longitude of map</h3>
                        <p>A good way to find the latitude and longitude is to open Google Maps, right click on a point, and select "what is here?"</p>
                        <ul>
                            <li>
                                <label for="lat">Latitude: </label>
                                <input id="lat" type="text" size="10" name="lat" value="<?php echo esc_html($options['lat']); ?>" />
                            </li>
                            <li>
                                <label for="lng">longitude: </label>
                                <input id="lng" type="text" size="10" name="lng" value="<?php echo esc_html($options['lng']); ?>" />
                            </li>
                            <li>
                                <label for="zoom">zoom: </label>
                                <input id="zoom" type="text" size="3" name="zoom" value="<?php echo esc_html($options['zoom']); ?>" />
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3>Clustering</h3>
                        <ul>
                            <li>
                                <label for="clustering">Use clustering below zoom level: </label>
                                <input id="clustering" type="text" size="2" name="clustering" value="<?php echo esc_html($options['clustering']); ?>" />
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-meeting-popup-template" class="anchor"></a>Popup Template</h3>
                        <p>This allows a customization of the fields displayed when you click on a map icon.  A list of available fields are
                        <span style="text-align:center;padding:20px 0;">
<input alt="#TB_inline?height=300&amp;width=400&amp;inlineId=examplePopup1" title="Show Handlebar Variables" class="thickbox" type="button" value="here" />.</p>
                        <ul>
                            <li>
                                <textarea id="marker_contents_template" class="handlebarsCode" name="marker_contents_template" cols="100" rows="10"><?php echo isset($options['marker_contents_template']) ? esc_html(html_entity_decode($options['marker_contents_template'])) : "___DEFAULT___"; ?></textarea>
                            </li>
                            <li>
                                <input type="button" id="reset_marker_contents_template" value="RESET TO DEFAULT" class="button-secondary" />
                            </li>
                        </ul>
                        <script type="text/javascript">
                            jQuery("#reset_marker_contents_template").click(function() {
                                resetCodemirrorToDefault("marker_contents_template");
                            });
                        </script>
                    </div>
            <?php
        }
        // phpcs:disable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
        private function sanitize_text_field($field)
        {
            return isset($_POST[$field]) ? sanitize_text_field(wp_unslash($_POST[$field])) : '';
        }
        // phpcs:disable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
        private function sanitize_handlebars($field)
        {
            return isset($_POST[$field]) ? wp_specialchars_decode(wp_kses_post(wp_unslash($_POST[$field]))) : '';
        }
        public function processUpdate(&$options)
        {
            $options['api_key'] = $this->sanitize_text_field('api_key');
            $options['tile_provider'] = $this->sanitize_text_field('tile_provider');
            // cannot sanitize, because string contains {} characters.
            $options['tile_url'] = isset($_POST['tile_url']) ? sanitize_text_field(wp_unslash($_POST['tile_url'])) : '';
            $options['nominatim_url'] = isset($_POST['nominatim_url']) ? sanitize_url(wp_unslash($_POST['nominatim_url'])) : '';
            $options['tile_attribution'] = wp_kses_post(wp_unslash($_POST['tile_attribution']));
            $options['lat'] = floatval($_POST['lat']);
            $options['lng'] = floatval($_POST['lng']);
            $options['zoom'] = intval($_POST['zoom']);
            $options['bounds_north'] = ((trim($_POST['bounds_north']))==='') ? '' : floatval($_POST['bounds_north']);
            $options['bounds_east'] = ((trim($_POST['bounds_east']))==='') ? '' : floatval($_POST['bounds_east']);
            $options['bounds_south'] = ((trim($_POST['bounds_south']))==='') ? '' : floatval($_POST['bounds_south']);
            $options['bounds_west'] = ((trim($_POST['bounds_west']))==='') ? '' : floatval($_POST['bounds_west']);
            $options['region_bias'] = $_POST['region_bias'];
            $options['clustering'] = intval($_POST['clustering']);
            $options['marker_contents_template'] = $this->sanitize_handlebars('marker_contents_template');
        }
    }
}
