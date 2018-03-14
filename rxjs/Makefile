SOURCES = src

lint:
	./node_modules/.bin/eslint scripts $(SOURCES) *.js --format=codeframe

deploy:
	node webpack/config/deploy.js

local:
	NODE_PATH=$(shell which node) \
	NODE_ENV=development \
	BABEL_ENV=local \
	HTTPS=false \
	PUBLIC_URL=https://localhost:1337 \
	yarn run webpack-dev-server --config webpack/development.js --port 1337 --color --progress

develop:
	node ./webpack/config/deploy.js
	NODE_PATH=$(shell which node) \
	NODE_ENV=development \
	BABEL_ENV=development \
	HTTPS=true \
	PUBLIC_URL=https://develop.localhost1337.jp \
	yarn run webpack --config webpack/development.js

release:
	node ./webpack/config/deploy.js
	NODE_PATH=$(shell which node) \
	NODE_ENV=production \
	BABEL_ENV=production \
	HTTPS=true \
	PUBLIC_URL=https://release.localhost1337.jp \
	yarn run webpack --config webpack/production.js

production:
	node ./webpack/config/deploy.js
	NODE_PATH=$(shell which node) \
	NODE_ENV=production \
	HTTPS=true \
	PUBLIC_URL=https://localhost1337.jp \
	yarn run webpack --config webpack/production.js
