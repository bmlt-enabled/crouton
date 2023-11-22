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
        private $options = array();
        private $shortCodeOptions = array(
            "map_search" => null,
            "map_search_zoom" => 10,
            "map_search_latitude" => 0,
            "map_search_longitude" => 0,
            "map_search_width" => '-50',
            "map_search_auto" => true,
            "map_search_location" => null,
            "map_search_coordinates_search" => false,
        );

        public function __construct($options)
        {
            $this->options = $options;
        }
        // phpcs:disable PSR1.Methods.CamelCapsMethodName.NotCamelCaps
        public function enqueueFrontendFiles()
        {
            $jsfilename = (isset($_GET['croutonjsdebug']) ? "crouton-map.js" : "crouton-map.min.js");
            wp_enqueue_script("croutonmapjs", plugin_dir_url(__FILE__) . "../../dist/$jsfilename", array('croutonjs'), filemtime(plugin_dir_path(__FILE__) . "../../dist/$jsfilename"), true);
        }
        public function className()
        {
            return "CroutonMap";
        }
        public function getMapJSConfig($params)
        {
            $mapParams = [];
            if (isset($atts['map_search'])) {
                $mapParams['map_search'] = $params['map_search'];
            } else {
                $mapParams['map_search'] = (object)[
                    "zoom" => isset($atts['map_search_zoom'])
                        ? intval($atts['map_search_zoom'])
                        : $this->shortCodeOptions['map_search_zoom'],
                    "latitude" => isset($atts['map_search_latitude'])
                        ? intval($atts['map_search_latitude'])
                        : $this->shortCodeOptions['map_search_latitude'],
                    "longitude" => isset($atts['map_search_longitude'])
                        ? intval($atts['map_search_longitude'])
                        : $this->shortCodeOptions['map_search_longitude'],
                    "width" => isset($atts['map_search_width'])
                        ? intval($atts['map_search_width'])
                        : $this->shortCodeOptions['map_search_width'],
                    "auto" => isset($atts['map_search_auto'])
                        ? boolval($atts['map_search_auto'])
                        : $this->shortCodeOptions['map_search_auto'],
                    "location" => isset($atts['map_search_location'])
                        ? $atts['map_search_location']
                        : $this->shortCodeOptions['map_search_location'],
                    "coordinates_search" => isset($atts['map_search_coordinates_search'])
                        ? boolval($atts['map_search_coordinates_search'])
                        : $this->shortCodeOptions['map_search_coordinates_search']
                ];
            }
            $mapParams['template_path'] = plugin_dir_url(__FILE__) . '../../dist/templates/';
            $mapParams['theme'] = $params['theme'] != '' ? $params['theme'] : $this->options['theme'];
            $mapParams['language'] = $params['language'];
            return json_encode($mapParams);
        }
    }
}
