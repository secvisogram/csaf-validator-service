# BSI Secvisogram CSAF Validator Service

<!-- TOC depthfrom:2 depthto:3 -->

- [About the project](#about-the-project)
- [Requirements](#requirements)
- [Getting started](#getting-started)
  - [Quick start with npm](#quick-start-with-npm)
  - [Quick start with docker](#quick-start-with-docker)
  - [Installation (step by step)](#installation-step-by-step)
  - [Testrun](#testrun)
    - [Validate a JSON file](#validate-a-json-file)
- [Documentation](#documentation)
- [Configuration](#configuration)
  - [CORS](#cors)
- [Developing](#developing)
  - [Prerequisites](#prerequisites)
  - [Installation (for developing)](#installation-for-developing)
  - [Run server](#run-server)
  - [Generate documentation](#generate-documentation)
  - [Create new version](#create-new-version)
- [Testing](#testing)
- [Persist with pm2](#persist-with-pm2)
- [Contributing](#contributing)
- [Dependencies](#dependencies)

<!-- /TOC -->

## About the project

This is a service to validate documents against the [CSAF standard](https://docs.oasis-open.org/csaf/csaf/v2.0/csaf-v2.0.html). It uses the [csaf-validator-lib](https://github.com/secvisogram/csaf-validator-lib) under the hood which is included as an npm dependency.

[(back to top)](#bsi-secvisogram-csaf-validator-service)

## Requirements

- install Node.js 24
- install npm
- test 6.3.8 requires an installation of `hunspell`.
  - For more details on how to manage languages, please also see [Managing Hunspell languages](https://github.com/secvisogram/csaf-validator-lib#managing-hunspell-languages)

## Getting started

### Quick start with npm

The fastest way to try the service, without cloning the repository, is:

```sh
npx @secvisogram/csaf-validator-service
``` 

This starts the server on the default port (`8082`) using the built-in default configuration. Once it's running, visit [http://localhost:8082/docs](http://localhost:8082/docs) to see the Swagger documentation (see [Documentation](#documentation)) or call `POST /api/v1/validate` directly.

To override configuration (e.g. the port), see [Configuration](#configuration) — the `config` package supports environment variables and config-file layering.

[(back to top)](#bsi-secvisogram-csaf-validator-service)

### Quick start with docker

If you want to run the service with the default settings, use the Docker option below:

- Build docker image

  ```sh
  docker build -t csaf-validator-service .
  ```

- Start container

  ```sh
  docker run -d -p 8082:8082 --name csaf-validator-service csaf-validator-service
  ```

### Installation (step by step)

- Clone this repository and run `npm ci` in the root folder to install production dependencies.
- run `npm run dist` to build the validation service.
- Copy the content of the dist folder to your working directory

  ```bash
  cp -r ./dist/* .
  ```

- Configure the service using a `production.json` file in
  `backend/config`. All available parameters are outlined in `backend/config/development.json`. See [https://www.npmjs.com/package/config](https://www.npmjs.com/package/config) for more information on how to configure using different techniques such as environment variables.
- Make sure to set the environment variable `NODE_ENV` to `production`.

  ```bash
  echo $NODE_ENV
  ```

  If a configuration file with the displayed name exists in the config folder, it will be used. If not, `default.json` will be loaded instead.

- start the service with

  ```bash
  cd backend/
  node server.js
  ```

To manage the process you can use Docker or an init system of your choice.

You most likely also want to run this behind a reverse proxy to handle TLS
termination or CORS headers if the service is accessed from other domains. See
[https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
for more information.

[(back to top)](#bsi-secvisogram-csaf-validator-service)

### Testrun

Once the server is running, visit [http://localhost:&lt;config port&gt;/docs](http://localhost:8082/docs) in your browser. The default port of the application `8082`. See [configuration](#configuration) to learn about ways to change it.

#### Validate a JSON file

- Expand `POST` under default
- Click `Try it out` to change the test input and add your whole json file

  ```bash
  "document": {
    <content of your json file>
  }
  ```

- Hit execute and check the generated output below

[(back to top)](#bsi-secvisogram-csaf-validator-service)

## Documentation

The documentation is available as a swagger resource provided by the service itself under `/docs`. So once the server is running, visit [http://localhost:&lt;config port&gt;/docs](http://localhost:8082/docs) in your browser. The default port of the application `8082`. See [configuration](#configuration) to learn about ways to change it.

[(back to top)](#bsi-secvisogram-csaf-validator-service)

## Configuration

The project uses the [config](https://www.npmjs.com/package/config) npm package for configuration. It provides a variety of possibilities to inject configuration values e.g. environment variables or environment specific files.

The quickest way to override a value without creating a config file is the `NODE_CONFIG` environment variable — a JSON string that gets merged on top of `default.json`. For example, to run on a different port:

```sh
# bash / Git Bash
NODE_CONFIG='{"port":9090}' npx @secvisogram/csaf-validator-service
```

```powershell
# PowerShell
$env:NODE_CONFIG='{"port":9090}'; npx @secvisogram/csaf-validator-service
```

Any key from `backend/config/default.json` can be overridden this way, e.g. `{"port":9090,"ip":"0.0.0.0"}`. See the [config package docs](https://github.com/node-config/node-config/wiki/Environment-Variables#node_config) for the full set of environment variables it supports (`NODE_CONFIG_DIR`, `NODE_ENV`, `NODE_APP_INSTANCE`, etc.).

### CORS

Fastify CORS options can be configured by passing an options object by the name `cors`

The following options are available:
`origin`, `methods`, `allowedHeaders`, `exposedHeaders`, `credentials`, `maxAge`

See [Fastify CORS options](https://github.com/fastify/fastify-cors#options) for more information

[(back to top)](#bsi-secvisogram-csaf-validator-service)

## Developing

### Prerequisites

You need at least **Node.js version 24 or higher** (see [Requirements](#requirements)). [Nodesource](https://github.com/nodesource/distributions/blob/master/README.md) provides binary distributions for various Linux distributions.

[(back to top)](#bsi-secvisogram-csaf-validator-service)

### Installation (for developing)

- Install server and csaf-validator-lib dependencies

  ```sh
  npm ci
  ```

[(back to top)](#bsi-secvisogram-csaf-validator-service)

### Run server

- Start the server

  ```sh
  npm run dev
  ```

[(back to top)](#bsi-secvisogram-csaf-validator-service)

### Generate documentation

The server needs to be running and the [`openapi-generator-cli`](https://openapi-generator.tech/docs/installation/) must be installed. The file `backend/lib/app.js` needs to reflect the target version. Then, you can use the following commands to generate the documentation:

```sh
openapi-generator-cli generate -i http://localhost:8082/docs/json -g html -o ./documents/generated/html/
openapi-generator-cli generate -i http://localhost:8082/docs/json -g asciidoc -o ./documents/generated/asciidoc/
```

[(back to top)](#bsi-secvisogram-csaf-validator-service)

### Create new version

To create a new version use npm's [version](https://docs.npmjs.com/cli/v11/commands/npm-version) command and make sure that your server is not running (since this command will start it).

[(back to top)](#bsi-secvisogram-csaf-validator-service)

## Testing

Many tests are integration tests which need a running server. So make sure to start it before running the tests:

```sh
npm run dev
```

Tests are implemented using [mocha](https://mochajs.org/). They can be run using the following command:

```sh
npm test
```

[(back to top)](#bsi-secvisogram-csaf-validator-service)

## Persist with pm2

If you want to start the service with [pm2](https://github.com/Unitech/pm2) you have to adjust the `instance_var` attribute for pm2.
You can do this by adding the following configuration in the `backend` folder.
Depending on the directory you chose, you have to adjust the `cwd` and `NODE_CONFIG_DIR` attributes accordingly.

```javascript
// pm2.config.cjs
module.exports = {
  apps: [
    {
      name: 'csaf-validator-service',
      script: './server.js',
      cwd: '/var/www/csaf-validator-service/backend',
      instance_var: 'INSTANCE_ID',
      env: {
        NODE_ENV: 'development',
        NODE_CONFIG_DIR: '/var/www/csaf-validator-service/backend/config/',
      },
      env_production: {
        NODE_ENV: 'production',
        NODE_CONFIG_DIR: '/var/www/csaf-validator-service/backend/config/',
      },
    },
  ],
}
```

To start the service execute this command inside the backend directory:

```sh
pm2 start pm2.config.js --env production
```

## Contributing

You can find our guidelines here [CONTRIBUTING.md](https://github.com/secvisogram/secvisogram/blob/main/CONTRIBUTING.md)

[(back to top)](#bsi-secvisogram-csaf-validator-service)

## Dependencies

For the complete list of dependencies please take a look at [package.json](https://github.com/secvisogram/csaf-validator-lib/blob/main/package.json)

- [fastify](https://fastify.io/)
- [fastify-swagger](https://github.com/fastify/fastify-swagger)
- [csaf-validator-lib](https://github.com/secvisogram/csaf-validator-lib)

[(back to top)](#bsi-secvisogram-csaf-validator-service)
