---
title: Extending CodeceptJS
---

# Extending 

CodeceptJS provides API to run custom code before and after the test and inject custom listeners into the event system.


## Plugins

Plugins allow to use CodeceptJS internal API to extend functionality. Use internal event dispatcher, container, output, promise recorder, to create your own reporters, test listeners, etc.

CodeceptJS includes [built-in plugins](/plugins/) which extend basic functionality and can be turned on and off on purpose. Taking them as [examples](https://github.com/codeceptjs/CodeceptJS/tree/4.x/lib/plugin) you can develop your custom plugins.

A plugin is a basic JS module returning a function. Plugins can have individual configs which are passed into this function:

```js
const defaultConfig = {
  someDefaultOption: true
}

module.exports = function(config) {
  config = Object.assign(defaultConfig, config);
  // do stuff
}
```

Plugin can register event listeners or hook into promise chain with recorder. See [Concepts](/internal-api) for API reference.

To enable your custom plugin in config add it to `plugins` section. Specify path to node module using `require`.

```js
"plugins": {
  "myPlugin": {
    "require": "./path/to/my/module",
    "enabled": true
  }
}
```

* `require` - specifies relative path to a plugin file. Path is relative to config file.
* `enabled` - to enable this plugin.

If a plugin is disabled (`enabled` is not set or false) this plugin can be enabled from command line:

```
npx codeceptjs run --plugin myPlugin
```

Several plugins can be enabled as well:

```
npx codeceptjs run --plugin myPlugin,allure
```

### Example: Execute code for a specific group of tests

If you need to execute some code before a group of tests, you can [mark these tests with a same tag](/advanced/#tags). Then listen for tests where this tag is included (see [test object API](/internal-api#test-object)).

Let's say we need to populate database for a group of tests.

```js
// populate database for slow tests
const event = require('codeceptjs').event;

module.exports = function() {

  event.dispatcher.on(event.test.before, function (test) {

    if (test.tags.indexOf('@populate') >= 0) {
      recorder.add('populate database', async () => {
        // populate database for this test
      })
    }
  });
}
```

### Example: Check URL before running a test

If you want to share bootstrap script or run multiple bootstraps, it's a good idea to wrap that script into a plugin.
Plugin can also execute JS before tests but you need to use internal APIs to synchronize promises.

```js
const { recorder } = require('codeceptjs');

module.exports = function(options) {

  event.dispatcher.on(event.all.before, function () {
    recorder.startUnlessRunning(); // start recording promises
    recorder.add('do some async stuff', async () => {
      // your code
    });
  });
}
```

## API

This page focuses on plugin authoring workflow.  
Detailed low-level API reference (events, recorder, output, container, config, test/step objects) is maintained in [Concepts](/internal-api).

For quick plugin development, these modules are usually enough:

* `event` - subscribe to lifecycle events
* `recorder` - queue async work in execution chain
* `output` - structured logging instead of `console.log`
* `container` - access helpers/support objects/plugins
* `config` - read runtime configuration

## Custom Runner

Custom runner usage is documented in [Concepts > Custom Runner](/internal-api#custom-runner).
