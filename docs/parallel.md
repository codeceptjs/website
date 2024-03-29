---
permalink: /parallel
title: Parallel Execution
---

# Parallel Execution

CodeceptJS has two engines for running tests in parallel:

* `run-workers` - which spawns [NodeJS Worker](https://nodejs.org/api/worker_threads.html) in a thread. Tests are split by scenarios, scenarios are mixed between groups, each worker runs tests from its own group.
* `run-multiple` - which spawns a subprocess with CodeceptJS. Tests are split by files and configured in `codecept.conf.js`.

Workers are faster and simpler to start, while `run-multiple` requires additional configuration and can be used to run tests in different browsers at once.

## Parallel Execution by Workers

It is easy to run tests in parallel if you have a lots of tests and free CPU cores. Just execute your tests using `run-workers` command specifying the number of workers to spawn:

```
npx codeceptjs run-workers 2
```

> ℹ Workers require NodeJS >= 11.7

This command is similar to `run`, however, steps output can't be shown in workers mode, as it is impossible to synchronize steps output from different processes.

Each worker spins an instance of CodeceptJS, executes a group of tests, and sends back report to the main process.

By default, the tests are assigned one by one to the available workers this may lead to multiple execution of `BeforeSuite()`. Use the option `--suites` to assign the suites one by one to the workers.

```sh
npx codeceptjs run-workers --suites 2
```

## Test stats with Parallel Execution by Workers

```js
const { event } = require('codeceptjs');

module.exports = function() {

  event.dispatcher.on(event.workers.result, function (result) {

    console.log(result);

  });
}

// in console log
FAIL  | 7 passed, 1 failed, 1 skipped   // 2s
{
  "tests": {
  "passed": [
    {
      "type": "test",
      "title": "Assert @C3",
      "body": "() => { }",
      "async": 0,
      "sync": true,
      "_timeout": 2000,
      "_slow": 75,
      "_retries": -1,
      "timedOut": false,
      "_currentRetry": 0,
      "pending": false,
      "opts": {},
      "tags": [
        "@C3"
      ],
      "uid": "xe4q1HdqpRrZG5dPe0JG+A",
      "workerIndex": 3,
      "retries": -1,
      "duration": 493,
      "err": null,
      "parent": {
        "title": "My",
        "ctx": {},
        "suites": [],
        "tests": [],
        "root": false,
        "pending": false,
        "_retries": -1,
        "_beforeEach": [],
        "_beforeAll": [],
        "_afterEach": [],
        "_afterAll": [],
        "_timeout": 2000,
        "_slow": 75,
        "_bail": false,
        "_onlyTests": [],
        "_onlySuites": [],
        "delayed": false
      },
      "steps": [
        {
          "actor": "I",
          "name": "amOnPage",
          "status": "success",
          "args": [
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/POST"
          ],
          "startedAt": 1698760652610,
          "startTime": 1698760652611,
          "endTime": 1698760653098,
          "finishedAt": 1698760653098,
          "duration": 488
        },
        {
          "actor": "I",
          "name": "grabCurrentUrl",
          "status": "success",
          "args": [],
          "startedAt": 1698760653098,
          "startTime": 1698760653098,
          "endTime": 1698760653099,
          "finishedAt": 1698760653099,
          "duration": 1
        }
      ]
    }
  ],
    "failed": [],
    "skipped": []
}
}
```

CodeceptJS also exposes the env var `process.env.RUNS_WITH_WORKERS` when running tests with `run-workers` command so that you could handle the events better in your plugins/helpers

```js
const { event } = require('codeceptjs');

module.exports = function() {
    // this event would trigger the  `_publishResultsToTestrail` when running `run-workers` command
  event.dispatcher.on(event.workers.result, async () => {
    await _publishResultsToTestrail();
  });
  
  // this event would not trigger the  `_publishResultsToTestrail` multiple times when running `run-workers` command
  event.dispatcher.on(event.all.result, async () => {
      // when running `run` command, this env var is undefined
    if (!process.env.RUNS_WITH_WORKERS) await _publishResultsToTestrail();
  });
}
```

## Parallel Execution by Workers on Multiple Browsers

To run tests in parallel across multiple browsers, modify your `codecept.conf.js` file to configure multiple browsers on which you want to run your tests and your tests will run across multiple browsers. 

Start with modifying the `codecept.conf.js` file. Add multiple key inside the config which will be used to configure multiple profiles. 

```
exports.config = {
  helpers: {
    WebDriver: {
      url: 'http://localhost:3000',
      desiredCapabilties: {}
    }
  },
  multiple: {
    profile1: {
      browsers: [
        {
          browser: "firefox",
          desiredCapabilties: {
            // override capabilties related to firefox
          }
        },
        {
          browser: "chrome",
          desiredCapabilties: {
            // override capabilties related to chrome
          }
        }
      ]
    }, 
    profile2: {
      browsers: [
        {
          browser: "safari",
          desiredCapabilties: {
            // override capabilties related to safari
          }
        }
      ]
    }
  }
};
```
To trigger tests on all the profiles configured, you can use the following command: 
```
npx codeceptjs run-workers 3 all -c codecept.conf.js
```
This will run your tests across all browsers configured from profile1 & profile2 on 3 workers.

To trigger tests on specific profile, you can use the following command: 
```
npx codeceptjs run-workers 2 profile1 -c codecept.conf.js
```
This will run your tests across 2 browsers from profile1 on 2 workers.

## Custom Parallel Execution

To get a full control of parallelization create a custom execution script to match your needs.
This way you can configure which tests are matched, how the groups are formed, and with which configuration each worker is executed.

Start with creating file `bin/parallel.js`.

On MacOS/Linux run following commands:

```
mkdir bin
touch bin/parallel.js
chmod +x bin/parallel.js
```

> Filename or directory can be customized. You are creating your own custom runner so take this paragraph as an example.

Create a placeholder in file:

```js
#!/usr/bin/env node
const { Workers, event } = require('codeceptjs');
// here will go magic
```

Now let's see how to update this file for different parallelization modes:

### Example: Running tests in 2 browsers in 4 threads

```js
const workerConfig = {
  testConfig: './test/data/sandbox/codecept.customworker.js',
};

// don't initialize workers in constructor
const workers = new Workers(null, workerConfig);
// split tests by suites in 2 groups
const testGroups = workers.createGroupsOfSuites(2);

const browsers = ['firefox', 'chrome'];

const configs = browsers.map(browser => {
  return {
    helpers: {
      WebDriver: { browser }
    }
  };
});

for (const config of configs) {
  for (group of testGroups) {
    const worker = workers.spawn();
    worker.addTests(group);
    worker.addConfig(config);
  }
}

// Listen events for failed test
workers.on(event.test.failed, (failedTest) => {
  console.log('Failed : ', failedTest.title);
});

// Listen events for passed test
workers.on(event.test.passed, (successTest) => {
  console.log('Passed : ', successTest.title);
});

// test run status will also be available in event
workers.on(event.all.result, () => {
  // Use printResults() to display result with standard style
  workers.printResults();
});

// run workers as async function
runWorkers();

async function runWorkers() {
  try {
    // run bootstrapAll
    await workers.bootstrapAll();
    // run tests
    await workers.run();
  } finally {
    // run teardown All
    await workers.teardownAll();
  }
}
```

Inside `event.all.result` you can obtain test results from all workers, so you can customize the report:

```js
workers.on(event.all.result, (status, completedTests, workerStats) => {
  // print output
  console.log('Test status : ', status ? 'Passes' : 'Failed ');

  // print stats
  console.log(`Total tests : ${workerStats.tests}`);
  console.log(`Passed tests : ${workerStats.passes}`);
  console.log(`Failed test tests : ${workerStats.failures}`);

  // If you don't want to listen for failed and passed test separately, use completedTests object
  for (const test of Object.values(completedTests)) {
    console.log(`Test status: ${test.err===null}, `, `Test : ${test.title}`);
  }
}
```

### Example: Running Tests Split By A Custom Function

If you want your tests to split according to your need this method is suited for you. For example: If you have 4 long running test files and 4 normal test files there chance all 4 tests end up in same worker thread. For these cases custom function will be helpful.

```js

/*
 Define a function to split your tests.

 function should return an array with this format [[file1, file2], [file3], ...]

 where file1 and file2 will run in a worker thread and file3 will run in a worker thread
*/
const splitTests = () => {
  const files = [
    ['./test/data/sandbox/guthub_test.js', './test/data/sandbox/devto_test.js'],
    ['./test/data/sandbox/longrunnig_test.js']
  ];

  return files;
}

const workerConfig = {
  testConfig: './test/data/sandbox/codecept.customworker.js',
  by: splitTests
};

// don't initialize workers in constructor
const customWorkers = new Workers(null,  workerConfig);

customWorkers.run();

// You can use event listeners similar to above example.
customWorkers.on(event.all.result, () => {
  workers.printResults();
});
```

### Emitting messages to the parent worker

Child workers can send non-test events to the main process. This is useful if you want to pass along information not related to the tests event cycles itself such as `event.test.success`.

```js
// inside main process
// listen for any non test related events
workers.on('message', (data) => {
  console.log(data)
});

workers.on(event.all.result, (status, completedTests, workerStats) => {
  // logic
});
```

## Sharing Data Between Workers

NodeJS Workers can communicate between each other via messaging system. It may happen that you want to pass some data from one of the workers to other. For instance, you may want to share user credentials accross all tests. Data will be appended to a container.

However, you can't access uninitialized data from a container, so to start, you need to initialize data first. Inside `bootstrap` function of the config we execute the `share` to initialize value:


```js
// inside codecept.conf.js
exports.config = {
  bootstrap() {
    // append empty userData to container
    share({ userData: false });
  }
}
```

Now each worker has `userData` inside a container. However, it is empty.
When you obtain real data in one of the tests you can now `share` this data accross tests. Use `inject` function to access data inside a container:

```js
// get current value of userData
let { userData } = inject();
// if userData is still empty - update it
if (!userData) {
  userData = { name: 'user', password: '123456' };
  // now new userData will be shared accross all workers
  share({userData : userData});
}
```

If you want to share data only within same worker, and not across all workers, you need to add option `local: true` every time you run `share` 

```js
share({ userData: false }, {local: true });
```
