# ESPM example project

This example demonstrates an ES-modules only dev environment using `vite` and `uvu`

## Install

```shell
pnpm install # still need to install vite and typescript
```

<details>
  <summary>Prerequisite: Install `espm` globally</summary>

```shell
npm i -g @zaboco/espm
```

</details>

Now install the required types with `espm`:
```shell
espm add react react-dom uvu chai @testing-library/react
```


## Usage

### Dev server

Start `vite` in dev mode, with aliases to CDN versions of the module (from https://esm.sh). You can check that in the `Network` tab from Developer Tools.

```shell
pnpm start
```

### Test server

Start `vite` in test mode, with aliases to CDN. It also includes aliases for test dependencies (like `chai`). The output is not great, but it features HMR, with instant feedback. Also, the tests run in real browser environment, no JSDOM quirks.

```shell
pnpm test
```

### Build for production

Bundles the app with `vite` (which in turn uses `rollup`). Also uses aliases to CDN. So the bundle will be only for the actual app. You can take a look in the `dist/` folder after running the build script. (The code is un-minified for the sake of this example, to make it easier to read). 

```shell
pnpm build
```
