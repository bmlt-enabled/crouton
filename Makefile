.PHONY: bundle bundle-deps serve

bundle-deps:
	npm install
	npm install -g gulp-cli

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

lint:
	find . -name "*.php" ! -path '*/vendor/*' -print0 | xargs -0 -n1 -P8 php -l
	vendor/squizlabs/php_codesniffer/bin/phpcs --warning-severity=6 --standard=PSR2 --ignore=vendor --extensions=php ./
