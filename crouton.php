<?php
/*
Plugin Name: crouton
Plugin URI: https://wordpress.org/plugins/crouton/
Description: A tabbed based display for showing meeting information.
Author: bmlt-enabled
Author URI: https://bmlt.app
Version: 3.24.3
License:           GPL-2.0+
License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
*/
/* Disallow direct access to the plugin file */
namespace Crouton;

if (! defined('WPINC')) {
    die;
}
ini_set('max_execution_time', 120);
if (!class_exists("Crouton/Controller")) {
    class Controller
    {
        private Object $main;
        public function __construct()
        {
            if (is_admin()) {
                  require_once(__DIR__."/includes/TableOptions.php");
                  require_once(__DIR__."/admin/TableAdmin.php");
                  $crouton = new TableOptions();
                  $this->main = new TableAdmin($crouton);
            } else {
                 require_once(__DIR__."/includes/TableOptions.php");
                 require_once(__DIR__."/public/TablePublic.php");
                 $crouton = new TableOptions();
                 $this->main = new TablePublic($crouton);
            }
        }
    }
}
// end if
// instantiate the class
if (class_exists("Crouton\Controller")) {
    $BMLTTabs_instance = new Controller();
}
