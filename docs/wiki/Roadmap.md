# ✅ 3.6

* Healers
* Refactored AI

# 3.7 

* Prepare for ESM, to allow importing CJS modules
* Add named exports for all globals:

```js
const { debug, pause } = require('codeceptjs/debug');
const { inject, share, actor } = require('codeceptjs/container');
const { locate, secret, tryTo, retryTo, hopeThat, step, session, within } = require('codeceptjs/fns');
const { eachElement: $, expectElement, expectElements } = require('codeceptjs/els');
const { Given, When, Then } = require('codeceptjs/bdd');
```

* Add `els` module to work on Playwright / webdriverio elements in a native way

```js
const { expectElement } = require('codeceptjs/els');

// perform assertion
expectElement('.item', el => el.isVisible());
```

* Add `hopeTo` plugin for soft-assertion

```js
hopeThat(() => I.see('asdsa'));
hopeThat(() => I.dontSee('asdsad'))
```

* Remove `SoftExpectHelper`
* Add ai-auto-suggestions when in `pause()` mode
* ❓ Add `editWithCopilot()` function which is a pause that can update the test file

# 4.0

* Disable promise chain globally or per test
* Migrate to ESM

Explicitly import helpers:

```js
// codecept.conf.js
import { Playwright } from 'codeceptjs/helpers'
import ExpectHelper from '@codeceptjs/expect-helper'

config = {
  helpers: {
    Playwright: {
    },
    ExpectHelper: {
      // maybe config here
    }
  }

}
```

Explicitly use all global functions in tests:

```js
import { debug, pause } from 'codeceptjs/debug';
import { inject, share, actor } from 'codeceptjs/container';
import { locate, secret, tryTo, retryTo, hopeThat, step, session, within } from 'codeceptjs/fns';
import { eachElement as $, expectElement, expectElements } from 'codeceptjs/els';
import { Given, When, Then } from 'codeceptjs/bdd';


```

# 4.1

* State management (similar to fixtures in Playwright)