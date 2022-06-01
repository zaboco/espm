# @zaboco/espm

A package manager for ES modules

| ⚠️  | **Experimental** | This package is an experiment. It is very limited for now, and have known issues. |
|:---:|:----------------:| :--- |

## Installation

It is recommended to install this tool globally 
```shell
npm i -g @zaboco/espm
```

It can also be installed locally, of course:
```shell
npm i -D @zaboco/espm
```

> **Note**: If you do so, you will have to use `npx` to run the commands. E.g. `npx espm install react`.

## Usage

| ⚠️  | **WIP** | Only adding TS types is available for now |
|:---:| :---:|:--- |

### Adding TS types

You can add `.d.ts` files for packages, without installing them with `npm`. It fetches the files from [a CDN](https://esm.sh/). Also fetches imported types, recursively. 

```shell
espm add <package>[@version]
```

## Known issues
- Type reference paths are ignored `/// <reference path="./foo.d.ts" />`. In this case `./foo.d.ts` is not downloaded from the CDN
- TS `namespace` syntax is not supported. For example, `espm add preact` would fail. 
