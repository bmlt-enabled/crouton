.PHONY: bundle

bundle-deps:
	npm install

bundle: bundle-deps
	gulp

serve:
	gulp &
	docker-compose up
