<?php
namespace Crouton;

if (! defined('WPINC')) {
    die;
}
if (!class_exists("Crouton\TableAdmin")) {
    class TableAdmin
    {
        private TableOptions $crouton;
        private string $hook = 'bmlt-enabled-crouton';
        private array $themes = [
            "asheboro",
            "florida-nights",
            "frog",
            "gold-coast",
            "jack",
            "kevin",
            "lucy",
            "none",
            "one-nine",
            "orange-monster",
            "patrick",
            "quebec",
            "seattle-rain",
            "sezf",
            "truth"
        ];
        private $hasFilters = [
            "has_days",
            "has_groups",
            "has_areas",
            "has_regions",
            "has_cities",
            "has_formats",
            "has_locations",
            "has_sub_province",
            "has_neighborhoods",
            "has_states",
            "has_languages",
            "has_zip_codes",
            "has_venues",
            "filter_visible",
            "has_common_needs"
        ];
        private MapAdmin $map_admin;
        public function __construct(TableOptions $crouton)
        {
            $this->crouton = $crouton;
            require_once(__DIR__."/MapAdmin.php");
            $this->map_admin = new MapAdmin($crouton->getMapOptions());
            add_action("admin_enqueue_scripts", array(&$this, "enqueueBackendFiles"), 500);
            add_action("admin_menu", array(&$this, "adminMenuLink"));
            add_action("BmltEnabled_Submenu", array(&$this, "adminSubmenuLink"));
            add_action("init", array(&$this, "loadTextDomain"));
        }
        private $menu_created = false;
        public function loadTextDomain()
        {
            load_plugin_textdomain('crouton', false, dirname(plugin_basename(__FILE__)).'/../languages/');
        }
        public function adminSubmenuLink($parent_slug)
        {
            $this->menu_created = true;
            $cap = 'manage_options';
            if (!current_user_can($cap)) {
                $cap = 'manage_crouton';
            }
            $this->hook = add_submenu_page(
                $parent_slug,
                'Online Meeting Lists',
                'Online Meeting Lists',
                $cap,
                'bmlt-enabled-crouton',
                array(&$this, 'adminOptionsPage')
            );
        }
        public function enqueueBackendFiles($hook)
        {
            if (str_ends_with($hook, $this->hook)) {
                wp_enqueue_style('bmlt-tabs-admin-ui-css', plugin_dir_url(__DIR__).'css/south-street/jquery-ui.css', false, '1.11.4', false);
                wp_enqueue_style("select2", plugin_dir_url(__DIR__) . "css/select2.min.css", false, "1.2", 'all');
                wp_enqueue_style("crouton-admin", plugin_dir_url(__DIR__) . "css/crouton-admin.css", false, "1.1", 'all');
                wp_enqueue_script("select2", plugin_dir_url(__DIR__) . "js/select2.min.js", array('jquery'), "1.2", true);
                wp_enqueue_script('fetch-jsonp', plugin_dir_url(__DIR__).'js/fetch-jsonp.js', array('jquery'), filemtime(plugin_dir_path(__DIR__) . "js/fetch-jsonp.js"), false);
                wp_enqueue_script('bmlt-tabs-admin', plugin_dir_url(__DIR__).'js/bmlt_tabs_admin.js', array('fetch-jsonp'), filemtime(plugin_dir_path(__DIR__) . "js/bmlt_tabs_admin.js"), false);
                wp_enqueue_script("tooltipster", plugin_dir_url(__DIR__) . "js/jquery.tooltipster.min.js", array('jquery'), "1.2", true);
                wp_enqueue_script('common');
                add_thickbox();
                wp_enqueue_script('jquery-ui-accordion');
                wp_enqueue_script("crouton-default-templates", plugin_dir_url(__DIR__) . "croutonjs/src/js/crouton-default-templates.js", array('jquery'), filemtime(plugin_dir_path(__DIR__) . "croutonjs/src/js/crouton-default-templates.js"), true);

                wp_enqueue_style("codemirror", plugin_dir_url(__DIR__) . "css/codemirror.css", false, "5.65.15", 'all');
                wp_enqueue_style("codemirror", plugin_dir_url(__DIR__) . "css/show-hint.css", false, "5.65.15", 'all');
                wp_enqueue_script('codemirror', plugins_url('js/codemirror/codemirror.js', __DIR__), array('jquery'), filemtime(plugin_dir_path(__DIR__) . "js/codemirror/codemirror.js"), false);
                wp_enqueue_script('codemirror-simple', plugins_url('js/codemirror/simple.js', __DIR__), array('codemirror'), filemtime(plugin_dir_path(__DIR__) . "js/codemirror/simple.js"), false);
                wp_enqueue_script('codemirror-multiplex', plugins_url('js/codemirror/multiplex.js', __DIR__), array('codemirror-simple'), filemtime(plugin_dir_path(__DIR__) . "js/codemirror/multiplex.js"), false);
                wp_enqueue_script('codemirror-matchbrackets', plugins_url('js/codemirror/matchbrackets.js', __DIR__), array('codemirror-multiplex'), filemtime(plugin_dir_path(__DIR__) . "js/codemirror/matchbrackets.js"), false);
                wp_enqueue_script('codemirror-xml', plugins_url('js/codemirror/xml.js', __DIR__), array('codemirror-multiplex'), filemtime(plugin_dir_path(__DIR__) . "js/codemirror/xml.js"), false);
                wp_enqueue_script('codemirror-handlebars', plugins_url('js/codemirror/handlebars.js', __DIR__), array('codemirror-xml'), filemtime(plugin_dir_path(__DIR__) . "js/codemirror/handlebars.js"), false);
                wp_enqueue_script('codemirror-css', plugins_url('js/codemirror/css.js', __DIR__), array('codemirror'), filemtime(plugin_dir_path(__DIR__) . "js/codemirror/css.js"), false);
                wp_enqueue_script('showhint', plugins_url('js/codemirror/show-hint.js', __DIR__), array('codemirror'), filemtime(plugin_dir_path(__DIR__) . "js/codemirror/show-hint.js"), false);
                wp_enqueue_script('csshint', plugins_url('js/codemirror/css-hint.js', __DIR__), array('showhint'), filemtime(plugin_dir_path(__DIR__) . "js/codemirror/css-hint.js"), false);
            }
        }
        public function adminMenuLink()
        {
            if ($this->menu_created) {
                return;
            }
            $cap = 'manage_options';
            if (!current_user_can($cap)) {
                $cap = 'manage_crouton';
            }
            $icon = apply_filters("BmltEnabled_IconSVG", 'dashicons-location-alt');
            $slug = 'bmlt-enabled-crouton';
            add_menu_page(
                'Meeting Lists',
                'Meeting Lists',
                $cap,
                $slug,
                '',
                $icon,
                null
            );
            do_action('BmltEnabled_Submenu', $slug);
        }
        /**
         * Adds settings/options page
         */
        public function adminOptionsPage()
        {
            $options = $this->crouton->getOptions();
            if (!isset($_POST['bmlttabssave'])) {
                $_POST['bmlttabssave'] = false;
            }
            if ($_POST['bmlttabssave']) {
                if (!wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['_wpnonce'])), 'bmlttabsupdate-options')) {
                    die('Whoops! There was a problem with the data you posted. Please go back and try again.');
                }
                $options['root_server']    = isset($_POST['root_server']) ? sanitize_url(wp_unslash($_POST['root_server'])) : '';
                $options['service_bodies'] = isset($_POST['service_bodies']) ? array_map('sanitize_text_field', $_POST['service_bodies']) : array();
                $options['time_format'] = isset($_POST['time_format']) ? sanitize_text_field(wp_unslash($_POST['time_format'])) : '';
                $options['distance_units'] = isset($_POST['distance_units']) ? sanitize_text_field(wp_unslash($_POST['distance_units'])) : 'miles';
                $options['language'] = isset($_POST['language']) ? sanitize_text_field(wp_unslash($_POST['language'])) : '';
                $options['strict_datafields'] = isset($_POST['strict_datafields']);
                $options["int_start_day_id"] = intval($_POST["int_start_day_id"]);
                $options['native_lang'] = trim(sanitize_text_field(wp_unslash($_POST['native_lang'])));
                $options['meeting_details_href'] = trim(sanitize_text_field(wp_unslash($_POST['meeting_details_href'])));
                $options['virtual_meeting_details_href'] = trim(sanitize_text_field(wp_unslash($_POST['virtual_meeting_details_href'])));
                $options['custom_query']   = isset($_POST['custom_query']) ? sanitize_text_field(wp_unslash($_POST['custom_query'])) : '';
                $options['custom_css']     = $this->sanitize_handlebars('custom_css');
                $options['meeting_data_template'] = $this->sanitize_handlebars('meeting_data_template');
                $options['metadata_template'] = $this->sanitize_handlebars('metadata_template');
                $options['meetingpage_title_template'] = $this->sanitize_handlebars('meetingpage_title_template');
                $options['meetingpage_contents_template'] =$this->sanitize_handlebars('meetingpage_contents_template');
                $options['theme']          = sanitize_text_field(wp_unslash($_POST['theme']));
                $options['show_map']       = sanitize_text_field(wp_unslash($_POST['show_map']));
                $options['header']         = isset($_POST['header']) ? "1" : "0";
                $options['has_tabs']       = isset($_POST['has_tabs']) ? "1" : "0";
                $options['include_city_button']    = isset($_POST['include_city_button']) ? "1" : "0";
                $options['include_distance_button']    = isset($_POST['include_distance_button']) ? "1" : "0";
                $options['include_weekday_button'] = isset($_POST['include_weekday_button']) ? "1" : "0";
                $options['view_by']       = sanitize_text_field(wp_unslash($_POST['view_by']));
                $options['recurse_service_bodies'] = isset($_POST['recurse_service_bodies']) ? intval($_POST['recurse_service_bodies']) : "0";
                $postFilters = isset($_POST['select_filters']) ? array_map('sanitize_text_field', wp_unslash($_POST['select_filters'])) : array();
                foreach ($this->hasFilters as $hasFilter) {
                    $options[$hasFilter] = in_array($hasFilter, $postFilters);
                }
                $options['extra_meetings'] = isset($_POST['extra_meetings']) ? array_map('sanitize_text_field', wp_unslash($_POST['extra_meetings'])) : array();
                $options['extra_meetings_enabled'] = isset($_POST['extra_meetings_enabled']) ? intval($_POST['extra_meetings_enabled']) : "0";
                $this->map_admin->processUpdate($options);
                $this->crouton->saveOptions($options);
                echo "<script type='text/javascript'>jQuery(function(){jQuery('#updated').html('<p>Success! Your changes were successfully saved!</p>').show().fadeOut(5000);});</script>";
            }
            if (!isset($options['time_format']) || strlen(trim($options['time_format'])) == 0) {
                $options['time_format'] = 'h:mm a';
            }
            if (!isset($options['language']) || strlen(trim($options['language'])) == 0) {
                $options['language'] = 'en-US';
            }
            if (!isset($options['native_lang'])) {
                $options['native_lang'] = '';
            }
            if (!isset($options['meeting_details_href'])) {
                $options['meeting_details_href'] = '';
            }
            if (!isset($options['virtual_meeting_details_href'])) {
                $options['virtual_meeting_details_href'] = '';
            }
            if (!isset($options['strict_datafields'])) {
                $options['strict_datafields'] = true;
            }
            if (!isset($options['extra_meetings_enabled']) || $options['extra_meetings_enabled'] == "0" || strlen(trim($options['extra_meetings_enabled'])) == 0) {
                $options['extra_meetings_enabled'] = 0;
            }
            if (!is_array($options['extra_meetings']) || count($options['extra_meetings']) == 0) {
                $options['extra_meetings'] = '';
            } else {
                $options['extra_meetings_enabled'] = 1;
            }
            ?>
            <div class="wrap">
                <div id="tallyBannerContainer">
                    <img alt="crouton-banner" id="tallyBannerImage" src="<?php echo esc_url(plugin_dir_url(__DIR__).'css/images/banner.png');?>"/>
                </div>
                <div id="updated"></div>
                <form style="display:inline!important;" method="POST" id="bmlt_tabs_options" name="bmlt_tabs_options">
                    <?php
                    wp_nonce_field('bmlttabsupdate-options');?>
                    <div style="margin-top: 20px; padding: 0 15px;" class="postbox">
                        <h3><?php esc_html_e('Configuration', 'crouton')?></h3>
                        <p><?php
                            // translators: %s is the URL of the crouton GitHub issues page
                            echo wp_kses_post(sprintf(__('Please open a ticket at %s for bugs, enhancements, or questions.', 'crouton'), '<a href="https://github.com/bmlt-enabled/crouton/issues" target="_blank">https://github.com/bmlt-enabled/crouton/issues</a>')); ?> </p>
                    </div>
                    <script type="text/javascript">
                        window.crouton_admin = {};
                        window.crouton_admin.root_server = '<?php echo esc_js($options['root_server']); ?>';
                        window.crouton_admin.service_bodies_selected = <?php echo json_encode($options['service_bodies']); ?>.map(x => x.split(',')[1]);
                        window.crouton_admin.extra_meetings = <?php echo json_encode($options['extra_meetings']); ?>;
                    </script>
                    <nav class="nav-tab-wrapper">
                        <a href="#bmlt-query" class="nav-tab nav-tab-active"><?php esc_html_e('BMLT Query', 'crouton') ?></a>
                        <a href="#crouton-ui" class="nav-tab"><?php esc_html_e('User Interface', 'crouton') ?></a>
                        <a href="#crouton-map" class="nav-tab"><?php esc_html_e('Map', 'crouton') ?></a>
                        <a href="#crouton-templates" class="nav-tab"><?php esc_html_e('Templates', 'crouton') ?></a>
                    </nav>
                <div id="bmlt-query" class="tab-content">
                    <div style="margin-top: 20px; padding: 0 15px;" class="postbox">
                        <h3><a id="config-bmlt-root-server" class="anchor"></a><?php esc_html_e('BMLT Server URL', 'crouton') ?></h3>
                        <p><?php
                            // translators: %s is the URL of the some BMLT server
                            echo wp_kses_post(sprintf(__('Example: %s', 'crouton'), 'https://bmlt.sezf.org/main_server')) ?></p>
                        <ul>
                            <li>
                                <label for="root_server"><?php esc_html_e('Default Server: ', 'crouton') ?></label>
                                <input id="root_server" type="text" size="50" name="root_server" value="<?php echo esc_url($options['root_server']); ?>"
                                    onKeypress="root_server_keypress(event)" onChange="test_root_server()" />
                                <span id="connected_message" class="hide" style="color:green;">
                                    <span style='font-size: 16px;vertical-align: text-top;' class='dashicons dashicons-yes'></span>
                                    Version: <span id="server_version"></span>
                                </span>
                                <span id="disconnected_message" class="hide" style="color:red;">
                                    <span style='font-size: 16px;vertical-align: text-top;' class='dashicons dashicons-no'></span>
                                    <?php esc_html_e('Connection to Root Server Failed.  Check spelling or try again.  If you are certain spelling is correct, Root Server could be down.', 'crouton') ?>
                                </span>
                            </li>
                            <li>
                                <input type="checkbox" id="use_aggregator" name="use_aggregator" value="1"/>
                                <label for="use_aggregator"><?php esc_html_e('Use Aggregator &#127813;', 'crouton') ?></label>
                                <span title='<p>The Aggregator collects meeting data <br/>from all known root servers and pretends to be one large server</p><p>This can be useful to use if you want to display meetings outside <br/>of your server, for instance a statewide listing where the state <br/>covers multiple root servers<br/>Another good use case is if you want to display meetings by users<br/> location</p>' class="tooltip"></span>
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-service-body" class="anchor"></a><?php esc_html_e('Service Body', 'crouton') ?></h3>
                        <p><?php esc_html_e('This service body will be used when no service body is defined in the shortcode.', 'crouton') ?></p>
                        <ul>
                            <li>
                                <label for="service_bodies"><?php esc_html_e('Default Service Bodies: ', 'crouton') ?></label>
                                <select style="display:inline;" id="service_bodies" name="service_bodies[]" multiple="multiple" class="service_body_select" data-placeholder="<?php
                                    esc_html_e('Select Service Bodies', 'crouton');
                                ?>">
                                </select>

                                <div style="display:inline; margin-left:15px;" id="txtSelectedValues1"></div>
                                <p id="txtSelectedValues2"></p>
                                <input type="checkbox" id="recurse_service_bodies" name="recurse_service_bodies" value="1" <?php echo (isset($options['recurse_service_bodies']) && $options['recurse_service_bodies'] == "1" ? "checked" : "") ?>/>
                                <label for="recurse_service_bodies"><?php esc_html_e('Recurse Service Bodies', 'crouton') ?></label>
                            </li>
                        </ul>
                    </div>

                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-include-extra-meetings" class="anchor"></a><?php esc_html_e('Include Extra Meetings', 'crouton') ?></h3>
                        <div id="extra_meetings_select" class="inside">
                            <select class="crouton-admin-select" style="width: 100%;" id="extra_meetings" name="extra_meetings[]" multiple="multiple">

                            </select>
                            <p><?php esc_html_e('Hint: Type a group name, weekday, area or id to narrow down your choices.', 'crouton') ?></p>
                        </div>
                        <div id="fetching_meetings" style="margin:20px;" class="hidden">
                            Fetching meetings from server...
                        </div>
                        <div>
                            <input type="checkbox" id="extra_meetings_enabled" name="extra_meetings_enabled" value="1" <?php echo ($options['extra_meetings_enabled'] == 1 ? 'checked' : '') ?> /> <?php esc_html_e('Extra Meetings Enabled', 'crouton') ?>
                        </div>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-custom-query" class="anchor"></a><?php esc_html_e('Custom Query', 'crouton') ?></h3>
                        <p><?php esc_html_e('By default, all the meetings in the selected service bodies are returned.  You can override this with your own query here.', 'crouton') ?></p>
                        <ul>
                            <li>
                                <label for="custom_query"><?php esc_html_e('Custom Query: ', 'crouton') ?></label>
                                <input id="custom_query" name="custom_query" size="50" value="<?php echo (isset($options['custom_query']) ? esc_html($options['custom_query']) : ""); ?>" />
                            </li>
                        </ul>
                 </div>
            </div>
            <div id="crouton-ui" class=tab-content>
            <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-theme" class="anchor"></a><?php esc_html_e('Theme', 'crouton') ?></h3>
                        <p><?php esc_html_e('The BMLT community has developed many color schemes for their meeting lists.  You can select one of them here.  The default original theme is called "jack".  If no theme is selected, the default one will be used.', 'crouton') ?></p>
                        <p><?php esc_html_e('You can customize the selected theme in the custom CSS section, below.', 'crouton') ?></p>
                        <ul>
                            <li>
                                <select style="display:inline;" id="theme" name="theme"  class="theme_select">
                                    <?php
                                    foreach ($this->themes as $theme) { ?>
                                        <option <?php if ($theme === $options['theme']) {
                                                    echo "selected";
                                                } else {
                                                    echo "";
                                                }
                                                ?> value="<?php echo esc_html($theme) ?>"><?php echo $theme == "jack" ? "jack (default)" : esc_html($theme) ?></option>
                                        <?php
                                    }?>
                                </select>
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-show-map" class="anchor"></a><?php esc_html_e('Companion Map', 'crouton') ?></h3>
                        <p><?php esc_html_e('In addition to croutons tabular listing of meetings, the meetings can be be displayed on a map.', 'crouton') ?></p>
                        <p><?php esc_html_e('You may configure the map by clicking on the "Map" tab, above.', 'crouton') ?></p>
                                <select id="show_map" name="show_map" style="display:block;">
                                    <option <?php echo $options['show_map']=='0' ? 'selected' : '';?> value="0"><?php esc_html_e('No Map', 'crouton') ?></option>
                                    <option <?php echo $options['show_map']=='1' ? 'selected' : '';?> value="1"><?php esc_html_e('Show Map and Table', 'crouton') ?></option>
                                    <option <?php echo $options['show_map']=='embed' ? 'selected' : '';?> value="embed"><?php esc_html_e('Embed Map as Table Page', 'crouton') ?></option>
                                </select>
                            </li>
                        </ul>
                        <br/>
                    </div>
            <div style="margin-top: 20px; padding: 0 15px;" class="postbox">
                        <h3><a id="config-default-options" class="anchor"></a><?php esc_html_e('Default Values', 'crouton') ?></h3>
                        <p><?php esc_html_e('These values will be used when the attributes are not defined in the shortcode', 'crouton'); ?></p>
                        <ul>
                            <li>
                                <label for="language"><?php esc_html_e('Default meeting list language:', 'crouton') ?> </label>
                                <input id="language" type="text" size="5" name="language" value="<?php echo esc_html($options['language']); ?>" />
                            </li>
                            <li>
                                <label for="native_lang"><?php esc_html_e('Which format code represents the default language: ', 'crouton') ?></label>
                                <input id="native_lang" type="text" size="2" name="native_lang" value="<?php echo esc_html($options['native_lang']); ?>" />
                            </li>
                            <li>
                                <label for="time_format"><?php esc_html_e('Default time format: ', 'crouton') ?></label>
                                <input id="time_format" type="text" size="10" name="time_format" value="<?php echo esc_html($options['time_format']); ?>" />
                            </li>
                            <li>
                                <label for="distance_units"><?php esc_html_e('Distance Units: ', 'crouton') ?></label>
                                <select id="distance_units" name="distance_units" style="display:inline;">
                                    <option <?php echo ($options['distance_units'] == 'miles') ? 'selected' : ''; ?> value="miles"><?php esc_html_e('Miles', 'crouton') ?></option>
                                    <option <?php echo ($options['distance_units'] == 'km') ? 'selected' : ''; ?> value="km"><?php esc_html_e('Kilometers', 'crouton') ?></option>
                                </select>
                            </li>
                            <li>
                                <?php
                                if (!isset($options["int_start_day_id"])) {
                                    $options["int_start_day_id"] = 1;
                                }
                                ?>
                                <label for="int_start_day_id"><?php esc_html_e('Which day does the week start on:', 'crouton') ?></label>
                                <select name="int_start_day_id" id="int_start_day_id">
                                    <option value="1" <?php echo ($options["int_start_day_id"] == 1) ? 'selected' : ''; ?>><?php esc_html_e('Sunday', 'crouton') ?></option>
                                    <option value="2" <?php echo ($options["int_start_day_id"] == 2) ? 'selected' : ''; ?>><?php esc_html_e('Monday', 'crouton') ?></option>
                                    <option value="3" <?php echo ($options["int_start_day_id"] == 3) ? 'selected' : ''; ?>><?php esc_html_e('Tuesday', 'crouton') ?></option>
                                    <option value="4" <?php echo ($options["int_start_day_id"] == 4) ? 'selected' : ''; ?>><?php esc_html_e('Wedsday', 'crouton') ?></option>
                                    <option value="5" <?php echo ($options["int_start_day_id"] == 5) ? 'selected' : ''; ?>><?php esc_html_e('Thursday', 'crouton') ?></option>
                                    <option value="6" <?php echo ($options["int_start_day_id"] == 6) ? 'selected' : ''; ?>><?php esc_html_e('Friday', 'crouton') ?></option>
                                    <option value="7" <?php echo ($options["int_start_day_id"] == 7) ? 'selected' : ''; ?>><?php esc_html_e('Saturday', 'crouton') ?></option>
                                </select>
                            </li>
                            <li>
                                <input type="checkbox" id="strict_datafields" name="strict_datafields" <?php echo $options['strict_datafields'] ? "checked" : '' ?>/>
                                <label for="strict_datafields"><?php esc_html_e('Retrieve only those fields that are directly accessed in the templates', 'crouton') ?></label>
                            </li>
                        </ul>
                    </div>
            <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-table-headers" class="anchor"></a><?php esc_html_e('Configure Table Headers', 'crouton') ?></h3>
                        <h4><?php esc_html_e('Header Contents', 'crouton') ?></h4>
                        <ul>
                            <li><input type="checkbox" name="header" value="1" <?php echo ($options['header'] == 1 ? 'checked' : '') ?> /> <?php esc_html_e('Show Header', 'crouton') ?></li>
                            <li><input type="checkbox" name="has_tabs" value="1" <?php echo ($options['has_tabs'] == 1 ? 'checked' : '') ?> /> <?php esc_html_e('Separate days into tabs', 'crouton') ?> </li>
                            <li><input type="checkbox" name="include_city_button" value="1" <?php echo ($options['include_city_button'] == 1 ? 'checked' : '') ?> /> <?php esc_html_e('Include "Cities" Button', 'crouton') ?></li>
                            <li><input type="checkbox" name="include_weekday_button" value="1" <?php echo ($options['include_weekday_button'] == 1 ? 'checked' : '') ?> /> <?php esc_html_e('Include "Weekdays" Button', 'crouton') ?></li>
                            <li><input type="checkbox" name="include_distance_button" value="1" <?php echo ($options['include_distance_button'] == 1 ? 'checked' : '') ?> /> <?php esc_html_e('Include "Distance" Button', 'crouton') ?> </li>
                            <li><select name="view_by">
                                <option value="weekday" <?php echo ($options["view_by"] == "weekday") ? 'selected' : ''; ?>><?php esc_html_e('View by Weekday', 'crouton') ?></option>
                                <option value="city" <?php echo ($options["view_by"] == "city") ? 'selected' : ''; ?>><?php esc_html_e('View by City', 'crouton') ?></option>
                                <option value="distance" <?php echo ($options["view_by"] == "distance") ? 'selected' : ''; ?>><?php esc_html_e('View by Distance', 'crouton') ?></option>
                            </select></li>
                        </ul>
                        <h4><?php esc_html_e('Select Dropdown Filters', 'crouton') ?></h4>
                        <div class="inside">

                            <select class="crouton-admin-select" style="width: 100%;" data-placeholder="select filters" id="select_filters" name="select_filters[]" multiple="multiple"><?php
                            foreach ($this->hasFilters as $hasFilter) {?>
                                <option <?php echo empty($options[$hasFilter]) ? "" : "selected='selected' "?> value="<?php echo esc_html($hasFilter);?>"><?php echo esc_html($hasFilter);?></option>
                                <?php
                            }?>
                            </select>
                        </div>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-custom-css" class="anchor"></a><?php esc_html_e('Custom CSS', 'crouton') ?></h3>
                        <p><?php esc_html_e('Allows custom styling of the meeting list.', 'crouton') ?></p>
                        <ul>
                            <li>
                                <textarea id="custom_css" name="custom_css" cols="100" rows="10"><?php echo (isset($options['custom_css']) ? esc_html(html_entity_decode($options['custom_css'])) : ""); ?></textarea>
                            </li>
                        </ul>
                    </div>
            </div>
            <div id="crouton-map">
                <?php $this->map_admin->adminSection($options); ?>
            </div>
            <div id="crouton-templates">
                                    <div id="examplePopup1" style="display:none">
