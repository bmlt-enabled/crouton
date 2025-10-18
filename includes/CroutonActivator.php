<?php
namespace Crouton;

class CroutonActivator
{
    public static function deactivate()
    {
        $role = $GLOBALS['wp_roles']->role_objects['administrator'];
        if (isset($role) && $role->has_cap('manage_crouton')) {
            $role->remove_cap('manage_crouton');
        }
    }
    public static function activate()
    {
        $role = $GLOBALS['wp_roles']->role_objects['administrator'];
        if (isset($role) && !$role->has_cap('manage_crouton')) {
            $role->add_cap('manage_crouton');
        }
    }
}
