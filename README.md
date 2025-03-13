# BSI Secvisogram CSAF Validator Service

<!-- TOC depthfrom:2 depthto:3 -->

- [About the project](#about-the-project)
- [Getting started](#getting-started)
- [Documentation](#documentation)
- [Configuration](#configuration)
  - [CORS](#cors)
- [Developing](#developing)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Run server](#run-server)
  - [Generate documentation](#generate-documentation)
  - [Create new version](#create-new-version)
- [Testing](#testing)
- [Docker](#docker)
- [Persist with pm2](#persist-with-pm2)
- [Contributing](#contributing)
- [Dependencies](#dependencies)

<!-- /TOC -->

## About the project

This is a service to validate documents against the [CSAF standard](https://docs.oasis-open.org/csaf/csaf/v2.0/csaf-v2.0.html). It uses the [csaf-validator-lib](https://github.com/secvisogram/csaf-validator-lib) under the hood which is included as a `git subtree` module.

[(back to top)](#bsi-secvisogram-csaf-validator-service)

## Getting started

To run the validator service you basically need the same as for [developing](#developing).

- install Node.js 20
- install production dependencies and copy all relevant files to the dist
  folder by running `npm run dist`
- copy the content of the dist folder to your working directory
- Make sure to set the environment variable `NODE_ENV` to `production`
- Configure the service using a `local-production.json` file in
  `backend/config`. All available parameters are outlined in `backend/config/development.json`. See [https://www.npmjs.com/package/config](https://www.npmjs.com/package/config) for more information on how to configure using different techniques such as environment variables.
- test 6.3.8 requires an installation of hunspell.
  - For more details on how to manage languages, please also see [Managing Hunspell languages](https://github.com/secvisogram/csaf-validator-lib#managing-hunspell-languages)
- start the service with `node backend/server.js`

To manage the process you can use Docker or an init system of your choice.

You most likely also want to run this behind a reverse proxy to handle TLS
termination or CORS headers if the service is accessed from other domains. See
[https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
for more information.

## Documentation

The documentation is available as a swagger resource provided by the service itself under `/docs`. So once the server is running, visit [http://localhost:&lt;config port&gt;/docs](http://localhost:8082/docs) in your browser. The default port of the application `8082`. See [configuration](#configuration) to learn about ways to change it.

[(back to top)](#bsi-secvisogram-csaf-validator-service)

## Configuration

The project uses the [config](https://www.npmjs.com/package/config) npm package for configuration. It provides a variety of possibilities to inject configuration values e.g. environment variables or environment specific files.

### CORS

Fastify CORS options can be configured by passing an options object by the name `cors`

The following options are available:
`origin`, `methods`, `allowedHeaders`, `exposedHeaders`, `credentials`, `maxAge`

See [Fastify CORS options](https://github.com/fastify/fastify-cors#options) for more information

[(back to top)](#bsi-secvisogram-csaf-validator-service)

## Developing

### Prerequisites

You need at least **Node.js version 20 or higher**. [Nodesource](https://github.com/nodesource/distributions/blob/master/README.md) provides binary distributions for various Linux distributions.

[(back to top)](#bsi-secvisogram-csaf-validator-service)

### Installation

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

Make sure, you have the package [@openapitools/openapi-generator-cli](https://www.npmjs.com/package/@openapitools/openapi-generator-cli) installed globally (using `npm i -g @openapitools/openapi-generator-cli`).

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

## Docker

Build docker image

```sh
docker build -t csaf/validator-service .
```

Start container

```sh
docker run -d -p 8082:8082 --name csaf-validator-service csaf/validator-service
```

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
