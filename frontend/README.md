# Web frontend for Vikunja

> The todo app to organize your life.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](LICENSE)
[![Translation](https://badges.crowdin.net/vikunja/localized.svg)](https://crowdin.com/project/vikunja)

This is the web frontend for Vikunja, written in Vue.js.

Take a look at [our roadmap](https://my.vikunja.cloud/share/UrdhKPqumxDXUbYpEGJLSIyNTwAnbBzVlwdDpRbv/auth) (hosted on Vikunja!) for a list of things we're currently working on!

For general information about the project, refer to the top-level readme of this repo.

## Project setup

```shell
pnpm install
```

### Development

#### Define backend server

You can develop the web front end against any accessible backend, including the demo at https://try.vikunja.io

In order to do so, you need to set the `DEV_PROXY` env variable. The recommended way to do so is to:

- Copy `.env.local.exemple` as `.env.local`
- Uncomment the `DEV_PROXY` line
- Set the backend url you want to use

In the end, it should look like `DEV_PROXY=https://try.vikunja.io` if you work against the online demo backend.


#### Start dev server (compiles and hot-reloads)

```shell
pnpm run dev
```

### Compiles and minifies for production

```shell
pnpm run build
```

### Lints and fixes files

```shell
pnpm run lint
```

### Compile-time class merging

`pnpm run build` runs a Vite plugin that merges Tailwind classes using the
prefix configured in `tailwind.config.js`. Static class strings inside `.vue`
templates are deduplicated so parent classes override child defaults.

```vue
<!-- Parent -->
<BaseButton class="tw-bg-red-500" />

<!-- Child template -->
<button class="tw-bg-blue-500 base-button"></button>
```

After the build the button element contains `tw-bg-red-500` only.
