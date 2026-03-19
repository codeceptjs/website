---
title: React Native Locators
---

# Automating React Native Apps

## Problem

> Note: This issue is mostly not relevant starting from `react-native@0.65.x`.
> See [React Native changelog](https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#android-specific-9).

Let's say we have a React Native component like this:

```html
<Button testID="someButton">My button</Button>
```

If you run:

```js
I.tap('~someButton');
```

it works on iOS (XCUITest), but on Android UIAutomator2 you may get:

```text
Touch actions like "tap" need at least some kind of position information like "element", "x" or "y" options, you've none given.
```

This happens because React Native puts `testID` into the [View tag](https://developer.android.com/reference/android/view/View#tags) on Android, and UIAutomator cannot use view tags directly.

## Solutions

One common workaround is using `testID` for iOS and `accessibilityLabel` for Android, but `accessibilityLabel` is user-facing accessibility text and usually should not be overloaded for test-only needs.

A better option is to use the **Espresso** driver on Android.

Enable Espresso in Appium config:

```js
{
  helpers: {
    Appium: {
      app: '/path/to/apk.apk',
      platform: 'Android',
      desiredCapabilities: {
        automationName: 'Espresso',
        platformVersion: '9',
        deviceName: 'Android Emulator'
      }
    }
  }
}
```

Then use platform-specific locator:

```js
I.tap({ android: '//*[@view-tag="someButton"]', ios: '~someButton' });
```

You can wrap it in a helper function:

```js
function tid(id) {
  return {
    android: `//*[@view-tag="${id}"]`,
    ios: `~${id}`,
  };
}
```

Now tests are cleaner:

```js
I.tap(tid('someButton'));
```

If your React Native app includes a WebView, web locators are available inside that context, including ARIA locators such as:

```js
I.click({ aria: 'Sign in' });
```
