---
title: Installation
---

## Quick Start via Installer

Creating a new project via [`create-codeceptjs` installer](https://github.com/codeceptjs/create-codeceptjs) is the simplest way to start.

Install CodeceptJS + Playwright into current directory:

```sh
npx create-codeceptjs .
```

Install CodeceptJS + Puppeteer into current directory:

```sh
npx create-codeceptjs . --puppeteer
```

Install CodeceptJS + WebDriver into current directory:

```sh
npx create-codeceptjs . --webdriverio
```

Install CodeceptJS + WebDriver into `e2e-tests` directory:

```sh
npx create-codeceptjs e2e-tests --webdriverio
```

If you plan to use CodeceptJS for API testing only, proceed to standard installation.

## Standard Installation

Open a directory where you want to install CodeceptJS tests.
If it is an empty directory, create a new NPM package with:

```sh
npm init -y
```

Initialize CodeceptJS:

```sh
npx codeceptjs init
```

After choosing a default helper (Playwright, Puppeteer, WebDriver, etc.), a corresponding package should be installed automatically.

> If you face issues installing additional packages while running `npx codeceptjs init`, install required packages manually with npm.

Unless you are using WebDriver, CodeceptJS is ready to go.
For WebDriver installation Selenium Server is required (see section below).

## ESM Support

CodeceptJS v4.x supports ECMAScript Modules (ESM). To use ESM:

1. Add `"type": "module"` to your `package.json`.
2. Update import syntax in configuration files to ESM format.

For details, see [Configuration: For ESM Projects](/configuration/#for-esm-projects-codeceptjs-4x).

## WebDriver

WebDriver-based helpers require [Selenium Server](/webdriver/#what-is-selenium-webdriver). They also require ChromeDriver or GeckoDriver to run corresponding browsers.

You can install them manually or use:

- [Selenium Standalone](https://www.npmjs.com/package/selenium-standalone) to install and run Selenium, ChromeDriver, and GeckoDriver.
- [Docker Selenium](https://github.com/SeleniumHQ/docker-selenium) for headless browser testing.

Launch Selenium with Chrome browser inside a Docker container:

```sh
docker run --net=host selenium/standalone-chrome
```
