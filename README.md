<div id="top"></div>

# CSAF Validator Service

<!-- toc -->

- [About The Project](#about-the-project)
- [Documentation](#documentation)
- [Configuration](#configuration)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Run server](#run-server)
- [Testing](#testing)

<!-- tocstop -->

## About The Project

This is a service to validate documents against the [CSAF standard](https://docs.oasis-open.org/csaf/csaf/v2.0/csaf-v2.0.html). It uses the [csaf-validator-lib](https://github.com/secvisogram/csaf-validator-lib) under the hood which is included as a `git subtree` module.

<p align="right">(<a href="#top">back to top</a>)</p>

## Documentation

The documentation is available as a swagger resource provided by the service itself under `/docs`. So once the server is running, visit [http://localhost:&lt;config port&gt;/docs](http://localhost:3000/docs) in your browser. The default port of the application `3000`. See [configuration](#configuration) to learn about ways to change it.

## Configuration

The project uses the [config](https://www.npmjs.com/package/config) npm package for configuration. It provides a variety of possibilities to inject configuration values e.g. environment variables or environment specific files.

## Development

### Prerequisites

You need at least **Node.js version 14 or higher**. [Nodesource](https://github.com/nodesource/distributions/blob/master/README.md) provides binary distributions for various Linux distributions.

### Installation

- Install server and csaf-validator-lib dependencies
  ```sh
  npm ci
  ```

<p align="right">(<a href="#top">back to top</a>)</p>

### Run server

- Start the server

  ```sh
  npm run dev
  ```

<p align="right">(<a href="#top">back to top</a>)</p>

## Testing

Many tests are integration tests which need a running server. So make sure to start it before running the tests:

```sh
npm run dev
```

Tests are implemented using [mocha](https://mochajs.org/). They can be run using the following command:

```sh
npm test
```

<p align="right">(<a href="#top">back to top</a>)</p>
