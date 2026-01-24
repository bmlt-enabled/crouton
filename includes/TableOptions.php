<?php
namespace Crouton;

if (! defined('WPINC')) {
    die;
}
if (!class_exists("Crouton\TableOptions")) {
    // phpcs:disable PSR1.Classes.ClassDeclaration.MissingNamespace
    class TableOptions
    {
        private $optionsName = 'bmlt_tabs_options';
        private $options = array();
        private MapOptions $map;
        private static array $shortCodeOptions = array(
            "root_server" => '',
            "service_body" => '',
            "service_body_parent" => '',
            "venue_types" => '',
            "formats" => '',
            "has_tabs" => '1',
            "has_days" => '0',
            "has_groups" => '0',
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
            "filter_visible" => 0,
            "include_city_button" => '1',
            "include_weekday_button" => '1',
            "include_distance_button" => '1',
            "include_unpublished" => '0',
            "grouping_buttons" => "City:location_municipality",
            "formattype_grouping_buttons" => "",
            "view_by" => 'weekday',
            "dropdown_width" => 'auto',
            "has_zip_codes" => '0',
            "header" => '1',
            "format_key" => '',
            "time_format" => 'h:mm a',
            "exclude_zip_codes" => null,
            "distance_units" => 'miles',
            "custom_query" => null,
            "show_map" => 'embed',
            "language" => 'en-US',
            'strict_datafields' => false,
            'meeting_details_href' => '',
            'virtual_meeting_details_href' => '',
            "auto_tz_adjust" => '0',
            "base_tz" => null,
            "sort_keys" => 'start_time',
            "int_start_day_id" => '1',
            "recurse_service_bodies" => '0',
            "custom_css" => "",
            "theme" => '',
            "default_filter_dropdown" => '',
            "filter_tabs" => '20',
            "show_qrcode" => false,
            "native_lang" => '',
            "has_meeting_count" => false,
            "google_api_key" => "",
            "report_update_url" => "",
            "noMap" => false,
            'meeting_times_template' => '',
            'meeting_data_template' => '',
            'metadata_template' => '',
            'meetingpage_title_template' => '',
            'meetingdetails_contents_template' => '',
            'group_data_template' => '',
            'group_title_template' => '',
            'group_details_contents_template' => '',
            'groups' => false,
            'details_table' => false,
        );
        public function getOptions(): array
        {
            return $this->options;
        }
        public function set(string $key, $value): void
        {
            $this->options[$key] = $value;
        }

        public function saveOptions(array $options): void
        {
            $options['root_server'] = untrailingslashit(preg_replace('/^(.*)\/(.*php)$/', '$1', $options['root_server']));
            update_option($this->optionsName, $options);
        }
        public function getCustomQuery(string|null $custom_query): string| null
        {
            if (isset($_GET['custom_query'])) {
                return sanitize_text_field(wp_unslash($_GET['custom_query']));
            } elseif (isset($custom_query) && $custom_query != null) {
                return html_entity_decode(str_replace('%5B%5D', '[]', $custom_query));
            } elseif (isset($this->options['custom_query']) && strlen($this->options['custom_query']) > 0) {
                return $this->options['custom_query'];
            } else {
                return null;
            }
        }
        /**
         * Retrieves the plugin options from the database.
         * @return array
         */
        public function __construct()
        {
            // Don't forget to set up the default options
            if (!$theOptions = get_option($this->optionsName)) {
                $theOptions = array(
                    'root_server' => '',
                );
                update_option($this->optionsName, $theOptions);
            }
            $this->options = $theOptions;
            $this->options['root_server'] = untrailingslashit(preg_replace('/^(.*)\/(.*php)$/', '$1', $this->options['root_server']));

            if (!isset($this->options['crouton_version'])) {
                $this->options['crouton_version'] = "3.17";
                if (isset($this->options['meeting_data_template'])) {
                    $this->options['meeting_data_template'] = str_replace('{{this.meeting_name}}', "{{> meetingLink this}}", $this->options['meeting_data_template']);
                }
            }
            if ($this->options['crouton_version'] === "3.17") {
                $this->options['crouton_version'] = "3.18";
                if (isset($this->options['meeting_data_template'])) {
                    $this->options['meeting_data_template'] = str_replace('{{> meetingLink this}}', "{{> meetingModal this}}", $this->options['meeting_data_template']);
                }
                if (!empty($this->options['google_api_key']) && !isset($this->options['tile_provider'])) {
                    $this->options['api_key'] = $this->options['google_api_key'];
                    $this->options['tile_provider'] = "google";
                }
            }
            if ($this->options['crouton_version'] === "3.18") {
                $this->options['crouton_version'] = "3.21";
                if (isset($this->options['button_filters_option'])) {
                    $this->options['grouping_buttons'] = $this->options['button_filters_option'];
                    unset($this->options['button_filters_option']);
                }
                if (isset($this->options['button_format_filters_option'])) {
                    $this->options['formattype_grouping_buttons'] = $this->options['button_format_filters_option'];
                    unset($this->options['button_format_filters_option']);
                }
            }
            if ($this->options['crouton_version'] === "3.21") {
                $this->options['crouton_version'] = "4.0";
                if (isset($this->options['service_body_1'])) {
                    $this->options['service_bodies'] = [$this->options['service_body_1']];
                    unset($this->options['service_body_1']);
                }
            }
            $this->options['crouton_version'] = "4.0";
            if ($this->options['crouton_version'] === "4.0") {
                $this->options['crouton_version'] = "4.1";
                if (isset($this->options['meetingdetails_contents_template'])) {
                    $this->options['meetingdetails_contents_template'] = str_replace('<td style="width:500px">', '<td id="meetingpage_map_td">', $this->options['meetingdetails_contents_template']);
                }
            }
            $this->options['crouton_version'] = "4.1";
            foreach (TableOptions::$shortCodeOptions as $key => $value) {
                if (!isset($this->options[$key])) {
                    $this->options[$key] = $value;
                }
            }
            require_once(__DIR__."/MapOptions.php");
            $this->map = new MapOptions();
            $this->map->mergeDefaults($this->options);
        }
        public function getMapOptions(): MapOptions
        {
            return $this->map;
        }
    //End Class Crouton
    }
}
