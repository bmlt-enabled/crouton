COMMIT := $(shell git rev-parse --short=8 HEAD)
ZIP_FILENAME := $(or $(ZIP_FILENAME), $(shell echo "$${PWD\#\#*/}.zip"))
BUILD_DIR := $(or $(BUILD_DIR),build)
VENDOR_AUTOLOAD := vendor/autoload.php
NODE_MODULES := node_modules/.bin/gulp
BASENAME := $(shell basename $(PWD))
ZIP_FILE := build/$(BASENAME).zip

ifeq ($(PROD)x, x)
	COMPOSER_ARGS := --prefer-dist --no-progress
else
	COMPOSER_ARGS := --no-dev
endif

help:  ## Print the help documentation
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

$(ZIP_FILE): $(VENDOR_AUTOLOAD) $(NODE_MODULES) js-build
	git archive --format=zip --output=${ZIP_FILENAME} $(COMMIT)
	zip -r ${ZIP_FILENAME} vendor/ croutonjs/dist/
	mkdir -p ${BUILD_DIR} && mv ${ZIP_FILENAME} ${BUILD_DIR}/

.PHONY: build
build: $(ZIP_FILE)  ## Build plugin zip file with all assets

.PHONY: clean
clean:  ## Clean build artifacts
	rm -rf build dist croutonjs/dist/

$(VENDOR_AUTOLOAD):
	composer install $(COMPOSER_ARGS)

.PHONY: composer
composer: $(VENDOR_AUTOLOAD) ## Install PHP dependencies

$(NODE_MODULES):
	npm install

.PHONY: npm
npm: $(NODE_MODULES) ## Install Node.js dependencies

.PHONY: js-build
js-build: $(NODE_MODULES) ## Build JavaScript and CSS assets
	npx gulp

.PHONY: js-watch
js-watch: js-build ## Watch and rebuild JavaScript/CSS on changes (builds first if needed)
	npx gulp watch

.PHONY: lint
lint: composer ## PHP code style check
	vendor/bin/phpcs

.PHONY: fmt
fmt: composer ## Fix PHP code style issues
	vendor/bin/phpcbf

.PHONY: docs
docs:  ## Generate PHP documentation
	docker run --rm -v $(shell pwd):/data phpdoc/phpdoc:3 --ignore=vendor/,node_modules/,croutonjs/ -d . -t docs/

.PHONY: dev
dev:  ## Start WordPress development environment
	docker-compose up

.PHONY: mysql
mysql:  ## Connect to MySQL in development environment
	docker exec -it $(BASENAME)-db-1 mariadb -u wordpress -pwordpress wordpress

.PHONY: bash
bash:  ## Open bash shell in WordPress container
	docker exec -it -w /var/www/html/wp-content/plugins/$(BASENAME) $(BASENAME)-wordpress-1 bash

.PHONY: ngrok-setup
ngrok-setup:  ## Setup HTTPS testing with ngrok (requires ngrok url as NGROK_URL env var)
	docker exec -i $(BASENAME)-db-1 mysql -uwordpress -pwordpress -Dwordpress <<< "update wp_options set option_value = '$(NGROK_URL)' where option_id in (1,2);"

.PHONY: all
all: composer npm js-build ## Install all dependencies and build assets

# Legacy aliases for backwards compatibility
.PHONY: bundle bundle-deps serve watch deploy
bundle-deps: npm ## Legacy alias for npm
bundle: js-build ## Legacy alias for js-build
watch: js-watch ## Legacy alias for js-watch
serve: dev ## Legacy alias for dev
deploy: all build ## Legacy alias for full build
