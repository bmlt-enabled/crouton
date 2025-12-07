<?php
/*
Plugin Name: crouton
Plugin URI: https://wordpress.org/plugins/crouton/
Description: A tabbed based display for showing meeting information.
Author: bmlt-enabled
Author URI: https://bmlt.app
Version: 4.0.1
Text Domain: crouton
Domain Path: /languages
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
function activate_crouton()
{
    include_once plugin_dir_path(__FILE__) . 'includes/CroutonActivator.php';
    CroutonActivator::activate();
}

/**
 * The code that runs during plugin deactivation.
 * This action is documented in includes/class-bread-deactivator.php
 */
function deactivate_crouton()
{
    include_once plugin_dir_path(__FILE__) . 'includes/CroutonActivator.php';
    CroutonActivator::deactivate();
}
register_activation_hook(__FILE__, 'Crouton\activate_crouton');
register_deactivation_hook(__FILE__, 'Crouton\deactivate_crouton');
// end if
// instantiate the class
if (class_exists("Crouton\Controller")) {
    $BMLTTabs_instance = new Controller();
}
