.PHONY: bundle bundle-deps serve

bundle-deps:
	npm install
	npm install -g gulp-cli

bundle: bundle-deps
	gulp

watch: bundle-deps
	gulp watch

serve:
	gulp watch &
	docker-compose up

serve-static:
	gulp watch &
	python -m SimpleHTTPServer
