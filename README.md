<img src="https://vikunja.io/images/vikunja-logo.svg" alt="" style="display: block;width: 50%;margin: 0 auto;" width="50%"/>

[![Build Status](https://drone.kolaente.de/api/badges/vikunja/vikunjaa/status.svg)](https://drone.kolaente.de/vikunja/vikunja)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![Install](https://img.shields.io/badge/download-v0.24.6-brightgreen.svg)](https://vikunja.io/docs/installing)
[![Docker Pulls](https://img.shields.io/docker/pulls/vikunja/vikunja.svg)](https://hub.docker.com/r/vikunja/vikunja/)
[![Swagger Docs](https://img.shields.io/badge/swagger-docs-brightgreen.svg)](https://try.vikunja.io/api/v1/docs)
[![Go Report Card](https://goreportcard.com/badge/kolaente.dev/vikunja/vikunja)](https://goreportcard.com/report/kolaente.dev/vikunja/vikunja)

# Vikunja

> The Todo-app to organize your life.

If Vikunja is useful to you, please consider [buying me a coffee](https://www.buymeacoffee.com/kolaente), [sponsoring me on GitHub](https://github.com/sponsors/kolaente) or buying [a sticker pack](https://vikunja.cloud/stickers).
I'm also offering [a hosted version of Vikunja](https://vikunja.cloud/) if you want a hassle-free solution for yourself or your team.

# Table of contents

* [Security Reports](#security-reports)
* [Features](#features)
* [Docs](#docs)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)

## Security Reports

If you find any security-related issues you don't want to disclose publicly, please use [the contact information on our website](https://vikunja.io/contact/#security).

## Features

See [the features page](https://vikunja.io/features/) on our website for a more exhaustive list or 
try it on [try.vikunja.io](https://try.vikunja.io)!

## Docs

* [Installing](https://vikunja.io/docs/installing/)
* [Build from source](https://vikunja.io/docs/build-from-sources/)
* [Development setup](https://vikunja.io/docs/development/)
* [Magefile](https://vikunja.io/docs/magefile/)
* [Testing](https://vikunja.io/docs/testing/)

All docs can be found on [the Vikunja home page](https://vikunja.io/docs/).

### Roadmap

See [the roadmap](https://my.vikunja.cloud/share/QFyzYEmEYfSyQfTOmIRSwLUpkFjboaBqQCnaPmWd/auth) (hosted on Vikunja!) for more!

## Components

The project is split into three main parts:

| Component | Location | Description |
|-----------|----------|-------------|
| API | `pkg/` and `main.go` | Go backend providing the REST API and serving the built frontend. |
| Web frontend | `frontend/` | Vue.js single page application bundled into static files. |
| Desktop app | `desktop/` | Electron wrapper shipping the frontend for desktop users. |

```
 +-------+      +-----------+      +------------+
 |  API  | <--> | Frontend  | <--> |  Desktop   |
 +-------+      +-----------+      +------------+
```

## Repository Structure

| Directory | Purpose |
|-----------|---------|
| `build/` | Packaging and release helpers. |
| `contrib/` | Additional tooling and scripts. |
| `desktop/` | Electron desktop wrapper for Vikunja. |
| `frontend/` | Web frontend source code. |
| `pkg/` | Go packages implementing the API. |
| `rest/` | Example API requests for testing. |
| `scripts/` | Development and CI helper scripts. |
| `.github/` | GitHub workflow configuration. |

## Contributing

Please check out the contribution guidelines on [the website](https://vikunja.io/docs/development/).

## License

This project is licensed under the AGPLv3 License. See the [LICENSE](LICENSE) file for the full license text.