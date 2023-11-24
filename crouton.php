<?php
/*
Plugin Name: crouton
Plugin URI: https://wordpress.org/plugins/crouton/
Description: A tabbed based display for showing meeting information.
Author: bmlt-enabled
Author URI: https://bmlt.app
Version: 3.17.8
*/
/* Disallow direct access to the plugin file */
if (basename($_SERVER['PHP_SELF']) == basename(__FILE__)) {
    // die('Sorry, but you cannot access this page directly.');
}
ini_set('max_execution_time', 120);
if (!class_exists("Crouton")) {
    // phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace
    class Crouton
    // phpcs:enable PSR1.Classes.ClassDeclaration.MissingNamespace
    {
        public $optionsName = 'bmlt_tabs_options';
        /**
         * configuration
         *
         * @var mixed[]
         */
        public $options = array();
        public $croutonBlockInitialized = false;
        public static $HOUR_IN_SECONDS = 3600;
        public $has_handlebars = false;
        public $themes = [
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
        const HTTP_RETRIEVE_ARGS = array(
            'headers' => array(
                'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:105.0) Gecko/20100101 Firefox/105.0 +crouton'
            ),
            'timeout' => 60
        );
        // crouton includes a map, we need to include the JS files and create the croutonMap object.
        private $hasMap = false;
        private $useInternalMap = false;
        public $shortCodeOptions = array(
            "root_server" => '',
            "service_body" => '',
            "service_body_parent" => '',
            "venue_types" => '',
            "formats" => '',
            "has_tabs" => '1',
            "has_days" => '0',
            "has_groups" => '1',
            "has_areas" => '0',
            "has_regions" => '0',
            "has_cities" => '1',
            "has_formats" => '1',
            "has_locations" => '1',
            "has_sub_province" => '0',
            "has_neighborhoods" => '0',
            "has_states" => '0',
            "has_languages" => '0',
            "has_common_needs" => '0',
            "has_venues" => '1',
            "include_city_button" => '1',
            "include_weekday_button" => '1',
            "include_unpublished" => '0',
            "button_filters_option" => "City:location_municipality",
            "button_format_filters_option" => "",
            "view_by" => 'weekday',
            "dropdown_width" => 'auto',
            "has_zip_codes" => '1',
            "header" => '1',
            "format_key" => '',
            "time_format" => 'h:mm a',
            "exclude_zip_codes" => null,
            "show_distance" => '0',
            "distance_search" => '0',
            "distance_units" => 'mi',
            "custom_query" => null,
            "show_map" => '0',
            "max_zoom_level" => 15,
            "language" => 'en-US',
            'strict_datafields' => false,
            'meeting_details_href' => '',
            'virtual_meeting_details_href' => '',
            "auto_tz_adjust" => '0',
            "base_tz" => null,
            "sort_keys" => 'start_time',
            "int_start_day_id" => '1',
            "recurse_service_bodies" => '0',
            "theme" => '',
            "default_filter_dropdown" => '',
            "meeting_data_template" => null,
            "metadata_template" => null,
            "filter_tabs" => false,
            "show_qrcode" => false,
            "hide_byday_headers" => false,
            "native_lang" => '',
            "has_meeting_count" => false
        );
        private function useMeetingMap()
        {
            return true; //empty($this->options['google_api_key']);
        }
        private MeetingMap\Controller $meetingMapController;
        public function __construct()
        {
            $this->getOptions();
            if ($this->useMeetingMap()) {
                require_once(__DIR__."/croutonjs/maps/meetingMap/meeting_map.php");
            } else {
                require_once(__DIR__."/croutonjs/maps/defaultCroutonMap/croutonMap.php");
            }
            $this->meetingMapController = new MeetingMap\Controller($this->options);
            if (is_admin()) {
                // Back end
                add_action("admin_enqueue_scripts", array(&$this, "enqueueBackendFiles"), 500);
                add_action("admin_menu", array(&$this, "adminMenuLink"));
            } else {
                // Front end
                add_action("wp_enqueue_scripts", array(&$this, "enqueueFrontendFiles"));
                add_shortcode('init_crouton', array(
                    &$this,
                    "initCrouton"
                ));
                add_shortcode('bmlt_tabs', array(
                    &$this,
                    "tabbedUi"
                ));
                add_shortcode('crouton_map', array(
                    &$this,
                    "croutonMap"
                ));
                add_shortcode('bmlt_count', array(
                    &$this,
                    "meetingCount"
                ));
                add_shortcode('meeting_count', array(
                    &$this,
                    "meetingCount"
                ));
                add_shortcode('group_count', array(
                    &$this,
                    "groupCount"
                ));
                add_shortcode('service_body_names', array(
                    &$this,
                    "serviceBodyNames"
                ));
                add_shortcode('bmlt_handlebar', array(
                    &$this,
                    "bmltHandlebar"
                ));
            }
        }

        private function hasShortcode()
        {
            $post_to_check = get_post(get_the_ID());
            $post_content = $post_to_check->post_content ?? '';
            $tags = ['bmlt_tabs', 'crouton_map', 'bmlt_count', 'meeting_count', 'group_count', 'service_body_names', 'bmlt_handlebar'];
            preg_match_all('/' . get_shortcode_regex($tags) . '/', $post_content, $matches, PREG_SET_ORDER);
            if (empty($matches)) {
                return false;
            }
    
            foreach ($matches as $shortcode) {
                if ($shortcode[2] === 'bmlt_tabs') {
                    if (isset($_GET['meeting-id'])) {
                        $this->hasMap = true;
                    } else {
                        // This is a bad-smell.  It is a side effect.
                        // Also, it seems wrong to output this HTML during the enqueue scripts phase, but that's how 3.15 worked
                        echo '<div class="bootstrap-bmlt" id="please-wait"><button class="btn btn-lg btn-info"><span class="glyphicon glyphicon-repeat glyphicon-repeat-animate"></span>Fetching...</button></div>';
                        $split = explode("show_map", $shortcode[3]);
                        if (count($split) > 1 || isset($_GET['show_map'])) {
                            $this->hasMap = true;
                        }
                    }
                }
                if ($shortcode[2] === 'bmlt_handlebar') {
                    $this->hasMap = true;
                }
                if ($shortcode[2] === 'crouton_map') {
                    $this->hasMap = true;
                    $this->useInternalMap = true;
                }
            }

            return true;
        }

        // phpcs:disable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
        public function Crouton()
        {
        // phpcs:enable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
            $this->__construct();
        }

        public function enqueueBackendFiles($hook)
        {
            if ($hook == 'settings_page_crouton') {
                wp_enqueue_style('bmlt-tabs-admin-ui-css', plugins_url('css/south-street/jquery-ui.css', __FILE__), false, '1.11.4', false);
                wp_enqueue_style("chosen", plugin_dir_url(__FILE__) . "css/chosen.min.css", false, "1.2", 'all');
                wp_enqueue_style("crouton-admin", plugin_dir_url(__FILE__) . "css/crouton-admin.css", false, "1.1", 'all');
                wp_enqueue_script("chosen", plugin_dir_url(__FILE__) . "js/chosen.jquery.min.js", array('jquery'), "1.2", true);
                wp_enqueue_script('bmlt-tabs-admin', plugins_url('js/bmlt_tabs_admin.js', __FILE__), array('jquery'), filemtime(plugin_dir_path(__FILE__) . "js/bmlt_tabs_admin.js"), false);
                wp_enqueue_script("tooltipster", plugin_dir_url(__FILE__) . "js/jquery.tooltipster.min.js", array('jquery'), "1.2", true);
                wp_enqueue_script('common');
                add_thickbox();
                wp_enqueue_script('jquery-ui-accordion');
                wp_enqueue_script("crouton-default-templates", plugin_dir_url(__FILE__) . "croutonjs/src/js/crouton-default-templates.js", array('jquery'), filemtime(plugin_dir_path(__FILE__) . "croutonjs/src/js/crouton-default-templates.js"), true);
            
                wp_enqueue_style("codemirror", plugin_dir_url(__FILE__) . "css/codemirror.css", false, "5.65.15", 'all');
                wp_enqueue_style("codemirror", plugin_dir_url(__FILE__) . "css/show-hint.css", false, "5.65.15", 'all');
                wp_enqueue_script('codemirror', plugins_url('js/codemirror/codemirror.js', __FILE__), array('jquery'), filemtime(plugin_dir_path(__FILE__) . "js/codemirror/codemirror.js"), false);
                wp_enqueue_script('codemirror-simple', plugins_url('js/codemirror/simple.js', __FILE__), array('codemirror'), filemtime(plugin_dir_path(__FILE__) . "js/codemirror/simple.js"), false);
                wp_enqueue_script('codemirror-multiplex', plugins_url('js/codemirror/multiplex.js', __FILE__), array('codemirror-simple'), filemtime(plugin_dir_path(__FILE__) . "js/codemirror/multiplex.js"), false);
                wp_enqueue_script('codemirror-matchbrackets', plugins_url('js/codemirror/matchbrackets.js', __FILE__), array('codemirror-multiplex'), filemtime(plugin_dir_path(__FILE__) . "js/codemirror/matchbrackets.js"), false);
                wp_enqueue_script('codemirror-xml', plugins_url('js/codemirror/xml.js', __FILE__), array('codemirror-multiplex'), filemtime(plugin_dir_path(__FILE__) . "js/codemirror/xml.js"), false);
                wp_enqueue_script('codemirror-handlebars', plugins_url('js/codemirror/handlebars.js', __FILE__), array('codemirror-xml'), filemtime(plugin_dir_path(__FILE__) . "js/codemirror/handlebars.js"), false);
                wp_enqueue_script('codemirror-css', plugins_url('js/codemirror/css.js', __FILE__), array('codemirror'), filemtime(plugin_dir_path(__FILE__) . "js/codemirror/css.js"), false);
                wp_enqueue_script('showhint', plugins_url('js/codemirror/show-hint.js', __FILE__), array('codemirror'), filemtime(plugin_dir_path(__FILE__) . "js/codemirror/show-hint.js"), false);
                wp_enqueue_script('csshint', plugins_url('js/codemirror/css-hint.js', __FILE__), array('showhint'), filemtime(plugin_dir_path(__FILE__) . "js/codemirror/css-hint.js"), false);
            }
        }

        /**
        * @desc Adds JS/CSS to the header
        */
        public function enqueueFrontendFiles()
        {
            if ($this->hasShortcode()) {
                $jsfilename = (isset($_GET['croutonjsdebug']) ? "crouton-core.js" : "");
                wp_enqueue_style("croutoncss", plugin_dir_url(__FILE__) . "croutonjs/dist/crouton.min.css", false, filemtime(plugin_dir_path(__FILE__) . "croutonjs/dist/crouton.min.css"), false);
                if (isset($_GET['croutonjsdebug'])) {
                    wp_enqueue_script("croutonnocorejs", plugin_dir_url(__FILE__) . "croutonjs/dist/crouton-nocore.js", array('jquery'), filemtime(plugin_dir_path(__FILE__) . "croutonjs/dist/crouton-nocore.js"), true);
                    wp_enqueue_script("croutonjs", plugin_dir_url(__FILE__) . "croutonjs/src/js/crouton-core.js", array('croutonnocorejs'), filemtime(plugin_dir_path(__FILE__) . "croutonjs/src/js/crouton-core.js"), true);
                } else {
                    wp_enqueue_script("croutonjs", plugin_dir_url(__FILE__) . "croutonjs/dist/crouton-core.min.js", array('jquery'), filemtime(plugin_dir_path(__FILE__) . "croutonjs/dist/crouton-core.min.js"), true);
                }
                $this->meetingMapController->enqueueFrontendFiles();
            }
        }

        private function getCustomQuery($custom_query)
        {
            if (isset($_GET['custom_query'])) {
                return $_GET['custom_query'];
            } elseif (isset($custom_query) && $custom_query != null) {
                return html_entity_decode($custom_query);
            } elseif (isset($this->options['custom_query']) && strlen($this->options['custom_query']) > 0) {
                return $this->options['custom_query'];
            } else {
                return null;
            }
        }

        private function testRootServer($root_server)
        {
            $args = array(
                'timeout' => '10',
                'headers' => array(
                    'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:105.0) Gecko/20100101 Firefox/105.0 +crouton'
                )
            );
            $results = wp_remote_get("$root_server/client_interface/json/?switcher=GetServerInfo", $args);
            $httpcode = wp_remote_retrieve_response_code($results);
            $response_message = wp_remote_retrieve_response_message($results);
            if ($httpcode != 200 && $httpcode != 302 && $httpcode != 304 && ! empty($response_message)) {
                //echo '<p>Problem Connecting to BMLT Root Server: ' . $root_server . '</p>';
                return false;
            };

            $results = json_decode(wp_remote_retrieve_body($results), true);

            if (is_array($results) && !empty($results)) {
                return $results[0]['version'] ?? '';
            }

            return '';
        }

        public function doQuit($message = '')
        {
            ob_flush();
            flush();
            $message .= '<script>document.getElementById("please-wait").style.display = "none";</script>';
            return $message;
        }

        private function sharedRender()
        {
            $output = "";
            if (isset($_GET['this_title'])) {
                $output .= '<div class="bmlt_tabs_title">' . $_GET['this_title'] . '</div>';
            }

            if (isset($_GET['sub_title'])) {
                $output .= '<div class="bmlt_tabs_sub_title">' . $_GET['sub_title'] . '</div>';
            }

            return $output;
        }

        public function tabbedUi($atts, $content = null)
        {
            if (isset($_GET['meeting-id'])) {
                return do_shortcode($this->getDefaultMeetingDetailsPageContents());
            }
            return sprintf('%s<div id="bmlt-tabs" class="bmlt-tabs hide">%s</div><script>document.getElementById("please-wait").style.display = "none";</script>', $this->sharedRender(), $this->renderTable($atts));
        }
        public function bmltHandlebar($atts, $template = null)
        {
            if (!isset($_GET['meeting-id'])) {
                return "Meeting-ID not set in query-string";
            }
            if ($template == null || trim($template) == '') {
                if (isset($atts['template']) && strlen(trim($atts['template'])) > 0) {
                    $template = trim($atts['template']);
                } else {
                    return '';
                }
            }
            if (!$this->has_handlebars) {
                add_action("wp_footer", [$this,'handlebarFooter']);
            }
            $this->has_handlebars = true;
            return sprintf('<bmlt-handlebar style="display:none;"><span style="display:none;">%s</span>Fetching...</bmlt-handlebar>', htmlspecialchars($template));
        }
        public function croutonMap($atts, $content = null)
        {
            if (isset($_GET['meeting-id'])) {
                return do_shortcode($this->getDefaultMeetingDetailsPageContents());
            }
            return sprintf('%s<div id="bmlt-tabs" class="bmlt-tabs hide">%s</div>', $this->sharedRender(), $this->renderMap($atts));
        }
        private function getMapInitialization($mapConfig)
        {
            $className = $this->meetingMapController->className();
            if ($this->hasMap) {
                return  "window.croutonMap = new $className($mapConfig);";
            }
            return "";
        }
        private function getInitializeCroutonBlock($renderCmd, $config, $mapConfig)
        {
            if (!$this->croutonBlockInitialized) {
                $this->croutonBlockInitialized = true;
                $croutonMap =  $this->getMapInitialization($mapConfig);
                return "<script type='text/javascript'>var crouton;jQuery(document).ready(function() { $croutonMap crouton = new Crouton($config); $renderCmd });</script>";
            } else {
                return isset($config) ? "<script type='text/javascript'>jQuery(document).ready(function() { crouton.setConfig($config); $renderCmd });</script>" : "";
            }
        }

        private function renderTable($atts)
        {
            return $this->getInitializeCroutonBlock("crouton.render();", ...$this->getCroutonJsConfig($atts));
        }

        private function renderMap($atts)
        {
            return $this->getInitializeCroutonBlock("crouton.render(true);", ...$this->getCroutonJsConfig($atts));
        }

        public function initCrouton($atts)
        {
            return $this->getInitializeCroutonBlock("", ...$this->getCroutonJsConfig($atts));
        }

        public function meetingCount($atts)
        {
            if (isset($_GET['meeting-id'])) {
                return '1';
            }
            $random_id = rand(10000, 99999);
            return $this->getInitializeCroutonBlock("crouton.meetingCount(function(res) { document.getElementById('meeting-count-$random_id').innerHTML = res; });", ...$this->getCroutonJsConfig($atts)) . "<span id='meeting-count-$random_id'></span>";
        }

        public function groupCount($atts)
        {
            if (isset($_GET['meeting-id'])) {
                return '1';
            }
            $random_id = rand(10000, 99999);
            return $this->getInitializeCroutonBlock("crouton.groupCount(function(res) { document.getElementById('group-count-$random_id').innerHTML = res; });", ...$this->getCroutonJsConfig($atts)) . "<span id='group-count-$random_id'></span>";
        }

        public function serviceBodyNames($atts)
        {
            if (isset($_GET['meeting-id'])) {
                return '';
            }
            $random_id = rand(10000, 99999);
            return $this->getInitializeCroutonBlock("crouton.serviceBodyNames(function(res) { document.getElementById('service-body-names-$random_id').innerHTML = res; })", ...$this->getCroutonJsConfig($atts)) . "<span id='service-body-names-$random_id'></span>";
        }
        public function handlebarFooter()
        {
            if (!isset($_GET['meeting-id'])) {
                return;
            }
            $meetingId = $_GET['meeting-id'];
            $attr = ['custom_query' => '&meeting_ids[]='.$meetingId,
                     'strict_datafields' => false];
            [$config, $mapConfig] = $this->getCroutonJsConfig($attr);
            $croutonMap =  $this->getMapInitialization($mapConfig);
            ?>
<script type='text/javascript'>
var crouton;

jQuery(document).ready(function() { 
            <?php echo $croutonMap ?> crouton = new Crouton(<?php echo $config; ?>);
    crouton.doHandlebars();
});
</script>
            <?php
        }
        /**
         * @desc Adds the options sub-panel
         */
        public function getAreas($root_server, $source)
        {
            $results = wp_remote_get("$root_server/client_interface/json/?switcher=GetServiceBodies", Crouton::HTTP_RETRIEVE_ARGS);
            $result = json_decode(wp_remote_retrieve_body($results), true);
            if (is_wp_error($results)) {
                echo '<div style="font-size: 20px;text-align:center;font-weight:normal;color:#F00;margin:0 auto;margin-top: 30px;"><p>Problem Connecting to BMLT Root Server</p><p>' . $root_server . '</p><p>Error: ' . $result->get_error_message() . '</p><p>Please try again later</p></div>';
                return 0;
            }

            if ($source == 'dropdown') {
                $unique_areas = array();
                foreach ($result as $value) {
                    $parent_name = 'None';
                    foreach ($result as $parent) {
                        if ($value['parent_id'] == $parent['id']) {
                            $parent_name = $parent['name'];
                        }
                    }
                    $unique_areas[] = $value['name'] . ',' . $value['id'] . ',' . $value['parent_id'] . ',' . $parent_name;
                }
            } else {
                $unique_areas = array();
                foreach ($result as $value) {
                    $unique_areas[$value['id']] = $value['name'];
                }
            }
            return $unique_areas;
        }

        public function adminMenuLink()
        {
            // If you change this from add_options_page, MAKE SURE you change the filterPluginActions function (below) to
            // reflect the page file name (i.e. - options-general.php) of the page your plugin is under!
            add_options_page('crouton', 'crouton', 'activate_plugins', basename(__FILE__), array(
                &$this,
                'adminOptionsPage'
            ));
            add_filter('plugin_action_links_' . plugin_basename(__FILE__), array(
                &$this,
                'filterPluginActions'
            ), 10, 2);
        }
        private function getDefaultMeetingDetailsPageContents()
        {
            return file_get_contents(plugin_dir_path(__FILE__) . "partials/default_meeting_details.html");
        }
        /**
         * Adds settings/options page
         */
        public function adminOptionsPage()
        {
            if (!isset($_POST['bmlttabssave'])) {
                $_POST['bmlttabssave'] = false;
            }
            if ($_POST['bmlttabssave']) {
                if (!wp_verify_nonce($_POST['_wpnonce'], 'bmlttabsupdate-options')) {
                    die('Whoops! There was a problem with the data you posted. Please go back and try again.');
                }
                $this->options['root_server']    = $_POST['root_server'];
                $this->options['service_body_1'] = $_POST['service_body_1'];
                $this->options['time_format'] = $_POST['time_format'];
                $this->options['language'] = $_POST['language'];
                $this->options['strict_datafields'] = isset($_POST['strict_datafields']);
                $this->options["int_start_day_id"] = intval($_POST["int_start_day_id"]);
                $this->options['native_lang'] = trim($_POST['native_lang']);
                $this->options['meeting_details_href'] = trim($_POST['meeting_details_href']);
                $this->options['virtual_meeting_details_href'] = trim($_POST['virtual_meeting_details_href']);
                $this->options['custom_query']   = $_POST['custom_query'];
                $this->options['custom_css']     = isset($_POST['custom_css']) ? str_replace('\\', '', $_POST['custom_css']) : "";
                $this->options['meeting_data_template'] = isset($_POST['meeting_data_template']) ? str_replace('\\', '', $_POST['meeting_data_template']) : "";
                $this->options['metadata_template'] = isset($_POST['metadata_template']) ? str_replace('\\', '', $_POST['metadata_template']) : "";
                $this->options['meetingpage_title_template'] = isset($_POST['meetingpage_title_template']) ? str_replace('\\', '', $_POST['meetingpage_title_template']) : "";
                $this->options['meetingpage_contents_template'] = isset($_POST['meetingpage_contents_template']) ? str_replace('\\', '', $_POST['meetingpage_contents_template']) : "";
                $this->options['theme']          = $_POST['theme'];
                $this->options['recurse_service_bodies'] = isset($_POST['recurse_service_bodies']) ? $_POST['recurse_service_bodies'] : "0";
                $this->options['extra_meetings'] = isset($_POST['extra_meetings']) ? $_POST['extra_meetings'] : array();
                $this->options['extra_meetings_enabled'] = isset($_POST['extra_meetings_enabled']) ? intval($_POST['extra_meetings_enabled']) : "0";
                $this->options['google_api_key'] = $_POST['api_key'];
                $this->options['tile_provider'] = $_POST['tile_provider'];
                $this->saveAdminOptions();
                echo "<script type='text/javascript'>jQuery(function(){jQuery('#updated').html('<p>Success! Your changes were successfully saved!</p>').show().fadeOut(5000);});</script>";
            }
            if (!isset($this->options['time_format']) || strlen(trim($this->options['time_format'])) == 0) {
                $this->options['time_format'] = 'h:mm a';
            }
            if (!isset($this->options['language']) || strlen(trim($this->options['language'])) == 0) {
                $this->options['language'] = 'en-US';
            }
            if (!isset($this->options['native_lang'])) {
                $this->options['native_lang'] = '';
            }
            if (!isset($this->options['meeting_details_href'])) {
                $this->options['meeting_details_href'] = '';
            }
            if (!isset($this->options['virtual_meeting_details_href'])) {
                $this->options['virtual_meeting_details_href'] = '';
            }
            if (!isset($this->options['strict_datafields'])) {
                $this->options['strict_datafields'] = true;
            }
            if (!isset($this->options['extra_meetings_enabled']) || $this->options['extra_meetings_enabled'] == "0" || strlen(trim($this->options['extra_meetings_enabled'])) == 0) {
                $this->options['extra_meetings_enabled'] = 0;
            }
            if (!isset($this->options['extra_meetings']) || count($this->options['extra_meetings']) == 0) {
                $this->options['extra_meetings'] = '';
            } else {
                $this->options['extra_meetings_enabled'] = 1;
            }
            if (!isset($this->options['disable_tinyMCE'])) {
                $this->options['disable_tinyMCE'] = false;
            }
            if (!isset($this->options['tile_provider'])) {
                if (!empty($this->options['google_api_key'])) {
                    $this->options['tile_provider'] = 'google';
                    $this->options['api_key'] = $this->options['google_api_key'];
                } else {
                    $this->options['tile_provider'] = "OSM";
                    $this->options['api_key'] = "";
                }

                $this->options['tile_url'] = "";
                $this->options["tile_attribution"] = "";
                $this->options["nominatim_url"] = "";
                $this->options["region_bias"] = "";
                $this->options["bounds_north"] = "";
                $this->options["bounds_east"] = "";
                $this->options["bounds_south"] = "";
                $this->options["bounds_west"] = "";
                $this->options["lat"] = "";
                $this->options["lng"] = "";
                $this->options["zoom"] = "";
            }
            ?>
            <div class="wrap">
                <div id="tallyBannerContainer">
                    <img alt="crouton-banner" id="tallyBannerImage" src="<?php echo plugin_dir_url(__FILE__); ?>css/images/banner.png"/>
                </div>
                <div id="updated"></div>
                <form style="display:inline!important;" method="POST" id="bmlt_tabs_options" name="bmlt_tabs_options">
                    <?php
                    wp_nonce_field('bmlttabsupdate-options');
                    $this_connected = $this->testRootServer($this->options['root_server']);
                    $connect = "<p><div style='color: #f00;font-size: 16px;vertical-align: text-top;' class='dashicons dashicons-no'></div><span style='color: #f00;'>Connection to Root Server Failed.  Check spelling or try again.  If you are certain spelling is correct, Root Server could be down.</span></p>";
                    if ($this_connected != false) {
                        $connect = "<span style='color: #00AD00;'><div style='font-size: 16px;vertical-align: text-top;' class='dashicons dashicons-smiley'></div>Version ".$this_connected."</span>";
                        $this_connected = true;
                    }?>
                    <div style="margin-top: 20px; padding: 0 15px;" class="postbox">
                        <h3>Configuration</h3>
                        <p>Please open a ticket <a href="https://github.com/bmlt-enabled/crouton/issues" target="_blank">https://github.com/bmlt-enabled/crouton/issues</a> for bugs, enhancements, or questions.</p>
                        <ul class="configuration-toc">
                            <li><a href="#config-bmlt-root-server">BMLT Root Server</a></li>
                            <li><a href="#config-service-body">Service Body</a></li>
                            <li><a href="#config-default-options">Default Options</a></li>
                            <li><a href="#config-include-extra-meetings">Include Extra Meetings</a></li>
                            <li><a href="#config-custom-query">Custom Query</a></li>
                            <li><a href="#config-theme">Theme</a></li>
                            <li><a href="#config-google-api-key">Google API Key</a></li>
                            <li><a href="#config-meeting-data-template">Meeting Data Template</a></li>
                            <li><a href="#config-metadata-data-template">Metadata Template</a></li>
                            <li><a href="#config-meeting-details-page">Meeting Details Page</a></li>
                            <li><a href="#config-custom-css">Custom CSS</a></li>
                            <li><a href="#config-documentation">Documentation</a></li>
                        </ul>
                    </div>
                    <div style="margin-top: 20px; padding: 0 15px;" class="postbox">
                        <h3><a id="config-bmlt-root-server" class="anchor"></a>BMLT Root Server URL</h3>
                        <p>Example: https://bmlt.sezf.org/main_server</p>
                        <ul>
                            <li>
                                <label for="root_server">Default Root Server: </label>
                                <input id="root_server" type="text" size="50" name="root_server" value="<?php echo $this->options['root_server']; ?>" /> <?php echo $connect; ?>
                            </li>
                            <li>
                                <input type="checkbox" id="use_aggregator" name="use_aggregator" value="1"/>
                                <label for="use_aggregator">Use Aggregator &#127813;</label>
                                <span title='<p>The Aggregator collects meeting data <br/>from all known root servers and pretends to be one large server</p><p>This can be useful to use if you want to display meetings outside <br/>of your server, for instance a statewide listing where the state <br/>covers multiple root servers<br/>Another good use case is if you want to display meetings by users<br/> location</p>' class="tooltip"></span>
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-service-body" class="anchor"></a>Service Body</h3>
                        <p>This service body will be used when no service body is defined in the shortcode.</p>
                        <ul>
                            <li>
                                <label for="service_body_1">Default Service Body: </label>
                                <select style="display:inline;" onchange="getValueSelected()" id="service_body_1" name="service_body_1"  class="service_body_select">
                                <?php if ($this_connected) {
                                    $unique_areas = $this->getAreas($this->options['root_server'], 'dropdown');
                                    asort($unique_areas, SORT_NATURAL | SORT_FLAG_CASE);
                                    foreach ($unique_areas as $key => $unique_area) {
                                        $area_data = explode(',', $unique_area);
                                        $area_name = $area_data[0];
                                        $area_id = $area_data[1];
                                        $area_parent = $area_data[2];
                                        $area_parent_name = $area_data[3];
                                        $option_description = $area_name . " (" . $area_id . ") " . $area_parent_name . " (" . $area_parent . ")";
                                        $is_data = explode(',', esc_html($this->options['service_body_1']));
                                        if ($area_id == $is_data[1]) {?>
                                            <option selected="selected" value="<?php echo $unique_area; ?>"><?php echo $option_description; ?></option>
                                        <?php } else { ?>
                                            <option value="<?php echo $unique_area; ?>"><?php echo $option_description; ?></option>
                                        <?php } ?>
                                    <?php } ?>
                                <?php } else { ?>
                                    <option selected="selected" value="<?php echo $this->options['service_body_1']; ?>"><?php echo 'Not Connected - Can not get Service Bodies'; ?></option>
                                <?php } ?>
                                </select>
                                <div style="display:inline; margin-left:15px;" id="txtSelectedValues1"></div>
                                <p id="txtSelectedValues2"></p>
                                <input type="checkbox" id="recurse_service_bodies" name="recurse_service_bodies" value="1" <?php echo (isset($this->options['recurse_service_bodies']) && $this->options['recurse_service_bodies'] == "1" ? "checked" : "") ?>/>
                                <label for="recurse_service_bodies">Recurse Service Bodies</label>
                            </li>
                        </ul>
                    </div>
                    <div style="margin-top: 20px; padding: 0 15px;" class="postbox">
                        <h3><a id="config-default-options" class="anchor"></a>Default Values</h3>
                        <p>These values will be used when the attributes are not defined in the shortcode</p>
                        <ul>
                            <li>
                                <label for="language">Default language of Crouton UI: </label>
                                <input id="language" type="text" size="5" name="language" value="<?php echo $this->options['language']; ?>" />
                            </li>
                            <li>
                                <label for="native_lang">Default language of meetings (format code): </label>
                                <input id="native_lang" type="text" size="2" name="native_lang" value="<?php echo $this->options['native_lang']; ?>" />
                            </li>
                            <li>
                                <label for="time_format">Default time format: </label>
                                <input id="time_format" type="text" size="10" name="time_format" value="<?php echo $this->options['time_format']; ?>" />
                            </li>
                            <li>
                                <?php
                                if (!isset($this->options["int_start_day_id"])) {
                                    $this->options["int_start_day_id"] = 1;
                                }
                                ?>
                                <label for="int_start_day_id">Which day does the week start on:</label>
                                <select name="int_start_day_id" id="int_start_day_id">
                                    <option value="1" <?php echo ($this->options["int_start_day_id"] == 1) ? 'selected' : ''; ?>>Sunday</option>
                                    <option value="2" <?php echo ($this->options["int_start_day_id"] == 2) ? 'selected' : ''; ?>>Monday</option>
                                    <option value="3" <?php echo ($this->options["int_start_day_id"] == 3) ? 'selected' : ''; ?>>Tuesday</option>
                                    <option value="4" <?php echo ($this->options["int_start_day_id"] == 4) ? 'selected' : ''; ?>>Wedsday</option>
                                    <option value="5" <?php echo ($this->options["int_start_day_id"] == 5) ? 'selected' : ''; ?>>Thursday</option>
                                    <option value="6" <?php echo ($this->options["int_start_day_id"] == 6) ? 'selected' : ''; ?>>Friday</option>
                                    <option value="7" <?php echo ($this->options["int_start_day_id"] == 7) ? 'selected' : ''; ?>>Saturday</option>
                                </select>
                            </li>
                            <li>
                                <input type="checkbox" id="strict_datafields" name="strict_datafields" <?php echo $this->options['strict_datafields'] ? "checked" : '' ?>/>
                                <label for="strict_datafields">Retrieve only those fields that are directly accessed in the templates</label>
                            </li>
                        </ul>
                    </div>
                    <div id="examplePopup1" style="display:none">
<h2>Database Fields in BMLT Root Server</h2><table><tr><th>Name</th><th>Description</th></tr><?php
foreach ($this->getAllFields($this->options['root_server']) as $field) {
    echo "<tr><td>".$field['key']."</td><td>".$field['description']."</td></tr>";
}
?></table>
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
</ul>
        </p>
        <p>To include a crouton map into the meeting details, use the "crouton_map" helper function, ie, {{{crouton_map}}}.  
            Note the triple brackets.  A initial zoom factor (from 2 to 17) may be given as an option, eg, {{{crouton_map zoom=16}}}.  Default zoom is 14.
        </p></div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-include-extra-meetings" class="anchor"></a>Include Extra Meetings</h3>
                        <div class="inside">
                            <p class="ctrl_key" style="display:none; color: #00AD00;">Hold CTRL Key down to select multiple meetings.</p>
                            <select class="chosen-select" style="width: 100%;" data-placeholder="<?php
                            if ($this->options['extra_meetings_enabled'] == 0) {
                                echo 'Not Enabled';
                            } elseif (!$this_connected) {
                                echo 'Not Connected';
                            } else {
                                echo 'Select Extra Meetings';
                            } ?>" id="extra_meetings" name="extra_meetings[]" multiple="multiple">
                                <?php if ($this_connected && $this->options['extra_meetings_enabled'] == 1) {
                                    $extra_meetings_array = $this->getAllMeetings($this->options['root_server']);
                                    foreach ($extra_meetings_array as $extra_meeting) {
                                        $extra_meeting_x = explode('|||', $extra_meeting);
                                        $extra_meeting_id = $extra_meeting_x[3];
                                        $extra_meeting_display = substr($extra_meeting_x[0], 0, 30) . ' ' . $extra_meeting_x[1] . ' ' . $extra_meeting_x[2] . $extra_meeting_id; ?>
                                        <option <?php echo ($this->options['extra_meetings'] != '' && in_array($extra_meeting_id, $this->options['extra_meetings']) ? 'selected="selected"' : '') ?> value="<?php echo $extra_meeting_id ?>"><?php echo esc_html($extra_meeting_display) ?></option>
                                        <?php
                                    }
                                } ?>
                            </select>
                            <p>Hint: Type a group name, weekday, area or id to narrow down your choices.</p>
                            <div>
                                <input type="checkbox" name="extra_meetings_enabled" value="1" <?php echo ($this->options['extra_meetings_enabled'] == 1 ? 'checked' : '') ?> /> Extra Meetings Enabled
                            </div>
                        </div>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-custom-query" class="anchor"></a>Custom Query</h3>
                        <p>This will allow to specify a custom BMLT query.  This will override any other filtering including service bodies.</p>
                        <ul>
                            <li>
                                <label for="custom_query">Custom Query: </label>
                                <input id="custom_query" name="custom_query" size="50" value="<?php echo (isset($this->options['custom_query']) ? $this->options['custom_query'] : ""); ?>" />
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-theme" class="anchor"></a>Theme</h3>
                        <p>Allows for setting a pre-packaged theme.  (Have a custom built theme?  Please submit your CSS <a target="_blank" href="https://github.com/bmlt-enabled/crouton/issues/new?assignees=&labels=theme&template=custom-theme-template.md&title=Custom+Theme+Submission+Request">here</a>.)</p>
                        <ul>
                            <li><p><b>The default original theme is called "jack".  If no theme is selected, the default one will be used.</b></p></li>
                            <li>
                                <select style="display:inline;" id="theme" name="theme"  class="theme_select">
                                    <?php
                                    foreach ($this->themes as $theme) { ?>
                                        <option <?php if ($theme === $this->options['theme']) {
                                                    echo "selected";
                                                } else {
                                                    echo "";
                                                }
                                                ?> value="<?php echo $theme ?>"><?php echo $theme == "jack" ? "jack (default)" : $theme ?></option>
                                        <?php
                                    }?>
                                </select>
                            </li>
                        </ul>
                    </div>
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

                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-meeting-data-template" class="anchor"></a>Meeting Data Template</h3>
                        <p>This allows a customization of the meeting data template.  A list of available fields are
                        <span style="text-align:center;padding:20px 0;"> 
<input alt="#TB_inline?height=300&amp;width=400&amp;inlineId=examplePopup1" title="Show Handlebar Variables" class="thickbox" type="button" value="here" />.</p> 
                        <ul>
                            <li>
                                <textarea id="meeting_data_template" class="handlebarsCode" name="meeting_data_template" cols="100" rows="10"><?php echo isset($this->options['meeting_data_template']) ? html_entity_decode($this->options['meeting_data_template']) : "___DEFAULT___"; ?></textarea>
                            </li>
                            <li>
                                <input type="button" id="reset_meeting_data_template" value="RESET TO DEFAULT" class="button-secondary" />
                            </li>
                        </ul>
                        <script type="text/javascript">
                            jQuery("#reset_meeting_data_template").click(function() {
                                resetCodemirrorToDefault("meeting_data_template");
                            });
                        </script>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-metadata-data-template" class="anchor"></a>Metadata Template</h3>
                        <p>This allows a customization of the metadata template (3rd column).  A list of available fields are
                        <span style="text-align:center;padding:20px 0;"> 
<input alt="#TB_inline?height=300&amp;width=400&amp;inlineId=examplePopup1" title="Show Handlebar Variables" class="thickbox" type="button" value="here" />.</p> 
                        <ul>
                            <li>
                                <textarea id="metadata_template" class="handlebarsCode" name="metadata_template" cols="100" rows="10"><?php echo isset($this->options['metadata_template']) ? html_entity_decode($this->options['metadata_template']) : "___DEFAULT___"; ?></textarea>
                            </li>
                            <li>
                                <input type="button" id="reset_metadata_template" value="RESET TO DEFAULT" class="button-secondary" />
                            </li>
                        </ul>
                        <script type="text/javascript">
                            jQuery("#reset_metadata_template").click(function() {
                                resetCodemirrorToDefault("metadata_template");
                            });
                        </script>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-meeting-details-page" class="anchor"></a>Meeting Details Page</h3>
                        <p>This allows a customization of the view of the meeting data that you get when you click on the meeting name.  A list of available fields are
                        <span style="text-align:center;padding:20px 0;"> 
<input alt="#TB_inline?height=300&amp;width=400&amp;inlineId=examplePopup1" title="Show Handlebar Variables" class="thickbox" type="button" value="here" />.</p> 
                        <ul>
                            <li>
                                <label for="meetingpage_title_template">Title</label>
                                <textarea id="meetingpage_title_template" class="handlebarsCode" name="meetingpage_title_template" cols="100" rows="2"><?php echo isset($this->options['meetingpage_title_template']) ? html_entity_decode($this->options['meetingpage_title_template']) : "___DEFAULT___"; ?></textarea>
                            </li>
                            <li>
                                <label for="meetingpage_contents_template">Contents</label>
                                <textarea id="meetingpage_contents_template" class="handlebarsCode" name="meetingpage_contents_template" cols="100" rows="20"><?php echo isset($this->options['meetingpage_contents_template']) ? html_entity_decode($this->options['meetingpage_contents_template']) : "___DEFAULT___"; ?></textarea>
                            </li>
                            <li>
                                <input type="button" id="reset_meetingpage_templates" value="RESET TO DEFAULT" class="button-secondary" />
                            </li>
                        </ul>
                        <script type="text/javascript">
                            jQuery("#reset_meetingpage_templates").click(function() {
                                resetCodemirrorToDefault("meetingpage_title_template");
                                resetCodemirrorToDefault("meetingpage_contents_template");
                            });
                        </script>
                        <p>By default, the meeting details are inserted onto the same page as the crouton table itself, replacing the table.  This might not
                        be appropriate.  If you want to use an additional page (or blog post) to display the meeting details, you may enter the path to the page here.
                        Use the [bmlt_handlebar] shortcode to insert the meeting information into the static text (eg, [bmlt_handlebar]{{meeting_name}}[/bmlt_handlebar]).
                        The partials "meetingpageTitleTemplate" and "meetingpageContentsTemplate", defined in the two code areas above, are available for use in this way.
                        </p>
                        <ul>
                            <li>
                                <label for="meeting_details_href">URI for in-person (and hybrid) meetings: </label>
                                <input id="meeting_details_href" type="text" size="50" name="meeting_details_href" value="<?php echo $this->options['meeting_details_href']; ?>" onkeyup='show_create_detail_option(this)'/>
                            </li>
                            <li>
                                <label for="virtual_meeting_details_href">URI for virtual meetings: </label>
                                <input id="virtual_meeting_details_href" type="text" size="50" name="virtual_meeting_details_href" value="<?php echo $this->options['virtual_meeting_details_href']; ?>" onkeyup='show_create_detail_option(this)'/>
                                <p>If no value is specified for virtual meetings, the in-person meeting link will be used.</p>
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3><a id="config-custom-css" class="anchor"></a>Custom CSS</h3>
                        <p>Allows for custom styling of your crouton.</p>
                        <ul>
                            <li>
                                <textarea id="custom_css" name="custom_css" cols="100" rows="10"><?php echo (isset($this->options['custom_css']) ? html_entity_decode($this->options['custom_css']) : ""); ?></textarea>
                            </li>
                        </ul>
                    </div>
                    <input type="submit" value="SAVE CHANGES" name="bmlttabssave" class="button-primary" />
                </form>
                <br/><br/>
                <?php include 'partials/_instructions.php'; ?>
            </div>
            <script type="text/javascript">getValueSelected();</script>
            <?php
        }
        /**
         * @desc Adds the Settings link to the plugin activate/deactivate page
         */
        public function filterPluginActions($links, $file)
        {
            // If your plugin is under a different top-level menu than Settings (IE - you changed the function above to something other than add_options_page)
            // Then you're going to want to change options-general.php below to the name of your top-level page
            $settings_link = '<a href="options-general.php?page=' . basename(__FILE__) . '">' . __('Settings') . '</a>';
            array_unshift($links, $settings_link);
            // before other links
            return $links;
        }
        /**
         * Retrieves the plugin options from the database.
         * @return array
         */
        private function getOptions()
        {
            // Don't forget to set up the default options
            if (!$theOptions = get_option($this->optionsName)) {
                $theOptions = array(
                    'root_server' => '',
                    'service_body_1' => ''
                );
                update_option($this->optionsName, $theOptions);
            }
            $this->options = $theOptions;
            $this->options['root_server'] = untrailingslashit(preg_replace('/^(.*)\/(.*php)$/', '$1', $this->options['root_server']));

            if (!isset($this->options['crouton_version'])) {
                $this->options['crouton_version'] = "3.17";
                $this->options['meeting_data_template'] = str_replace('{{this.meeting_name}}', "{{> meetingLink this}}", $this->options['meeting_data_template']);
            }
        }
        /**
         * Saves the admin options to the database.
         */
        private function saveAdminOptions()
        {
            $this->options['root_server'] = untrailingslashit(preg_replace('/^(.*)\/(.*php)$/', '$1', $this->options['root_server']));
            update_option($this->optionsName, $this->options);
            return;
        }
        /**
         * @param $root_server
         * @return array
         */
        private function getAllFields($root_server)
        {
            try {
                $results = wp_remote_get($root_server . "/client_interface/json/?switcher=GetFieldKeys");
                return json_decode(wp_remote_retrieve_body($results), true);
            } catch (Exception $e) {
                return [];
            }
        }
        private function templateToParameter($name)
        {
            if (isset($atts[$name]) && $atts[$name] !== null && $atts[$name] !== "") {
                $template = $atts[$name];
            } elseif (isset($this->options[$name])) {
                $template = $this->options[$name];
            } else {
                $template = "";
            }
            return html_entity_decode($template);
        }
        private function getAllMeetings($root_server)
        {
            $results = wp_remote_get($root_server . "/client_interface/json/?switcher=GetSearchResults&data_field_key=weekday_tinyint,start_time,service_body_bigint,id_bigint,meeting_name,location_text,email_contact&sort_keys=meeting_name,service_body_bigint,weekday_tinyint,start_time");
            $result = json_decode(wp_remote_retrieve_body($results), true);
            $unique_areas = $this->getAreas($root_server, 'dropdown');
            $all_meetings = array();
            foreach ($result as $value) {
                foreach ($unique_areas as $unique_area) {
                    $area_data = explode(',', $unique_area);
                    $area_id = $area_data[1];
                    if ($area_id === $value['service_body_bigint']) {
                        $area_name = $area_data[0];
                    }
                }
                $value['start_time'] = date("g:iA", strtotime($value['start_time']));
                $all_meetings[] = $value['meeting_name'].'||| ['.$value['weekday_tinyint'].'] ['.$value['start_time'].']||| ['.$area_name.']||| ['.$value['id_bigint'].']';
            }
            return $all_meetings;
        }
        private function getCroutonJsConfig($atts)
        {
            // Pulling simple values from options
            $defaults = $this->shortCodeOptions;
            foreach ($defaults as $key => $value) {
                $defaults[$key] = (isset($this->options[$key]) ? $this->options[$key] : $value);
            }
            $params = shortcode_atts($defaults, $atts);

            // Pulling from querystring
            foreach ($params as $key => $value) {
                $params[$key] = (isset($_GET[$key]) ? $_GET[$key] : $value);
            }

            $legacy_force_recurse = false;
            if ($params['service_body_parent'] == null && $params['service_body'] == null) {
                // Pulling from configuration
                $area_data       = explode(',', $this->options['service_body_1']);
                $service_body = [$area_data[1]];
                $parent_body_id  = $area_data[2];
                if ($parent_body_id == '0') {
                    $legacy_force_recurse = true;
                }
            } else {
                // Shortcode based settings
                if ($params['service_body_parent'] != null) {
                    $service_body = array_map('trim', explode(",", $params['service_body_parent']));
                    $legacy_force_recurse = true;
                } elseif ($params['service_body'] != null) {
                    $service_body = array_map('trim', explode(",", $params['service_body']));
                }
            }

            $params['button_filters'] = [];
            if (strlen($params['button_filters_option']) > 0) {
                foreach (explode(",", $params['button_filters_option']) as $item) {
                    $setting = explode(":", $item);
                    if (strcmp($params['include_city_button'], "0") == 0 && strcmp($setting[0], "City") == 0) {
                        continue;
                    }
                    array_push($params['button_filters'], ['title' => $setting[0], 'field' => $setting[1]]);
                }
            }
            $tmp_formats = [];
            if (strlen($params['formats']) > 0) {
                foreach (explode(",", $params['formats']) as $item) {
                    array_push($tmp_formats, $item);
                }
            }
            $params['formats'] = $tmp_formats;

            $tmp_venue = [];
            if (strlen($params['venue_types']) > 0) {
                foreach (explode(",", $params['venue_types']) as $item) {
                    array_push($tmp_venue, $item);
                }
            }
            $params['venue_types'] = $tmp_venue;

            $params['button_format_filters'] = [];
            if (strlen($params['button_format_filters_option']) > 0) {
                foreach (explode(",", $params['button_format_filters_option']) as $item) {
                    $setting = explode(":", $item);
                    array_push($params['button_format_filters'], ['title' => $setting[0], 'field' => $setting[1]]);
                }
            }

            /*$convert_to_int = array("latitude", "longitude", "width", "zoom");
            $params['map_search'] = null;
            foreach (explode(",", $params['map_search_option']) as $item) {
                $setting = explode(":", $item);
                $key = trim($setting[0]);
                $value = trim($setting[1]);
                $params['map_search'][$key] = intval($value);
            }*/

            $params['service_body'] = $service_body;
            $params['exclude_zip_codes'] = (!is_null($params['exclude_zip_codes']) ? explode(",", $params['exclude_zip_codes']) : array());

            if ($legacy_force_recurse) {
                $params['recurse_service_bodies'] = true;
            } elseif (isset($_GET['recurse_service_bodies'])) {
                $params['recurse_service_bodies'] = filter_var($_GET['recurse_service_bodies'], FILTER_VALIDATE_BOOLEAN);
            } elseif (!isset($atts['recurse_service_bodies'])) {
                $params['recurse_service_bodies'] = $this->options['recurse_service_bodies'];
            }

            $params['custom_query'] = $this->getCustomQuery($params['custom_query']);
            $params['template_path'] = plugin_dir_url(__FILE__) . 'croutonjs/dist/templates/';
            $params['theme'] = $params['theme'] != '' ? $params['theme'] : $this->options['theme'];
            $params['custom_css'] = html_entity_decode($this->options['custom_css']);
            $params['int_include_unpublished'] = $params['include_unpublished'];

            $params['meeting_data_template'] = $this->templateToParameter('meeting_data_template');
            $params['metadata_template'] = $this->templateToParameter('metadata_template');
            $params['meetingpage_title_template'] = $this->templateToParameter('meetingpage_title_template');
            $params['meetingpage_contents_template'] = $this->templateToParameter('meetingpage_contents_template');

            $params['missing_api_key'] = 0;
            if (empty($this->options['google_api_key']) && !has_filter("crouton_map_create_control")) {
                $params['missing_api_key'] = 1;
            }
            $extra_meetings_array = [];
            if (isset($this->options['extra_meetings']) && !isset($_GET['meeting-id'])) {
                foreach ($this->options['extra_meetings'] as $value) {
                    $data = array(" [", "]");
                    array_push($extra_meetings_array, str_replace($data, "", $value));
                }
            }

            $params['extra_meetings'] = $extra_meetings_array;

            if (empty($params['meeting_details_href'])) {
                $params['meeting_details_href'] = strtok($_SERVER["REQUEST_URI"], '?');
            }
            $this->options['meeting_details_href'] = $params['meeting_details_href'];
             
            $params['force_rootserver_in_querystring'] = ($params['root_server'] !== $this->options['root_server']);
            
            $params = apply_filters('crouton_configuration', $params);
            
            return [json_encode($params), $this->meetingMapController->getMapJSConfig($params)];
        }
    }
    //End Class Crouton
}
// end if
// instantiate the class
if (class_exists("Crouton")) {
    $BMLTTabs_instance = new Crouton();
}
?>
