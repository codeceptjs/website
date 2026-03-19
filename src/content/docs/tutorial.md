---
title: CodeceptJS Complete Tutorial
---

Use this tutorial as a practical walkthrough.
For installation and project bootstrap details, use [Quickstart](/quickstart).

## Goal

Build a simple checkout test and then refactor it with Page Objects.

## Prerequisites

- Node.js + npm
- CodeceptJS project initialized (`npx create-codeceptjs .` or `npx codeceptjs init`)
- Base URL configured in `codecept.conf.js` or `codecept.conf.ts`

## Step 1: Create a Basic Checkout Scenario

```js
Feature('Checkout');

Scenario('successful checkout', ({ I }) => {
  I.amOnPage('/');
  I.click('Coffee Cup');
  I.click('Purchase');
  I.click('Checkout');

  I.fillField('First Name', 'John');
  I.fillField('Last Name', 'Doe');
  I.fillField('Address', '123 Main St.');
  I.fillField('City', 'New York');
  I.selectOption('State', 'New York');
  I.fillField('Zip Code', '10001');

  I.click('#credit-card-option');
  I.fillField('Card Number', '4242 4242 4242 4242');
  I.fillField('Expiration Date', '12/30');
  I.fillField('Security Code', '123');

  I.click({ aria: 'Checkout' });
  I.see('Your order has been placed successfully!');
});
```

## Step 2: Run and Debug

```sh
npx codeceptjs run --debug -p pauseOnFail
```

Then run normally:

```sh
npx codeceptjs run
```

Headless mode:

```sh
HEADLESS=true npx codeceptjs run
```

Windows:

```sh
set HEADLESS=true&& npx codeceptjs run
```

## Step 3: Refactor with Page Objects

Generate a page object:

```sh
npx codeceptjs gpo
```

Example `pages/Checkout.js`:

```js
const { I } = inject();

module.exports = {
  fillShippingAddress(firstName, lastName, address, city, state, zip) {
    I.fillField('First Name', firstName);
    I.fillField('Last Name', lastName);
    I.fillField('Address', address);
    I.fillField('City', city);
    I.selectOption('State', state);
    I.fillField('Zip Code', zip);
  },

  fillValidCard() {
    I.click('#credit-card-option');
    I.fillField('Card Number', '4242 4242 4242 4242');
    I.fillField('Expiration Date', '12/30');
    I.fillField('Security Code', '123');
  },

  submitOrder() {
    I.click({ aria: 'Checkout' });
  },
};
```

Use it in test:

```js
Scenario('successful checkout', ({ I, checkoutPage }) => {
  I.amOnPage('/');
  I.click('Coffee Cup');
  I.click('Purchase');
  I.click('Checkout');

  checkoutPage.fillShippingAddress('John', 'Doe', '123 Main St.', 'New York', 'New York', '10001');
  checkoutPage.fillValidCard();
  checkoutPage.submitOrder();

  I.see('Your order has been placed successfully!');
});
```

## Next

- [Page Objects](/pageobjects)
- [Locators](/locators)
- [Web API (Unified)](/web-api)
- [Best Practices](/best)
