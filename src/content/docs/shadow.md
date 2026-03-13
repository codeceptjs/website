---
title: Locating Shadow Dom Elements
slug: shadow
---


> Note: Shadow DOM locators are supported only in WebDriver helper.

Shadow DOM is one of the key browser features that make up web components. Web components are a really great way to build reusable elements, and are able to scale all the way up to complete web applications. Style encapsulation, the feature that gives shadow DOM it's power, has been a bit of a pain when it comes to E2E or UI testing. Things just got a little easier though, as CodeceptJS introduced built-in support for shadow DOM via locators of type `shadow`. Let's dig into what they're all about.

Generated HTML code may often look like this (ref: [Salesforce's Lightning Web Components](https://github.com/salesforce/lwc)):

```js
<body>
  <my-app>
    <recipe-hello>
      <button>Click Me!</button>
    </recipe-hello>
    <recipe-hello-binding>
      <ui-input>
        <input type="text" class="input">
      </ui-input>
    </recipe-hello-binding>
  </my-app>
</body>
```

This uses custom elements, `my-app`, `recipe-hello`, `recipe-hello-binding` and `ui-input`. It's quite common that clickable elements are not actual `a` or `button` elements but custom elements. This way `I.click('Click Me!');` won't work, as well as `fillField('.input', 'value)`. Finding a correct locator for such cases turns to be almost impossible until `shadow` element support is added to CodeceptJS.

## Locate Shadow Dom

For Web Components or [Salesforce's Lightning Web Components](https://github.com/salesforce/lwc) with Shadow DOM, a special `shadow` locator is available. It allows selecting an element by its Shadow DOM sequence, defined as an array of `elements`. Elements in this array must follow the same order as shadow elements appear in the DOM.

```js
{ shadow: ['my-app', 'recipe-hello', 'button'] }
{ shadow: ['my-app', 'recipe-hello-binding', 'ui-input', 'input.input'] }
```

In WebDriver, you can use shadow locators in any method where locator is required.

For example, to fill value in `input` field or to click the `Click Me!` button, in above HTML code:

```js
I.fillField({ shadow: ['my-app', 'recipe-hello-binding', 'ui-input', 'input.input'] }, 'value');
I.click({ shadow: ['my-app', 'recipe-hello', 'button'] });
I.click({ aria: 'Click Me!' });
```

## Example

```js
Feature('Shadow Dom Locators');

Scenario('should fill input field within shadow elements', ({I}) => {

  // navigate to LWC webpage containing shadow dom
  I.amOnPage('https://recipes.lwc.dev/');

  // click Click Me! button
  I.click({ shadow: ['my-app', 'recipe-hello', 'button'] });

  // fill the input field
  I.fillField({ shadow: ['my-app', 'recipe-hello-binding', 'ui-input', 'input.input'] }, 'value');

});


```

