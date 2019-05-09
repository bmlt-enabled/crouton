.PHONY: bundle bundle-deps serve

bundle-deps:
	npm install
	npm install -g gulp-cli

bundle: bundle-deps
	gulp

serve:
	gulp &
	docker-compose up
