<?php
/*
Plugin Name: crouton
Plugin URI: https://wordpress.org/plugins/crouton/
Description: A tabbed based display for showing meeting information.
Author: bmlt-enabled
Author URI: https://bmlt.app
Version: 2.6.0
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
        public $options = array();
        public $exclude_zip_codes = null;
        public static $HOUR_IN_SECONDS = 3600;
        const COUNT_TYPES = array(
            ['name' => 'group', 'cache_key_prefix' => 'bmlt_tabs_gc_', 'field' => array('worldid_mixed','meeting_name')],
            ['name' => 'meeting', 'cache_key_prefix' => 'bmlt_tabs_mc_', 'field' => array('id_bigint')]
        );
        const HTTP_RETRIEVE_ARGS = array(
            'headers' => array(
                'User-Agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0) +crouton'
            ),
            'timeout' => 60
        );
        public function __construct()
        {
            $this->getOptions();
            if (is_admin()) {
                // Back end
                add_action("admin_notices", array(&$this, "isRootServerMissing"));
                add_action("admin_enqueue_scripts", array(&$this, "enqueueBackendFiles"), 500);
                add_action("admin_menu", array(&$this, "adminMenuLink"));
            } else {
                // Front end
                add_action("wp_enqueue_scripts", array(&$this, "enqueueFrontendFiles"));
                add_shortcode('bmlt_tabs', array(
                    &$this,
                    "tabbedUi"
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
                    "bmltGroupCount"
                ));
            }
            // Content filter
            add_filter('the_content', array(
                &$this,
                'filterContent'
            ), 0);
        }

        public function hasShortcode()
        {
            $post_to_check = get_post(get_the_ID());
            // check the post content for the short code
            if (stripos($post_to_check->post_content, '[bmlt_tabs') !== false) {
                echo '<div class="bootstrap-bmlt" id="please-wait"><button class="btn btn-lg btn-info"><span class="glyphicon glyphicon-repeat glyphicon-repeat-animate"></span>Fetching...</button></div>';
                return true;
            }
            if (stripos($post_to_check->post_content, '[bmlt_count') !== false) {
                return true;
            }
            if (stripos($post_to_check->post_content, '[meeting_count') !== false) {
                return true;
            }
            if (stripos($post_to_check->post_content, '[group_count') !== false) {
                return true;
            }
            return false;
        }

        public function isRootServerMissing()
        {
            $root_server = $this->options['root_server'];
            if ($root_server == '') {
                echo '<div id="message" class="error"><p>Missing BMLT Root Server in settings for crouton.</p>';
                $url = admin_url('options-general.php?page=crouton.php');
                echo "<p><a href='$url'>crouton Settings</a></p>";
                echo '</div>';
            }
            add_action("admin_notices", array(
                &$this,
                "clearAdminMessage"
            ));
        }

        public function clearAdminMessage()
        {
            remove_action("admin_notices", array(
                &$this,
                "isRootServerMissing"
            ));
        }
        // phpcs:disable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
        public function Crouton()
        {
        // phpcs:enable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
            $this->__construct();
        }

        public function filterContent($content)
        {
            return $content;
        }

        public function includeToString($file)
        {
            ob_start();
            include($file);
            return ob_get_clean();
        }

        /**
        * @param $hook
        */
        public function enqueueBackendFiles($hook)
        {
            if ($hook == 'settings_page_crouton') {
                wp_enqueue_style('bmlt-tabs-admin-ui-css', plugins_url('css/south-street/jquery-ui.css', __FILE__), false, '1.11.4', false);
                wp_enqueue_style("chosen", plugin_dir_url(__FILE__) . "css/chosen.min.css", false, "1.2", 'all');
                wp_enqueue_style("crouton-admin", plugin_dir_url(__FILE__) . "css/crouton-admin.css", false, "1.1", 'all');
                wp_enqueue_script("chosen", plugin_dir_url(__FILE__) . "js/chosen.jquery.min.js", array('jquery'), "1.2", true);
                wp_enqueue_script('bmlt-tabs-admin', plugins_url('js/bmlt_tabs_admin.js', __FILE__), array('jquery'), filemtime(plugin_dir_path(__FILE__) . "js/bmlt_tabs_admin.js"), false);
                wp_enqueue_script('common');
                wp_enqueue_script('jquery-ui-accordion');
            }
        }

        /**
        * @desc Adds JS/CSS to the header
        */
        public function enqueueFrontendFiles()
        {
            if ($this->hasShortcode()) {
                $frontend_styles = array(
                    ['title' => 'bmlt-tabs-select2', 'path' => 'select2.min.css'],
                    ['title' => 'bmlt-tabs-bootstrap', 'path' => 'bootstrap.min.css'],
                    ['title' => 'bmlt-tabs', 'path' => 'bmlt_tabs.css'],
                );
                foreach ($frontend_styles as $frontend_style) {
                    wp_enqueue_style($frontend_style['title'], plugin_dir_url(__FILE__) . "css/" . $frontend_style['path'], false, filemtime(plugin_dir_path(__FILE__) . "css/" . $frontend_style['path']), false);
                }
                $frontend_scripts = array(
                    ['title' => 'bmlt-tabs-bootstrap', 'path' => 'bootstrap.min.js'],
                    ['title' => 'bmlt-tabs-select2', 'path' => 'select2.full.min.js'],
                    ['title' => 'tablesaw', 'path' => 'tablesaw.jquery.3.0.9.js'],
                    ['title' => 'handlebars', 'path' => 'handlebars-v4.0.12.js'],
                    ['title' => 'momentjs', 'path' => 'moment.js'],
                    ['title' => 'bmlt-tabs', 'path' => 'bmlt_tabs.js'],
                    ['title' => 'spinjs', 'path' => 'spin.2.3.2.js'],
                    ['title' => 'punycode', 'path' => 'punycode.js'],
                );
                foreach ($frontend_scripts as $frontend_script) {
                    wp_enqueue_script($frontend_script['title'], plugin_dir_url(__FILE__) . "js/" . $frontend_script['path'], array('jquery'), filemtime(plugin_dir_path(__FILE__) . "js/" . $frontend_script['path']), true);
                }
            }
        }

        public function sortBySubkey(&$array, $subkey, $sortType = SORT_ASC)
        {
            foreach ($array as $subarray) {
                $keys[] = $subarray[$subkey];
            }
            array_multisort($keys, $sortType, $array);
        }

        public function getNameFromServiceBodyID($serviceBodyID)
        {
            $bmlt_search_endpoint =  wp_remote_get($this->options['root_server'] . "/client_interface/json/?switcher=GetServiceBodies", Crouton::HTTP_RETRIEVE_ARGS);
            $serviceBodies = json_decode(wp_remote_retrieve_body($bmlt_search_endpoint));
            foreach ($serviceBodies as $serviceBody) {
                if ($serviceBody->id == $serviceBodyID) {
                    return $serviceBody->name;
                }
            }
        }

        public function getMeetingsJson($url)
        {
            $results = wp_remote_get($url, Crouton::HTTP_RETRIEVE_ARGS);
            $httpcode = wp_remote_retrieve_response_code($results);
            $response_message = wp_remote_retrieve_response_message($results);
            if ($httpcode != 200 && $httpcode != 302 && $httpcode != 304 && ! empty($response_message)) {
                echo "<p style='color: #FF0000;'>Problem Connecting to BMLT Root Server: $url</p>";
                return 0;
            }
            $result = wp_remote_retrieve_body($results);
            if ($result == null || count(json_decode($result)) == 0) {
                echo "<p style='color: #FF0000;'>No Meetings were Found: $url</p>";
                return 0;
            }
            return $result;
        }

        public function getDay($day)
        {
            return $words['days_of_the_week'][$day];
        }

        public function getCustomQuery($custom_query)
        {
            if (isset($_GET['custom_query'])) {
                return $_GET['custom_query'];
            } elseif (isset($this->options['custom_query']) && strlen($this->options['custom_query']) > 0) {
                return $this->options['custom_query'];
            } elseif (isset($custom_query) && $custom_query != null) {
                return html_entity_decode($custom_query);
            } else {
                return null;
            }
        }

        public function getTheFormatsJson($root_server, $meetings = null)
        {
            $get_all_ids = array_column(json_decode($meetings, true), 'format_shared_id_list');
            $join_ids = implode(',', $get_all_ids);
            $ids_array = explode(',', $join_ids);
            $unique_ids = array_unique($ids_array);
            $formats_all = wp_remote_retrieve_body(wp_remote_get("$root_server/client_interface/json/?switcher=GetFormats", Crouton::HTTP_RETRIEVE_ARGS));
            $formats_all_json = json_decode($formats_all, true);
            $formats = array();

            foreach ($formats_all_json as $format) {
                if (in_array($format['id'], $unique_ids)) {
                    $formats[] = $format;
                }
            }

            return json_encode($formats);
        }

        public function testRootServer($root_server)
        {
            $args = array(
                'timeout' => '10',
                'headers' => array(
                    'User-Agent' => 'Mozilla/4.0 (compatible; MSIE 5.01; Windows NT 5.0) +crouton'
                )
            );
            $results = wp_remote_get("$root_server/client_interface/serverInfo.xml", $args);
            $httpcode = wp_remote_retrieve_response_code($results);
            $response_message = wp_remote_retrieve_response_message($results);
            if ($httpcode != 200 && $httpcode != 302 && $httpcode != 304 && ! empty($response_message)) {
                //echo '<p>Problem Connecting to BMLT Root Server: ' . $root_server . '</p>';
                return false;
            };
            $results = simplexml_load_string(wp_remote_retrieve_body($results));
            $results = json_encode($results);
            $results = json_decode($results, true);
            $results = $results['serverVersion']['readableString'];
            return $results;
        }

        public function doQuit($message = '')
        {
            ob_flush();
            flush();
            $message .= '<script>document.getElementById("please-wait").style.display = "none";</script>';
            return $message;
        }

        public function tabbedUi($atts, $content = null)
        {
            ini_set('memory_limit', '-1');
            global $unique_areas;
            extract(shortcode_atts(array(
                "root_server" => '',
                "service_body" => '',
                "service_body_parent" => '',
                "has_tabs" => '1',
                "has_groups" => '1',
                "has_areas" => '0',
                "has_cities" => '1',
                "has_meetings" => '1',
                "has_formats" => '1',
                "has_locations" => '1',
                "has_sub_province" => '0',
                "has_states" => '0',
                "include_city_button" => '1',
                "include_weekday_button" => '1',
                "view_by" => 'weekday',
                "dropdown_width" => 'auto',
                "has_zip_codes" => '1',
                "header" => '1',
                "format_key" => '',
                "time_format" => '',
                "exclude_zip_codes" => null,
                "show_distance" => '0',
                "distance_units" => 'mi',
                "custom_query" => null,
                "show_map" => '0',
                "max_zoom_level" => 15,
                "language" => 'en-US'
            ), $atts));
            include 'lang/' . $language . '.php';
            if ($show_distance == '1') {
                wp_enqueue_script("bmlt-tabs-distance", plugin_dir_url(__FILE__) . "js/bmlt_tabs_distance.js", array('jquery'), filemtime(plugin_dir_path(__FILE__) . "js/bmlt_tabs_distance.js"), true);
            }
            if ($show_map == '1') {
                if ($this->options['google_api_key'] != '') {
                    wp_enqueue_script("markerclusterer", plugin_dir_url(__FILE__) . "js/markerclusterer.js", array('jquery'), filemtime(plugin_dir_path(__FILE__) . "js/markerclusterer.js"), true);
                    wp_enqueue_script("oms", plugin_dir_url(__FILE__) . "js/oms.min.js", array('jquery'), filemtime(plugin_dir_path(__FILE__) . "js/oms.min.js"), true);
                    wp_enqueue_script('google-maps', 'https://maps.googleapis.com/maps/api/js?key=' . $this->options['google_api_key'], '', '');
                    wp_enqueue_script("bmlt-tabs-map", plugin_dir_url(__FILE__) . "js/bmlt_tabs_map.js", array('jquery'), filemtime(plugin_dir_path(__FILE__) . "js/bmlt_tabs_map.js"), true);
                    wp_localize_script('bmlt-tabs-map', 'bmltTabsMap', array(
                        'pluginUrl' => plugin_dir_url(__FILE__),
                        'maxZoomLevel' => $max_zoom_level,
                    ));
                } else {
                    return '<p>crouton Error: Google API Key must be set when using show_map="1"</p>';
                }
            }
            $root_server            = ($root_server != '' ? $root_server : $this->options['root_server']);
            $root_server            = ($_GET['root_server'] == null ? $root_server : $_GET['root_server']);
            $service_body           = ($_GET['service_body'] == null ? $service_body : $_GET['service_body']);
            $service_body_parent    = ($_GET['service_body_parent'] == null ? $service_body_parent : $_GET['service_body_parent']);
            $has_tabs               = ($has_meetings == '0' ? '0' : $has_tabs);
            // $has_tabs = ($include_weekday_button == '0' ? '1' : $has_tabs);
            $include_city_button    = ($view_by == 'city' ? '1' : $include_city_button);
            $include_weekday_button = ($view_by == 'weekday' ? '1' : $include_weekday_button);
            $include_city_button    = ($has_meetings == '0' ? '0' : $include_city_button);
            $include_weekday_button = ($has_meetings == '0' ? '0' : $include_weekday_button);
            $format_key             = ($format_key != '' ? strtoupper($format_key) : '');
            $time_format            = ($time_format == '' ? 'h:mm a' : $time_format);
            $custom_query_postfix   = $this->getCustomQuery($custom_query);
            $view_by                = ($has_tabs == '0' ? 'byday' : $view_by);

            if ($root_server == '') {
                return '<p><strong>crouton Error: Root Server missing.<br/><br/>Please go to Settings -> BMLT_Tabs and verify Root Server</strong></p>';
            }

            // $has_tabs = ($view_by == 'city' ? '0' : $has_tabs);
            if ($view_by != 'city' && $view_by != 'weekday' && $view_by != 'byday') {
                return '<p>crouton Error: view_by must = "city" or "weekday".</p>';
            }
            if ($include_city_button != '0' && $include_city_button != '1') {
                return '<p>crouton Error: include_city_button must = "0" or "1".</p>';
            }
            if ($include_weekday_button != '0' && $include_weekday_button != '1') {
                return '<p>crouton Error: include_weekday_button must = "0" or "1".</p>';
            }
            if ($service_body_parent == null && $service_body == null) {
                $area_data       = explode(',', $this->options['service_body_1']);
                $area            = $area_data[0];
                $service_body_id = $area_data[1];
                $parent_body_id  = $area_data[2];
                if ($parent_body_id == '0') {
                    $service_body_parent = $service_body_id;
                } else {
                    $service_body = $service_body_id;
                }
            }
            $services = '';
            if ($service_body_parent != null && $service_body != null) {
                return '<p>crouton Error: Cannot use service_body_parent and service_body at the same time.</p>';
            }
            if ($service_body == '' && $service_body_parent == '') {
                return '<p>crouton Error: Service body missing from shortcode.</p>';
            }
            if ($service_body != null) {
                $service_body = array_map('trim', explode(",", $service_body));
                foreach ($service_body as $key) {
                    $services .= '&services[]=' . $key;
                }
            }
            if ($service_body_parent != null) {
                $service_body = array_map('trim', explode(",", $service_body_parent));
                foreach ($service_body as $key) {
                    $services .= '&recursive=1&services[]=' . $key;
                }
            }
            $key_items = [
                $root_server,
                $services,
                $has_tabs,
                $has_groups,
                $has_areas,
                $has_cities,
                $has_meetings,
                $has_formats,
                $has_locations,
                $has_sub_province,
                $has_states,
                $include_city_button,
                $include_weekday_button,
                $view_by,
                $dropdown_width,
                $has_zip_codes,
                $show_distance,
                $distance_units,
                $header,
                $format_key,
                $custom_query_postfix,
            ];
            $transient_key = 'bmlt_tabs_' . md5(join("", $key_items));
            if (intval($this->options['cache_time']) > 0 && $_GET['nocache'] != null) {
                //$output = get_transient('_transient_'.$transient_key);
                $output = get_transient($transient_key);
                //$output = gzuncompress($output);
                if ($output != '') {
                    return $output;
                }
            }

            ob_flush();
            flush();

            $getMeetingsUrl = $this->generateGetMeetingsUrl($root_server, $services, $format_id, $custom_query_postfix);
            if ($this->options['extra_meetings']) {
                $meetingsWithoutExtrasJson = $this->getMeetingsJson($getMeetingsUrl);
                $the_meetings_array = json_decode($meetingsWithoutExtrasJson, true);
                $extras = "";
                foreach ($this->options['extra_meetings'] as $value) {
                    $data = array(" [", "]");
                    $value = str_replace($data, "", $value);
                    $extras .= "&meeting_ids[]=" . $value;
                }
                $all_meetings_url = $root_server . '/client_interface/json/?switcher=GetSearchResults' . $extras . '&sort_key=time';
                $extraMeetingsJson = $this->getMeetingsJson($all_meetings_url);
                $extra_result = json_decode($extraMeetingsJson, true);
                if ($extra_result != null) {
                    $the_meetings = array_merge($the_meetings_array, $extra_result);
                    foreach ($the_meetings as $key => $row) {
                        $start_time[$key] = $row['start_time'];
                    }
                    array_multisort($start_time, SORT_ASC, $the_meetings);
                    $meetingsJson = json_encode($the_meetings);
                }
                if ($the_meetings == 0) {
                    return $this->doQuit('');
                }
            } else {
                $meetingsJson = $this->getMeetingsJson($getMeetingsUrl);
                $the_meetings = json_decode($meetingsJson, true);
                if ($the_meetings == 0) {
                    return $this->doQuit('');
                }
            }

            $formatsJson = $this->getTheFormatsJson($root_server, $meetingsJson);
            $formats = json_decode($formatsJson, true);
            $format_id = '';
            if ($format_key != '') {
                foreach ($formats as $value) {
                    if ($value['key_string'] == $format_key) {
                        $format_id = $value['id'];
                    }
                }
            }

            $unique_zip = $unique_city = $unique_group = $unique_area = $unique_location = $unique_sub_province = $unique_state = $unique_format = $unique_weekday = $unique_format_name_string = array();
            foreach ($the_meetings as $value) {
                $tvalue = explode(',', $value['formats']);
                if ($format_key != '' && !in_array($format_key, $tvalue)) {
                    continue;
                }
                foreach ($tvalue as $t_value) {
                    $unique_format[] = $t_value;
                    foreach ($formats as $s_value) {
                        if ($s_value['key_string'] == $t_value) {
                            $unique_format_name_string[] = $s_value['name_string'];
                        }
                    }
                }
                if ($value['location_municipality']) {
                    $unique_city[] = $value['location_municipality'];
                }
                if ($value['meeting_name']) {
                    $unique_group[] = $value['meeting_name'];
                }
                if ($value['service_body_bigint']) {
                    $unique_area[] = $value['service_body_bigint'];
                }
                if ($value['location_text']) {
                    $unique_location[] = $value['location_text'];
                }
                if ($value['location_postal_code_1']) {
                    $unique_zip[] = $value['location_postal_code_1'];
                }
                if ($value['location_sub_province']) {
                    $unique_sub_province[] = $value['location_sub_province'];
                }
                if ($value['location_province']) {
                    $unique_state[] = $value['location_province'];
                }
            }
            if (count($unique_group) == 0) {
                return $this->doQuit('No Meetings Found');
            }
            $unique_zip                = array_unique($unique_zip);
            $unique_sub_province       = array_unique($unique_sub_province);
            $unique_state              = array_unique($unique_state);
            $unique_city               = array_unique($unique_city);
            $unique_group              = array_unique($unique_group);
            $unique_area               = array_unique($unique_area);
            $unique_location           = array_unique($unique_location);
            $unique_format             = array_unique($unique_format);
            $unique_format_name_string = array_unique($unique_format_name_string);
            asort($unique_zip, SORT_NATURAL | SORT_FLAG_CASE);
            asort($unique_sub_province, SORT_NATURAL | SORT_FLAG_CASE);
            asort($unique_state, SORT_NATURAL | SORT_FLAG_CASE);
            asort($unique_city, SORT_NATURAL | SORT_FLAG_CASE);
            asort($unique_group, SORT_NATURAL | SORT_FLAG_CASE);
            asort($unique_location, SORT_NATURAL | SORT_FLAG_CASE);
            asort($unique_format, SORT_NATURAL | SORT_FLAG_CASE);
            asort($unique_format_name_string, SORT_NATURAL | SORT_FLAG_CASE);
            array_push($unique_weekday, "1", "2", "3", "4", "5", "6", "7");

            if ($has_areas == '1') {
                $area_names = array();
                foreach ($unique_area as $area_value) {
                    $areas = $this->getNameFromServiceBodyID($area_value);
                    array_push($area_names, $areas);
                }
                $area_names_ids = array_combine($unique_area, $area_names);
                asort($area_names_ids, SORT_NATURAL | SORT_FLAG_CASE);
            }

            $output .= $this->includeToString("partials/views/_header.php") . $this->includeToString("partials/views/_weekdays.php") . $this->includeToString("partials/views/_cities.php") . $this->includeToString("partials/views/_byday.php");

            $config = json_encode([
                "include_city_button" => $include_city_button,
                "include_weekday_button" => $include_weekday_button,
                "view_by" => $view_by,
                "has_tabs" => $has_tabs,
                "time_format" => $time_format,
                "exclude_zip_codes" => $exclude_zip_codes,
                "root_server_query" => $getMeetingsUrl,
                "header" => $header,
                "has_cities" => $has_cities,
                "has_groups" => $has_groups,
                "has_areas" => $has_areas,
                "has_locations" => $has_locations,
                "has_sub_province" => $has_sub_province,
                "has_states" => $has_states,
                "has_zip_codes" => $has_zip_codes,
                "has_formats" => $has_formats,
                "has_meetings" => $has_meetings,
                "dropdown_width" => $dropdown_width,
                "distance_units" => $distance_units
            ]);

            $css = $this->options['custom_css'];

            $uniqueDataJson = json_encode([
                'groups' => array_values($unique_group),
                'cities' => array_values($unique_city),
                'areas' => $area_names_ids,
                'locations' => array_values($unique_location),
                'sub_provinces' => array_values($unique_sub_province),
                'states' => array_values($unique_state),
                'zips' => array_values($unique_zip),
                'formats' => array_values($unique_format_name_string),
            ]);

            $output .= "
            <script type='text/javascript'>
                var words=" . json_encode($words) . ";
                var meetingData=$meetingsJson;
                var formatsData=$formatsJson;      
                var uniqueData=$uniqueDataJson;                
            </script><style type='text/css'>$css</style>";
            $output .= $this->getConfigJavascriptBlock($config);
            $this_title = $sub_title = $meeting_count = $group_count= '';
            if ($_GET['this_title'] != null) {
                $this_title = '<div class="bmlt_tabs_title">' . $_GET['this_title'] . '</div>';
            }
            if ($_GET['sub_title'] != null) {
                $sub_title = '<div class="bmlt_tabs_sub_title">' . $_GET['sub_title'] . '</div>';
            }
            if ($_GET['meeting_count'] != null) {
                $meeting_count = '<span class="bmlt_tabs_meeting_count">Meeting Weekly: ' . $this->getCount('', 'meeting', null) . '</span>';
            }
            if ($_GET['group_count'] != null) {
                $group_count = '<span class="bmlt_tabs_group_count">Groups: ' . $this->getCount('', 'group', null) . '</span>';
            }

            $output = $this_title . $sub_title . $meeting_count . $group_count . $output;
            $output = '<div class="bootstrap-bmlt"><div id="bmlt-tabs" class="bmlt-tabs hide">' . $output . '</div></div>';
            if ($show_map == '1') {
                $output = '<div id="bmlt-map" style="height: 400px;"></div>' . $output;
            }

            $output .= '<script>document.getElementById("please-wait").style.display = "none";</script>';
            if (intval($this->options['cache_time']) > 0 && $_GET['nocache'] != null) {
                set_transient($transient_key, $output, intval($this->options['cache_time']) * Crouton::$HOUR_IN_SECONDS);
            }
            return $output;
        }

        public function getConfigJavascriptBlock($config = array())
        {
            return "<script type='text/javascript'>var croutonConfig=$config;</script>";
        }

        public function meetingCount($atts, $content = null)
        {
            return $this->getCount($atts, 'meeting', $content);
        }

        public function bmltGroupCount($atts, $content = null)
        {
            return $this->getCount($atts, 'group', $content);
        }

        public function getCount($atts, $count_type, $content = null)
        {
            $count_type_obj = null;
            foreach (Crouton::COUNT_TYPES as $count_type_item) {
                if ($count_type_item['name'] == $count_type) {
                    $count_type_obj = $count_type_item;
                    break;
                }
            }

            extract(shortcode_atts(array(
                "service_body" => '',
                "root_server" => '',
                "subtract" => '',
                "exclude_zip_codes" => null,
                "service_body_parent" => '',
                "custom_query" => null
            ), $atts));
            $custom_query_postfix = $this->getCustomQuery($custom_query);
            $root_server = ($root_server != '' ? $root_server : $this->options['root_server']);
            $root_server = isset($_GET['root_server']) ? $_GET['root_server'] : $root_server;
            $service_body = isset($_GET['service_body']) ? $_GET['service_body'] : $service_body;
            $service_body_parent = isset($_GET['service_body_parent']) ? $_GET['service_body_parent'] : $service_body_parent;
            if ($service_body_parent == null && $service_body == null) {
                $area_data       = explode(',', $this->options['service_body_1']);
                $area            = $area_data[0];
                $service_body_id = $area_data[1];
                $parent_body_id  = $area_data[2];
                if ($parent_body_id == '0') {
                    $service_body_parent = $service_body_id;
                } else {
                    $service_body = $service_body_id;
                }
            }
            $services = '';
            $subtract = intval($subtract);
            if ($service_body_parent != null && $service_body != null) {
                return '<p>crouton Error: Cannot use service_body_parent and service_body at the same time.</p>';
            }
            if ($service_body != null) {
                $service_body = array_map('trim', explode(",", $service_body));
                foreach ($service_body as $key) {
                    $services .= '&services[]=' . $key;
                }
            } elseif ($service_body_parent != null) {
                $service_body = array_map('trim', explode(",", $service_body_parent));
                $services .= '&recursive=1';
                foreach ($service_body as $key) {
                    $services .= '&services[]=' . $key;
                }
            }
            if ($this->options['recurse_service_bodies'] == "1" && !strpos($services, "&recursive=1")) {
                $services .= '&recursive=1';
            }

            if ($custom_query_postfix != null) {
                $the_query = "$root_server/client_interface/json/?switcher=GetSearchResults$custom_query_postfix";
            } else if ($exclude_zip_codes != null) {
                $the_query = "$root_server/client_interface/json/?switcher=GetSearchResults,location_postal_code_1" . $services;
            } else {
                $the_query = "$root_server/client_interface/json/?switcher=GetSearchResults" . $services;
            }
            $transient_key = $count_type_obj['cache_key_prefix'] . md5($the_query);
            if (false === ($result = get_transient($transient_key)) || intval($this->options['cache_time']) == 0) {
                $results = wp_remote_get($the_query, Crouton::HTTP_RETRIEVE_ARGS);
                $httpcode = wp_remote_retrieve_response_code($results);
                $response_message = wp_remote_retrieve_response_message($results);
                if ($httpcode != 200 && $httpcode != 302 && $httpcode != 304 && ! empty($response_message)) {
                    return '[connect error]';
                }
                $result = json_decode(wp_remote_retrieve_body($results), true);
                foreach ($result as $value) {
                    if ($exclude_zip_codes !== null && $value['location_postal_code_1']) {
                        if (strpos($exclude_zip_codes, $value['location_postal_code_1']) !== false) {
                            continue;
                        }
                    }
                    $unique_group[] = $value[$count_type_obj['field'][0]] !== "" ? $value[$count_type_obj['field'][0]] : $value[$count_type_obj['field'][1]];
                }
                $result = array_unique($unique_group);
                if (intval($this->options['cache_time']) > 0) {
                    set_transient($transient_key, $result, intval($this->options['cache_time']) * Crouton::$HOUR_IN_SECONDS);
                }
            }
            $results = count($result) - $subtract;
            return $results;
        }

        /**
         * @desc Adds the options sub-panel
         */
        public function getAreas($root_server, $source)
        {
            $transient_key = 'bmlt_tabs_' . md5("$root_server/client_interface/json/?switcher=GetServiceBodies");
            if (false === ($result = get_transient($transient_key)) || intval($this->options['cache_time']) == 0) {
                $results = wp_remote_get("$root_server/client_interface/json/?switcher=GetServiceBodies", Crouton::HTTP_RETRIEVE_ARGS);
                $result = json_decode(wp_remote_retrieve_body($results), true);
                if (is_wp_error($results)) {
                    echo '<div style="font-size: 20px;text-align:center;font-weight:normal;color:#F00;margin:0 auto;margin-top: 30px;"><p>Problem Connecting to BMLT Root Server</p><p>' . $root_server . '</p><p>Error: ' . $result->get_error_message() . '</p><p>Please try again later</p></div>';
                    return 0;
                }

                if (intval($this->options['cache_time']) > 0) {
                    set_transient($transient_key, $result, intval($this->options['cache_time']) * Crouton::$HOUR_IN_SECONDS);
                }
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
        /**
         * Adds settings/options page
         */
        public function adminOptionsPage()
        {
            if (!isset($_POST['bmlttabssave'])) {
                $_POST['bmlttabssave'] = false;
            }
            if (!isset($_POST['delete_cache_action'])) {
                $_POST['delete_cache_action'] = false;
            }
            if ($_POST['bmlttabssave']) {
                if (!wp_verify_nonce($_POST['_wpnonce'], 'bmlttabsupdate-options')) {
                    die('Whoops! There was a problem with the data you posted. Please go back and try again.');
                }
                $this->options['cache_time']     = $_POST['cache_time'];
                $this->options['root_server']    = $_POST['root_server'];
                $this->options['service_body_1'] = $_POST['service_body_1'];
                $this->options['custom_query']   = $_POST['custom_query'];
                $this->options['custom_css']     = $_POST['custom_css'];
                $this->options['recurse_service_bodies'] = $_POST['recurse_service_bodies'];
                $this->options['extra_meetings'] = $_POST['extra_meetings'];
                $this->options['extra_meetings_enabled'] = intval($_POST['extra_meetings_enabled']);
                $this->options['google_api_key'] = $_POST['google_api_key'];
                $this->saveAdminOptions();
                set_transient('admin_notice', 'Please put down your weapon. You have 20 seconds to comply.');
                echo '<div class="updated"><p>Success! Your changes were successfully saved!</p></div>';
                if (intval($this->options['cache_time']) == 0) {
                    $num = $this->deleteTransientCache();
                    if ($num > 0) {
                        echo "<div class='updated'><p>Success! BMLT Cache Deleted! ($num entries found and deleted)</p></div>";
                    }
                } else {
                    echo "<div class='updated'><p>Note: consider Deleting Cache (unless you know what you're doing)</p></div>";
                }
            }

            if (!isset($this->options['extra_meetings_enabled']) || strlen(trim($this->options['extra_meetings_enabled'])) == 0) {
                $this->options['extra_meetings_enabled'] = 0;
            }
            if (!isset($this->options['extra_meetings']) || $this->options['extra_meetings'] == '') {
                $this->options['extra_meetings'] = '';
            } else {
                $this->options['extra_meetings_enabled'] = 1;
            }

            if ($_POST['delete_cache_action']) {
                if (!wp_verify_nonce($_POST['_wpnonce'], 'delete_cache_nonce')) {
                    die('Whoops! There was a problem with the data you posted. Please go back and try again.');
                }
                $num = $this->deleteTransientCache();
                set_transient('admin_notice', 'Please put down your weapon. You have 20 seconds to comply.');
                if ($num > 0) {
                    echo "<div class='updated'><p>Success! BMLT Cache Deleted! ($num entries found and deleted)</p></div>";
                } else {
                    echo "<div class='updated'><p>Success! BMLT Cache - Nothing Deleted! ($num entries found)</p></div>";
                }
            }
            ?>
            <div class="wrap">
                <h2>crouton</h2>
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
                        <h3>BMLT Root Server URL</h3>
                        <p>Example: https://naflorida.org/bmlt_server</p>
                        <ul>
                            <li>
                                <label for="root_server">Default Root Server: </label>
                                <input id="root_server" type="text" size="50" name="root_server" value="<?php echo $this->options['root_server']; ?>" /> <?php echo $connect; ?>
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3>Service Body</h3>
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
                                <input type="checkbox" id="recurse_service_bodies" name="recurse_service_bodies" value="1" <?php echo ($this->options['recurse_service_bodies'] == "1" ? "checked" : "") ?>/>
                                <label for="recurse_service_bodies">Recurse Service Bodies</label>
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3>Include Extra Meetings</h3>
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
                        <h3>Custom Query</h3>
                        <p>This will allow to specify a custom BMLT query.  This will override any other filtering including service bodies.</p>
                        <ul>
                            <li>
                                <label for="custom_query">Custom Query: </label>
                                <input id="custom_query" name="custom_query" size="50" value="<?php echo $this->options['custom_query']; ?>" />
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3>Custom CSS</h3>
                        <p>Allows for custom styling of your crouton.</p>
                        <ul>
                            <li>
                                <textarea id="custom_css" name="custom_css" cols="100" rows="10"><?php echo $this->options['custom_css']; ?></textarea>
                            </li>
                        </ul>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3>Google API Key</h3>
                        <p>This is only needed when using the companion map feature show_map.</p>
                        <ul>
                            <li>
                                <label for="google_api_key">API Key: </label>
                                <input id="google_api_key" name="google_api_key" size="50" value="<?php echo $this->options['google_api_key']; ?>" />
                            </li>
                        </ul>
                        <p>You must have the 'Google Maps JavaScript API' enabled on your key. <br> For more information on setting up and configuring a Google Maps API key check out this blog article <br> <a target="_blank" href="https://bmlt.app/google-maps-api-keys-and-geolocation-issues/">https://bmlt.app/google-maps-api-keys-and-geolocation-issues/</a></p>
                    </div>
                    <div style="padding: 0 15px;" class="postbox">
                        <h3>Meeting Cache (<?php echo $this->countTransientCache(); ?> Cached Entries)</h3>
                        <?php global $_wp_using_ext_object_cache; ?>
                        <?php if ($_wp_using_ext_object_cache) { ?>
                            <p>This site is using an external object cache.</p>
                        <?php } ?>
                        <p>Meeting data is cached (as database transient) to load crouton faster.</p>
                        <ul>
                            <li>
                                <label for="cache_time">Cache Time: </label>
                                <input id="cache_time" onKeyPress="return numbersonly(this, event)" type="number" min="0" max="999" size="3" maxlength="3" name="cache_time" value="<?php echo $this->options['cache_time']; ?>" />&nbsp;&nbsp;<em>0 - 999 Hours (0 = disable and delete cache)</em>
                            </li>
                        </ul>
                        <p>
                            <em>The DELETE CACHE button is useful for the following:
                                <ol>
                                    <li>After updating meetings in BMLT.</li>
                                    <li>Meeting information is not correct on the website.</li>
                                    <li>Changing the Cache Time value.</li>
                                </ol>
                            </em>
                        </p>
                    </div>
                    <input type="submit" value="SAVE CHANGES" name="bmlttabssave" class="button-primary" />
                </form>
                <form style="display:inline!important;" method="post">
                    <?php wp_nonce_field('delete_cache_nonce'); ?>
                    <input style="color: #000;" type="submit" value="DELETE CACHE" name="delete_cache_action" class="button-primary" />
                </form>
                <br/><br/>
                <?php include 'partials/_instructions.php'; ?>
            </div>
            <script type="text/javascript">getValueSelected();</script>
            <?php
        }
        /**
         * Deletes transient cache
         */
        public function deleteTransientCache()
        {
            global $wpdb, $_wp_using_ext_object_cache;
            ;
            wp_cache_flush();
            $num1 = $wpdb->query($wpdb->prepare("DELETE FROM $wpdb->options WHERE option_name LIKE %s ", '_transient_bmlt_tabs_%'));
            $num2 = $wpdb->query($wpdb->prepare("DELETE FROM $wpdb->options WHERE option_name LIKE %s ", '_transient_timeout_bmlt_tabs_%'));
            wp_cache_flush();
            return $num1 + $num2;
        }
        /**
         * count transient cache
         */
        public function countTransientCache()
        {
            global $wpdb, $_wp_using_ext_object_cache;
            wp_cache_flush();
            $num1 = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $wpdb->options WHERE option_name LIKE %s ", '_transient_bmlt_tabs_%'));
            $num2 = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $wpdb->options WHERE option_name LIKE %s ", '_transient_timeout_bmlt_tabs_%'));
            wp_cache_flush();
            return $num1;
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
        public function getOptions()
        {
            // Don't forget to set up the default options
            if (!$theOptions = get_option($this->optionsName)) {
                $theOptions = array(
                    'cache_time' => '0',
                    'root_server' => '',
                    'service_body_1' => ''
                );
                update_option($this->optionsName, $theOptions);
            }
            $this->options = $theOptions;
            $this->options['root_server'] = untrailingslashit(preg_replace('/^(.*)\/(.*php)$/', '$1', $this->options['root_server']));
        }
        /**
         * Saves the admin options to the database.
         */
        public function saveAdminOptions()
        {
            $this->options['root_server'] = untrailingslashit(preg_replace('/^(.*)\/(.*php)$/', '$1', $this->options['root_server']));
            update_option($this->optionsName, $this->options);
            return;
        }

        /**
         * @param $root_server
         * @param $services
         * @param $format_id
         * @param $custom_query_postfix
         * @return string
         */
        public function generateGetMeetingsUrl($root_server, $services, $format_id, $custom_query_postfix)
        {
            if ($format_id != '') {
                $format_id = "&formats[]=$format_id";
            }
            if ($custom_query_postfix != null) {
                $url = "$root_server/client_interface/json/?switcher=GetSearchResults$custom_query_postfix&sort_key=time";
            } else {
                $url = "$root_server/client_interface/json/?switcher=GetSearchResults$format_id$services&sort_key=time"
                    . ($this->options['recurse_service_bodies'] == "1" ? "&recursive=1" : "");
            }
            return $url;
        }

        /**
         * @param $root_server
         * @return string
         */
        public function getAllMeetings($root_server)
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
                $all_meetings[] = $value['meeting_name'].'||| ['.$this->getDay($value['weekday_tinyint']).'] ['.$value['start_time'].']||| ['.$area_name.']||| ['.$value['id_bigint'].']';
            }
            return $all_meetings;
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
