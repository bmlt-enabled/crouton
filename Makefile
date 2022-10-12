help:  ## Print the help documentation
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'


.PHONY: bundle bundle-deps serve

bundle-deps:
	npm install
	npm list gulp || npm install -g gulp-cli

bundle:
	gulp

watch:
	gulp watch

serve:
	gulp watch &
	docker-compose up

deploy: bundle-deps bundle

serve-static:
	gulp watch &
	python -m SimpleHTTPServer

.PHONY: lint
lint:  ## PHP Lint
	find . -name "*.php" ! -path '*/vendor/*' -print0 | xargs -0 -n1 -P8 php -l
	vendor/squizlabs/php_codesniffer/bin/phpcs

.PHONY: lint-fix
lint-fix:  ## PHP Lint Fix
	vendor/squizlabs/php_codesniffer/bin/phpcbf
