To contribute to crouton, fork, make your changes and send a pull request to the master branch.

Take a look at the issues for bugs that you might be able to help fix.

Once your pull request is merged it will be released in the next version.

To get things going in your local environment.

`docker-compose up`

Get your wordpress installation going.  Remember your admin password.  Once it's up, login to admin and activate the "crouton" plugin.

Now you can make edits to the crouton.php file and it will instantly take effect.

Please make note of the .editorconfig file and adhere to it as this will minimise the amount of formatting errors.  If you are using PHPStorm you will need to install the EditorConfig plugin.

#HTTPS

You can use [ngrok](https://ngrok.com") to test out HTTPS related items.  

1. Run `ngrok http 8080`.
2. Run the following command replacing the ngrok url with your ngrok session hostname: 

```shell
docker exec -i crouton_db_1 mysql -uwordpress -pwordpress -Dwordpress <<< "update wp_options set option_value = 'https://abcd1234.ngrok.io' where option_id in (1,2);"
```

#Tagging

If a release is tagged with `beta`, it will be pushed to a zip in Github release.  If it's not then it will go to the wordpress directory as a release in addition to the latter.
