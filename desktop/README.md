# Vikunja desktop

[![License: GPL v3](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](LICENSE)

The Vikunja frontend all repackaged as an electron app to run as a desktop app!

It uses the built files from `../frontend` and wraps them with Electron so the
Vikunja web interface can be run as a native application.

## Dev

As this package does not contain any code, only a thin wrapper around electron, you will need to do this to get the 
actual frontend bundle and build the app:

First, build the frontend:

```
cd ../frontend
pnpm install
pnpm run build
```

Then, copy the frontend to this directory:

```
cd desktop
cp -r ../frontend/dist frontend/
sed -i 's/\/api\/v1//g' frontend/index.html # Make sure to trigger the "enter the Vikunja url" prompt
```

Then you can run the desktop app like this:

```
pnpm install
pnpm start
```

## Building for release

1. Run the snippet from above, but with a valid frontend version instead of `unstable`
2. Change the version in `package.json` (That's the one that will be used by electron-builder`
3. `pnpm install`
4. `pnpm run dist --linux --windows`
