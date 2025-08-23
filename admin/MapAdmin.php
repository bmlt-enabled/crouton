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
                wp_enqueue_style("crouton-leaflet", plugin_dir_url(__DIR__)."croutonjs/dist/crouton-leaflet.min.css", false, filemtime(plugin_dir_path(__DIR__)."croutonjs/dist/crouton-leaflet.min.css"), false);
                wp_enqueue_script("crouton-leaflet", plugin_dir_url(__DIR__)."croutonjs/dist/crouton-map.min.js", false, filemtime(plugin_dir_path(__DIR__)."croutonjs/dist/crouton-map.min.js"), false);
            }
        }
        public function className(): string
        {
            return "MeetingMap";
        }
        public function adminSection($options)
        {
            ?>
                    <div style="padding: 0 15px;" class="postbox">
                         <h3><?php _e('Map Tile Provider', 'crouton-domain') ?></h3>
                        <select name="tile_provider" id="tile_provider">
                            <option value="OSM" <?php echo ( 'OSM' == $options['tile_provider'] ? 'selected' : '' )?>><?php _e('Open Street Map', 'crouton-domain') ?></option>
                            <option value="OSM DE" <?php echo ( 'OSM DE' == $options['tile_provider'] ? 'selected' : '' )?>><?php _e('German Open Street Map', 'crouton-domain') ?></option>
                            <option value="google" <?php echo ( 'google' == $options['tile_provider'] ? 'selected' : '' )?>><?php _e('Google Maps', 'crouton-domain') ?></option>
                            <option value="custom" <?php echo ( 'custom' == $options['tile_provider'] ? 'selected' : '' )?>><?php _e('Custom', 'crouton-domain') ?></option>
                        </select>
                        <div id="custom_tile_provider">
                            <label for="tile_url"><?php _e('URL for tiles: ', 'crouton-domain') ?></label>
                            <input id="tile_url" type="text" size="60" name="tile_url" value="<?php echo esc_html($options['tile_url']); ?>" />
                            <br>
                            <label for="tile_attribution"><?php _e('Attribution: ', 'crouton-domain') ?></label>
                            <input id="tile_attribution" type="text" size="60" name="tile_attribution" value="<?php echo esc_html($options['tile_attribution']); ?>" />
                        </div>
                        <div id="api_key_div">
                            <label for="api_key"><?php _e('API Key: ', 'crouton-domain') ?></label>
                            <input id="api_key" type="text" size="40" name="api_key" value="<?php echo esc_html($options['api_key']); ?>" />
                        </div>
                        <h3><?php _e('GeoCoding Parameters', 'crouton-domain') ?></h3>
                        <div id="nominatim_div">
                            <label for="nominatim_url"><?php _e('Nominatim URL: ', 'crouton-domain') ?></label>
                            <input id="nominatim_url" type="text" size="40" name="nominatim_url" value="<?php echo esc_url($options['nominatim_url']); ?>" />
                        </div>
                        <ul>
                            <li>
                                <label for="region_bias"><?php _e('Region/ Country Code (optional): ', 'crouton-domain') ?></label>
                                <input id="region_bias" type="text" size="2" name="region_bias" value="<?php echo esc_html($options['region_bias']); ?>" />
                            </li>
                            <li>
                            <table>
                            <tr>
                            <td><?php _e('Geolocation Bounds (optional)', 'crouton-domain') ?></td>
                            <td>
                                <label for="bounds_north"><?php _e('North: ', 'crouton-domain') ?></label>
                                <input id="bounds_north" type="text" size="8" name="bounds_north" value="<?php echo esc_html($options['bounds_north']); ?>" />
                                <label for="bounds_east"><?php _e('East: ', 'crouton-domain') ?></label>
                                <input id="bounds_east" type="text" size="8" name="bounds_east" value="<?php echo esc_html($options['bounds_east']); ?>" />
                                <br>
                                <label for="bounds_south"><?php _e('South: ', 'crouton-domain') ?></label>
                                <input id="bounds_south" type="text" size="8" name="bounds_south" value="<?php echo esc_html($options['bounds_south']); ?>" />
                                <label for="bounds_west"><?php _e('West: ', 'crouton-domain') ?></label>
                                <input id="bounds_west" type="text" size="8" name="bounds_west" value="<?php echo esc_html($options['bounds_west']); ?>" />
                             </td>
                            </tr>
                            </table>
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><?php _e('Default Latitude and Longitude of map', 'crouton-domain') ?></h3>
                        <p><?php _e('A good way to find the latitude and longitude is to open Google Maps, right click on a point, and select "what is here?"', 'crouton-domain') ?></p>
                        <ul>
                            <li>
                                <label for="lat"><?php _e('Latitude: r', 'crouton-domain') ?></label>
                                <input id="lat" type="text" size="10" name="lat" value="<?php echo esc_html($options['lat']); ?>" />
                            </li>
                            <li>
                                <label for="lng"><?php _e('Longitude: ', 'crouton-domain') ?></label>
                                <input id="lng" type="text" size="10" name="lng" value="<?php echo esc_html($options['lng']); ?>" />
                            </li>
                            <li>
                                <label for="zoom"><?php _e('Zoom: ', 'crouton-domain') ?></label>
                                <input id="zoom" type="text" size="3" name="zoom" value="<?php echo esc_html($options['zoom']); ?>" />
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><?php _e('Clustering', 'crouton-domain') ?></h3>
                        <ul>
                            <li>
                                <label for="clustering"><?php _e('Cluster markers when below zoom level: ', 'crouton-domain') ?></label>
                                <input id="clustering" type="text" size="2" name="clustering" value="<?php echo esc_html($options['clustering']); ?>" />
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-meeting-popup-template" class="anchor"></a><?php _e('Popup Template', 'crouton-domain') ?></h3>
                        <p><?php _e('This allows a customization of the fields displayed when you click on a map icon.  A list of available fields are', 'crouton-domain') ?>
                        <span style="text-align:center;padding:20px 0;">
<input alt="#TB_inline?height=300&amp;width=400&amp;inlineId=examplePopup1" title="Show Handlebar Variables" class="thickbox" type="button" value="<?php _e('here', 'crouton-domain') ?>" />.</p>
                        <ul>
                            <li>
                                <textarea id="marker_contents_template" class="handlebarsCode" name="marker_contents_template" cols="100" rows="10"><?php echo isset($options['marker_contents_template']) ? esc_html(html_entity_decode($options['marker_contents_template'])) : "___DEFAULT___"; ?></textarea>
                            </li>
                            <li>
                                <input type="button" id="reset_marker_contents_template" value="<?php _e('Load current default template', 'crouton-domain')?>" class="button-secondary" />
                                <input type="button" id="clear_marker_contents_template" value="<?php _e('Use default template.  Updating crouton may update template', 'crouton_domain') ?>" class="button-secondary" />
                            </li>
                        </ul>
                        <script type="text/javascript">
                            jQuery("#reset_marker_contents_template").click(function() {
                                resetCodemirrorToDefault("marker_contents_template");
                            });
                            jQuery("#clear_marker_contents_template").click(function() {
                                clearCodemirror("marker_contents_template");
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
