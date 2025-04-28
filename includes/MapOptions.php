<?php
namespace Crouton;

/* Disallow direct access to the plugin file */
if (! defined('WPINC')) {
    die;
}

if (!class_exists("Crouton\MapOptions")) {
    class MapOptions
    {
        private static $defaultOptions = array(
            'lat' => 0,
            'lng' => 0,
            'zoom' => 10,
            'tile_provider' => 'OSM',
            'tile_url' => '',
            'tile_attribution' => '',
            'nominatim_url' => 'https://nominatim.openstreetmap.org/',
            'api_key' => '',
            'clustering' => 12,
            'region_bias' => 'us',
            'bounds_north' => '',
            'bounds_east' => '',
            'bounds_south' => '',
            'bounds_west' => '',
            'map_search_width' => '-50',
            'map_search_auto' => '',
            'map_search_latitude' => '',
            'map_search_longitude' => '',
            'map_search_location' => '',
            'map_search_coordinate_search' => '',
            'map_search_zoom' => '',
            'center_me' => '',
            'goto' => '',
            'min_zoom' => '6',
            'max_zoom' => '17',
            'marker_contents_template' => '',
        );
        private bool $isGoogle;

        public function mergeDefaults(&$options)
        {
            foreach (MapOptions::$defaultOptions as $key => $value) {
                if (!isset($options[$key])) {
                    $options[$key] = $value;
                }
            }
            $this->isGoogle = ($options['tile_provider'] == 'google');
        }
        public function isGoogle()
        {
            return $this->isGoogle;
        }
    }
}
