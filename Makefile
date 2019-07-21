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
