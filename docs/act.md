# Running GitHub workflows locally with act

The [act](https://github.com/nektos/act) tool can execute GitHub Actions in Docker containers.
This makes it possible to test workflows without pushing changes.

## Installation

Download a prebuilt binary from the [act releases](https://github.com/nektos/act/releases) page
or use a package manager such as Homebrew:

```bash
brew install act
```

## Usage

Pull the default platform image and run a workflow:

```bash
docker pull ghcr.io/catthehacker/ubuntu:act-latest
act pull_request
```

The repository provides an [`.actrc`](../.actrc) file so `act` uses the same base image as CI.
Secrets used in the workflows can be stored in `.github/act.secrets`. Copy
`.github/act.secrets.example` as a starting point and adjust the values.
To trigger other events, pass them as arguments, for example:

```bash
act push --eventpath .github/event.json
```

Some jobs require additional services like PostgreSQL, MySQL or a Chrome browser.
You can start these services with Docker before running `act`.
The `scripts/run-act.sh` helper installs all required tools and then invokes `act`.

