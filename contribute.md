To contribute to crouton, fork, make your changes and send a pull request to the master branch.

Take a look at the issues for bugs that you might be able to help fix.

Once your pull request is merged it will be released in the next version.

We are using https://github.com/GaryJones/wordpress-plugin-svn-deploy to deploy the plugin to SVN.

To get things going in your local environment.

`docker-compose up`

Get your wordpress installation going.  Remember your admin password.  Once it's up, login to admin and activate the "crouton" plugin.

Now you can make edits to the crouton.php file and it will instantly take effect.

Please make note of the .editorconfig file and adhere to it as this will minimise the amount of formatting errors.  If you are using PHPStorm you will need to install the EditorConfig plugin.
