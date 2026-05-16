# CodeceptJS website

Website is built with vuepress. Source code for [codecept.io](https://codecept.io/)

## Launch website

1. clone this repo
2. `npm i`
3. `bunosh serve` - to launch server

> [bunosh](https://github.com/davert/bunosh) task runner is used for build tasks. Run `bunosh` to list commands, or `bunosh <command>`. Tasks are defined in `Bunoshfile.js`.

## Sync docs

Docs are taken from CodeceptJS repo and synchronized manually with:

```
bunosh docs:update
```

## Publish site

```
bunosh publish
```

