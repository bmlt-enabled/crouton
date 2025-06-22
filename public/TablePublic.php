<?php
namespace Crouton;

if (! defined('WPINC')) {
    die;
}
if (!class_exists("Crouton\TablePublic")) {
    // phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace
    class TablePublic
    {
        const END_WAIT_MESSAGE = "document.getElementById('please-wait').style.display='none';";
        private MapPublic $map;
        private TableOptions $crouton;
        private ?array $formats = null;
        public function __construct($crouton)
        {
            $this->crouton = $crouton;
            require_once(__DIR__."/MapPublic.php");
            $this->map = new MapPublic($crouton->getMapOptions());
            add_action("wp_enqueue_scripts", array(&$this, "enqueueFrontendFiles"));
            add_shortcode('init_crouton', array(
                &$this,
                "blank"
            ));
            add_shortcode('bmlt_tabs', array(
                &$this,
                "replaceShortcodeWithStandardTags"
            ));
            add_shortcode('crouton_map', array(
                &$this,
                "replaceShortcodeWithStandardTags"
            ));
            add_shortcode('crouton_tabs', array(
                &$this,
                "replaceShortcodeWithStandardTags"
            ));
            add_shortcode('bmlt_map', array(
                &$this,
                "replaceShortcodeWithStandardTags"
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
        private function croutonInitializationScript(): string
        {
            $post_to_check = get_post(get_the_ID());
            $post_content = $post_to_check->post_content ?? '';
            $post_content = apply_filters('Crouton_post_content', $post_content);
            $tags = ['bmlt_tabs', 'bmlt_map', 'crouton_map', 'crouton_tabs', 'bmlt_handlebar', 'init_crouton'];
            preg_match_all('/' . get_shortcode_regex($tags) . '/', $post_content, $matches, PREG_SET_ORDER);
            if (empty($matches)) {
                return '';
            }

            foreach ($matches as $shortcode) {
                if (isset($_GET['meeting-id'])) {
                    $shortcode[2] = 'bmlt_handlebar';
                    $shortcode[3] = '';
                }
                switch ($shortcode[2]) {
                    case 'bmlt_tabs':
                        $script = $this->renderTable(shortcode_parse_atts($shortcode[3]));
                        break;
                    case 'init_crouton':
                        $script = $this->initCrouton(shortcode_parse_atts($shortcode[3]));
                        break;
                    case 'crouton_map':
                        $script = $this->renderMap(shortcode_parse_atts($shortcode[3]));
                        break;
                    case 'crouton_tabs':
                        $atts = shortcode_parse_atts($shortcode[3]);
                        $atts['noMap'] = true;
                        $script = $this->renderMap($atts);
                        break;
                    case 'bmlt_map':
                        $atts = shortcode_parse_atts($shortcode[3]);
                        if (is_array($atts)) {
                            $atts['has_venues'] = '0';
                        } else {
                            $atts = ["has_venues" => "0"];
                        }
                        $script = $this->renderMap($atts, false);
                        break;
                    case 'bmlt_handlebar':
                        $script = $this->handlebarFooterScript();
                        break;
                    default:
                        $script = '';
                        break;
                }
                if ($script != '') {
                    return $script;
                }
            }
            return '';
        }
        /**
        * @desc Adds JS/CSS to the header
        */
        public function enqueueFrontendFiles()
        {
            $script = $this->croutonInitializationScript();
            if ($script !== '') {
                wp_enqueue_style("croutoncss", plugin_dir_url(__DIR__) . "croutonjs/dist/crouton-core.min.css", false, filemtime(plugin_dir_path(__DIR__) . "croutonjs/dist/crouton-core.min.css"), false);
                wp_enqueue_script("croutonjs", plugin_dir_url(__DIR__) . "croutonjs/dist/crouton.nojquery.min.js", array('jquery'), filemtime(plugin_dir_path(__DIR__) . "croutonjs/dist/crouton.nojquery.min.js"), true);
                $this->map->enqueueFrontendFiles("crouton-delegate");
                wp_add_inline_script("crouton-delegate", $script);
            }
        }

        private function outputTag(): string
        {
            $output = '<div class="bootstrap-bmlt" id="please-wait"><button class="btn btn-lg btn-info"><span class="glyphicon glyphicon-repeat glyphicon-repeat-animate"></span>Fetching...</button></div>';
            if (isset($_GET['this_title'])) {
                $title =  sanitize_text_field(wp_unslash($_GET['this_title']));
                $output .= '<div class="bmlt_tabs_title">' . $title . '</div>';
            }

            if (isset($_GET['sub_title'])) {
                $title =  sanitize_text_field(wp_unslash($_GET['sub_title']));
                $output .= '<div class="bmlt_tabs_sub_title">' . $title . '</div>';
            }
            return $output.'<div id="bmlt-tabs" class="bmlt-tabs hide"></div>';
        }
        /**
         * When we are processing the main shortcodes themselves, we can just insert standard tags, because the difference is
         * in how we initialize the JS Crouton object.  And we do that when deciding whether to enqueue scripts or not.
         *
         * @return string
         */
        public function replaceShortcodeWithStandardTags(): string
        {
            if (isset($_GET['meeting-id'])) {
                return do_shortcode($this->getDefaultMeetingDetailsPageContents());
            }
            return $this->outputTag();
        }
        public function bmltHandlebar(array $atts, $template = null): string
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
            return sprintf('<bmlt-handlebar style="display:none;"><span style="display:none;">%s</span>Fetching...</bmlt-handlebar>', htmlspecialchars($template));
        }
        private function getMapInitialization(string $mapConfig): string
        {
            $className = $this->map->className();
            return  "window.croutonMap = new $className($mapConfig);";
        }
        private function getInitializeCroutonBlock(string $renderCmd, string $config, string $mapConfig): string
        {
            $croutonMap =  $this->getMapInitialization($mapConfig);
            return "var crouton;jQuery(document).ready(function() { $croutonMap crouton = new Crouton($config); $renderCmd });";
        }

        private function renderTable(array $atts): string
        {
            return $this->getInitializeCroutonBlock("crouton.render();".TablePublic::END_WAIT_MESSAGE, ...$this->getCroutonJsConfig($atts));
        }

        private function renderMap(array $atts, $croutonMap = true): string
        {
            if ($croutonMap) {
                // This loads a map in which BMLT queries can be initiated
                return $this->getInitializeCroutonBlock("crouton.searchMap();".TablePublic::END_WAIT_MESSAGE, ...$this->getCroutonJsConfig($atts, true));
            }
            // This is the map UI, but loading meetings like in the table form, only at startu
            return $this->getInitializeCroutonBlock("crouton.render(true);".TablePublic::END_WAIT_MESSAGE, ...$this->getCroutonJsConfig($atts));
        }

        public function initCrouton($atts)
        {
            return $this->getInitializeCroutonBlock("crouton.renderMeetingCount();", ...$this->getCroutonJsConfig($atts));
        }

        public function blank()
        {
            return '';
        }

        public function meetingCount($atts)
        {
            if (isset($_GET['meeting-id'])) {
                return '1';
            }
            $live = '';
            if (is_array($atts) && isset($atts['live']) && $atts['live']=='1') {
                $live = "-live";
            }
            return "<span id='bmlt_tabs_meeting_count$live'>Fetching...</span>";
        }

        public function groupCount($atts)
        {
            if (isset($_GET['meeting-id'])) {
                return '1';
            }
            $live = '';
            if (is_array($atts) && isset($atts['live']) && $atts['live']=='1') {
                $live = "-live";
            }
            return "<span id='bmlt_tabs_group_count$live'>Fetching...</span>";
        }

        public function serviceBodyNames($atts)
        {
            if (isset($_GET['meeting-id'])) {
                return '';
            }
            $live = '';
            if (is_array($atts) && isset($atts['live']) && $atts['live']=='1') {
                $live = "-live";
            }
            return "<span id='bmlt_tabs_service_body_names$live'>Fetching...</span>";
        }
        public function handlebarFooterScript()
        {
            if (!isset($_GET['meeting-id'])) {
                return;
            }
            $meetingId = intval($_GET['meeting-id']);
            $attr = ['custom_query' => '&meeting_ids[]='.$meetingId,
                     'strict_datafields' => false];
            [$config, $mapConfig] = $this->getCroutonJsConfig($attr);
            $croutonMap =  $this->getMapInitialization($mapConfig);
            $ret = "var crouton;"
            ."jQuery(document).ready(function() { $croutonMap crouton = new Crouton($config); crouton.doHandlebars();})";
            return $ret;
        }
        private function getDefaultMeetingDetailsPageContents(): string
        {
            return file_get_contents(plugin_dir_path(__DIR__) . "public/default_meeting_details.html");
        }
        private function getFormats(string $root_server): ?array
        {
            if (is_null($this->formats)) {
                if (strpos($root_server, 'aggregator.bmltenabled.org') === false) {
                    $results = wp_remote_get($root_server . "/client_interface/json/?switcher=GetFormats");
                    $this->formats = json_decode(wp_remote_retrieve_body($results), true);
                } else {
                    $this->formats = [];
                }
            }
            return $this->formats;
        }
        /**
         *
         * @param array $atts
         * @param boolean $croutonMap true if we are processing a crouton_map or crouton_tabs shortcode
         * @return array return value has 2 elements, the first is the configuration of the main Crouton JS object, the second is the configuration of the Map object.
         */
        private function getCroutonJsConfig(array $atts, $croutonMap = false): array
        {
            $options = $this->crouton->getOptions();
            /***  Pulling simple values from options
            $defaults = array_merge($this->shortCodeOptions, $this->meetingMapController->getDefaultOptions());
            foreach ($defaults as $key => $value) {
                $defaults[$key] = (isset($this->options[$key]) ? $this->options[$key] : $value);
            }
                */
            if (isset($atts['button_filters'])) {
                $atts['grouping_buttons'] = $atts['button_filters'];
                unset($atts['button_filters']);
            }
            if (isset($atts['button_filters_option'])) {
                $atts['grouping_buttons'] = $atts['button_filters_option'];
                unset($atts['button_filters_option']);
            }
            if (isset($atts['button_format_filters_option'])) {
                $atts['formattype_grouping_buttons'] = $atts['button_format_filters_option'];
                unset($atts['button_format_filters_option']);
            }
            $params = shortcode_atts($options, $atts);

            // Pulling from querystring
            foreach ($params as $key => $value) {
                $params[$key] = (isset($_GET[$key]) ? $_GET[$key] : $value);
            }

            $legacy_force_recurse = false;
            if ($params['service_body_parent'] == null && $params['service_body'] == null) {
                // Pulling from configuration
                $service_body = [];
                $parent_body_id = '0';
                foreach ($options['service_bodies'] as $single_service_body) {
                    $area_data       = explode(',', $single_service_body);
                    if (sizeof($area_data) < 2) {
                        continue;
                    }
                    $service_body[] = $area_data[1];
                    $parent_body_id  = $area_data[2];
                }
                // No idea.  Old logic.
                if ($parent_body_id == '0' && sizeof($options['service_bodies']) == 1) {
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

            $params['grouping_buttons'] = $this->convertToArray($params['grouping_buttons']);

            if (strcmp($params['include_distance_button'], "1") == 0 || strcmp($params['view_by'], 'distance') == 0) {
                array_push($params['grouping_buttons'], ['title' => 'Distance', 'field' => 'distance_in_km']);
            }
            $tmp_formats = [];
            if (strlen($params['formats']) > 0) {
                foreach (explode(",", $params['formats']) as $item) {
                    if (!is_numeric($item)) {
                        $item = trim($item);
                        $neg = false;
                        if (substr($item, 0, 1) == '-') {
                            $neg = true;
                            $item = substr($item, 1);
                        }
                        $formats = $this->getFormats($params['root_server']);
                        foreach ($formats as $format) {
                            if ($format['key_string'] == $item) {
                                array_push($tmp_formats, ($neg ? '-' : '') . $format['id']);
                                break;
                            }
                        }
                    } else {
                        array_push($tmp_formats, $item);
                    }
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

            $params['formattype_grouping_buttons'] = $this->convertToArray($params['formattype_grouping_buttons']);

            $params['service_body'] = $service_body;
            unset($params['service_bodies']);

            $params['exclude_zip_codes'] = (!is_null($params['exclude_zip_codes']) ? explode(",", $params['exclude_zip_codes']) : array());

            if ($legacy_force_recurse) {
                $params['recurse_service_bodies'] = true;
            } elseif (isset($_GET['recurse_service_bodies'])) {
                $params['recurse_service_bodies'] = filter_var($_GET['recurse_service_bodies'], FILTER_VALIDATE_BOOLEAN);
            }

            $params['custom_query'] = $this->crouton->getCustomQuery($params['custom_query']);
            $params['template_path'] = plugin_dir_url(__DIR__) . 'croutonjs/dist/templates/';
            $params['theme'] = $params['theme'] != '' ? $params['theme'] : 'jack';
            $params['custom_css'] = html_entity_decode($params['custom_css']);
            $params['int_include_unpublished'] = $params['include_unpublished'];

            $mapParams['google_api_key'] = $params['google_api_key'];
            $mapParams['template_path'] = $params['template_path'];
            $extra_meetings_array = [];
            if (isset($this->options['extra_meetings']) && !isset($_GET['meeting-id'])) {
                foreach ($options['extra_meetings'] as $value) {
                    $data = array("[", "]");
                    array_push($extra_meetings_array, trim(str_replace($data, "", $value)));
                }
            }

            $params['extra_meetings'] = $extra_meetings_array;

            if (empty($params['meeting_details_href'])) {
                $request_uri = sanitize_url(wp_unslash($_SERVER["REQUEST_URI"]));
                if (empty(get_option('permalink_structure'))) {
                    $params['meeting_details_href'] = $request_uri;
                } else {
                    $params['meeting_details_href'] = strtok($request_uri, '?');
                }
            }
            $this->crouton->set('meeting_details_href', $params['meeting_details_href']);

            $params['force_rootserver_in_querystring'] = ($params['root_server'] !== $options['root_server']);
            if (!function_exists('is_plugin_active')) {
                include_once ABSPATH . 'wp-admin/includes/plugin.php';
            }
            $params['bmlt2ics'] = (is_plugin_active('bmlt2calendar/bmlt2calendar.php')) ? get_feed_link('bmlt2ics') : "";
            $params = apply_filters('crouton_configuration', $params);

            return [json_encode($params), $this->map->getMapJSConfig($params, $croutonMap)];
        }
        private function convertToArray($str) : array
        {
            $ret = [];
            $str = trim($str);
            if (strlen($str) > 0) {
                foreach (explode(",", $str) as $item) {
                    $setting = explode(":", $item);
                    if (sizeof($setting) == 2) {
                        array_push($ret, ['title' => $setting[0], 'field' => $setting[1]]);
                    }
                    if (sizeof($setting) == 3) {
                        array_push($ret, ['title' => $setting[0], 'field' => $setting[1], 'accordionState' => $setting[2]]);
                    }
                }
            }
            return $ret;
        }
    }
}