<h2>Database Fields in BMLT Root Server</h2><table id="fields_table"></table>
<h2>Calculated Values</h2>        <p>In addition to the fields returned by the root server, the following fields are calculated and made available as part of the meeting data.
        <ul style="list-style:disc; padding-inline-start: 20px;">
    <li>start_time_formatted</li>
    <li>end_time_formatted</li>
    <li>formatted_day</li>
    <li>formats_expanded - which contains:
        <ul style="padding-inline-start: 20px;">
            <li>id</li>
            <li>key</li>
            <li>name</li>
            <li>description</li>
            <li>type</li>
        </ul>
    </li>
    <li>venue_type</li>
    <li>venue_type_name</li>
    <li>formatted_address</li>
    <li>formatted_location_info</li>
    <li>serviceBodyUrl</li>
    <li>serviceBodyPhone</li>
    <li>serviceBodyName</li>
    <li>serviceBodyDescription</li>
    <li>serviceBodyContactEmail (must be comfigured in root server)</li>
    <li>serviceBodyType</li>
    <li>parentServiceBodyUrl</li>
    <li>parentServiceBodyPhone</li>
    <li>parentServiceBodyName</li>
    <li>parentServiceBodyDescription</li>
    <li>parentServiceBodyType</li>
</ul>
        </p>
        <p>To include a map in the meeting details, use the "crouton_map" helper function, ie, {{{crouton_map}}}.
            Note the triple brackets.  A initial zoom factor (from 2 to 17) may be given as an option, eg, {{{crouton_map zoom=16}}}.  Default zoom is 14.
        </p></div>
        <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-meeting-data-template" class="anchor"></a><?php esc_html_e('Meeting Data Template', 'crouton') ?></h3>
                        <p><?php esc_html_e('This allows customization of the second column of the meeting list table.  A list of available fields are', 'crouton') ?>
                            <span style="text-align:center;padding:20px 0;">
                                <input alt="#TB_inline?height=300&amp;width=400&amp;inlineId=examplePopup1" title="Show Handlebar Variables" class="thickbox" type="button" value="<?php esc_html_e('here', 'crouton') ?>" /></span>.</p>
                        <p><?php esc_html_e('If you want to customize the template, use the "Reset" button to load the current default template which you can then modify.  Customized templates are not overwritten, even when crouton updates.', 'crouton') ?></p>
                        <p><?php esc_html_e('To always use the current default, allowing crouton to update the template, leave this field empty.', 'crouton') ?></p>
                        <ul>
                            <li>
                                <textarea id="meeting_data_template" class="handlebarsCode" name="meeting_data_template" cols="100" rows="10"><?php echo isset($options['meeting_data_template']) ? esc_html(html_entity_decode($options['meeting_data_template'])) : "___DEFAULT___"; ?></textarea>
                            </li>
                            <li>
                                <input type="button" id="reset_meeting_data_template" value="<?php esc_html_e('Load current default template', 'crouton')?>" class="button-secondary" />
                                <input type="button" id="clear_meeting_data_template" value="<?php esc_html_e('Clear', 'crouton') ?>" class="button-secondary" />
                            </li>
                        </ul>
                        <script type="text/javascript">
                            jQuery("#reset_meeting_data_template").click(function() {
                                resetCodemirrorToDefault("meeting_data_template");
                            });
                            jQuery("#clear_meeting_data_template").click(function() {
                                clearCodemirror("meeting_data_template");
                            });
                        </script>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-metadata-data-template" class="anchor"></a><?php esc_html_e('Metadata Template', 'crouton') ?></h3>
                        <p><?php esc_html_e('This allows customization of the third column of the meeting list table.  A list of available fields are', 'crouton') ?>
                            <span style="text-align:center;padding:20px 0;">
                                <input alt="#TB_inline?height=300&amp;width=400&amp;inlineId=examplePopup1" title="Show Handlebar Variables" class="thickbox" type="button" value="<?php esc_html_e('here', 'crouton') ?>" /></span>.</p>
                        <p><?php esc_html_e('If you want to customize the template, use the "Reset" button to load the current default template which you can then modify.  Customized templates are not overwritten, even when crouton updates.', 'crouton') ?></p>
                        <p><?php esc_html_e('To always use the current default, allowing crouton to update the template, leave this field empty.', 'crouton') ?></p>
                        <ul>
                            <li>
                                <textarea id="metadata_template" class="handlebarsCode" name="metadata_template" cols="100" rows="10"><?php echo isset($options['metadata_template']) ? esc_html(html_entity_decode($options['metadata_template'])) : "___DEFAULT___"; ?></textarea>
                            </li>
                            <li>
                                <input type="button" id="reset_metadata_template" value="<?php esc_html_e('Load current default template', 'crouton')?>" class="button-secondary" />
                                <input type="button" id="clear_metadata_template" value="<?php esc_html_e('Clear', 'crouton') ?>" class="button-secondary" />
                            </li>
                        </ul>
                        <script type="text/javascript">
                            jQuery("#reset_metadata_template").click(function() {
                                resetCodemirrorToDefault("metadata_template");
                            });
                            jQuery("#clear_metadata_template").click(function() {
                                clearCodemirror("metadata_template");
                            });
                        </script>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-meeting-details-page" class="anchor"></a><?php esc_html_e('Meeting Details Page', 'crouton') ?></h3>
                        <p><?php esc_html_e('This allows customization of the page or popup focused on a particular meeting.  A list of available fields are', 'crouton') ?>
                        <span style="text-align:center;padding:20px 0;">
                                <input alt="#TB_inline?height=300&amp;width=400&amp;inlineId=examplePopup1" title="Show Handlebar Variables" class="thickbox" type="button" value="<?php esc_html_e('here', 'crouton') ?>" /></span>.</p>
                        <p><?php esc_html_e('If you want to customize the template, use the "Reset" button to load the current default template which you can then modify.  Customized templates are not overwritten, even when crouton updates.', 'crouton') ?></p>
                        <p><?php esc_html_e('To always use the current default, allowing crouton to update the template, leave this field empty.', 'crouton') ?></p>
                        <ul>
                            <li>
                                <label for="meetingpage_title_template"><?php esc_html_e('Headline', 'crouton') ?></label>
                                <textarea id="meetingpage_title_template" class="handlebarsCode" name="meetingpage_title_template" cols="100" rows="2"><?php echo isset($options['meetingpage_title_template']) ? esc_html(html_entity_decode($options['meetingpage_title_template'])) : "___DEFAULT___"; ?></textarea>
                            </li>
                            <li>
                                <label for="meetingpage_contents_template"><?php esc_html_e('Contents', 'crouton') ?></label>
                                <textarea id="meetingpage_contents_template" class="handlebarsCode" name="meetingpage_contents_template" cols="100" rows="20"><?php echo isset($options['meetingpage_contents_template']) ? esc_html(html_entity_decode($options['meetingpage_contents_template'])) : "___DEFAULT___"; ?></textarea>
                            </li>
                            <li>
                                <input type="button" id="reset_meetingpage_templates" value="<?php esc_html_e('Load current default template', 'crouton')?>" class="button-secondary" />
                                <input type="button" id="clear_meetingpage_templates" value="<?php esc_html_e('Clear', 'crouton') ?>" class="button-secondary" />
                            </li>
                        </ul>
                        <script type="text/javascript">
                            jQuery("#reset_meetingpage_templates").click(function() {
                                resetCodemirrorToDefault("meetingpage_title_template");
                                resetCodemirrorToDefault("meetingpage_contents_template");
                            });
                            jQuery("#clear_meetingpage_templates").click(function() {
                                clearCodemirror("meetingpage_title_template");
                                clearCodemirror("meetingpage_contents_template");
                            });
                        </script>
                        <p><?php esc_html_e("By default, the meeting details are inserted onto the same page as the meeting list table, replacing it.  This might not
                        be appropriate.  If you want to use an additional page (or blog post) to display the meeting details, you may enter the path to the page here.
                        Use the [bmlt_handlebar] shortcode to insert the meeting information into the static text (eg, [bmlt_handlebar]{{meeting_name}}[/bmlt_handlebar]).
                        The partials 'meetingpageTitleTemplate' and 'meetingpageContentsTemplate', defined in the two code areas above, are available for use in this way.", 'crouton') ?></p>
                        </p>
                        <ul>
                            <li>
                                <label for="meeting_details_href"><?php esc_html_e('URI for in-person (and hybrid) meetings: ', 'crouton') ?></label>
                                <input id="meeting_details_href" type="text" size="50" name="meeting_details_href" value="<?php echo esc_url($options['meeting_details_href']); ?>" onkeyup='show_create_detail_option(this)'/>
                            </li>
                            <li>
                                <label for="virtual_meeting_details_href"><?php esc_html_e('URI for virtual meetings: ', 'crouton') ?></label>
                                <input id="virtual_meeting_details_href" type="text" size="50" name="virtual_meeting_details_href" value="<?php echo esc_url($options['virtual_meeting_details_href']); ?>" onkeyup='show_create_detail_option(this)'/>
                                <p><?php esc_html_e('If no value is specified for virtual meetings, the in-person meeting link will be used.', 'crouton') ?></p>
                            </li>
                        </ul>
                    </div>
            </div>
                    <input type="submit" value="SAVE CHANGES" name="bmlttabssave" class="button-primary" />
                </form>
                <br/><br/>
                <?php include '_instructions.php'; ?>
            </div>
            <?php
        }
        // phpcs:disable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
        private function sanitize_handlebars($field)
        {
            $allowed = wp_kses_allowed_html('post');
            $allowed['a']['onclick'] = true;
            return isset($_POST[$field]) ? wp_specialchars_decode(wp_kses(wp_unslash($_POST[$field]), $allowed)) : '';
        }
    }
}