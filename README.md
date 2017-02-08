[![Build Status](https://travis-ci.org/aldeed/meteor-plans.svg)](https://travis-ci.org/aldeed/meteor-plans)

aldeed:plans
===============

STATUS: USE AT YOUR OWN RISK. STILL IN DEVELOPMENT

This Meteor package makes it super simple to define a set of subscription plans for a website or app, where a plan can be linked with an outside service plan (like a plan defined on Stripe).

So plans are like "roles" that can require payment. You can also simply use this package as a roles package.

Currently, the only outside service supported is Stripe. Add the `aldeed:plans-stripe` package for this.

## Installation

In your Meteor app directory:

```bash
$ meteor add aldeed:plans
```

## Usage

To use this package, you need to define one or more plans, and then call functions like `AppPlans.add` or `AppPlans.set` or `AppPlans.remove` to set the current plans for a user, or `AppPlans.has` to check if a user has a plan.

### Define Your Plans

Plans must be defined in server code and in client code. It's fine and easiest to configure in common code. Simply call `AppPlans.define` for each plan. Here is an example:

```js
AppPlans.define('free');

// Define a "premium" plan linked with a Stripe plan.
AppPlans.define('premium', {
  services: [
    {
      name: 'stripe',
      planName: 'stripePlanName',
      payOptions: {} // default options for the service's payment flow
    }
  ],
  // Buying the premium plan also gives you the free plan
  includedPlans: ['free']
});
```

This code does not need to be within a `Meteor.startup` function.

### Add a Plan for a User

In client code, you can assign the current user to a plan:

```js
AppPlans.add('premium', {service: 'stripe'}, function (error) {
  // If no error, the plan was successfully added
});
```

In server code, you can pass any user ID:

```js
AppPlans.add('premium', {service: 'stripe', userId: someUserId}, function (error) {
  // If no error, the plan was successfully removed
});
```

The `service` option must match one of the services defined for the plan when `define` was called. If you don't specify a service, the first one in the `services` array is used.

The callback is optional. Without a callback, this function will log errors on the client and will execute synchronously on the server, throwing any errors.

### Add a Plan for an Email Address

If you want to accept payment and assign a plan before allowing registration, you can assign a plan to an email address. The plans assigned to an email address will be transferred to a user account when someone registers with that address.

```js
AppPlans.add('premium', {
  service: 'stripe',
  email: 'foo@bar.com'
}, function (error) {
  // If no error, the plan was successfully added
});
```

The callback is optional. Without a callback, this function will log errors on the client and will execute synchronously on the server, throwing any errors.

### Set the Plan for a User or an Email Address

`AppPlans.set` is called the same way as `AppPlans.add` with the same arguments and options. The difference is that any current plans will be removed (and unsubscribed from on the remote service) before the new plan is added.

### Remove a Plan for a User

In client code, you can remove the current user from a plan:

```js
AppPlans.remove('premium', function (error) {
  // If no error, the plan was successfully removed
});
```

In server code, you can pass any user ID:

```js
AppPlans.remove('premium', {userId: someUserId}, function (error) {
  // If no error, the plan was successfully removed
});
```

The callback is optional. Without a callback, this function will log errors on the client and will execute synchronously on the server, throwing any errors and returning `true` or `false`.

### Remove a Plan for an Email Address

You can remove email addresses from a plan.

```js
AppPlans.remove('premium', {
  email: 'foo@bar.com'
}, function (error) {
  // If no error, the plan was successfully removed
});
```

The callback is optional. Without a callback, this function will log errors on the client and will execute synchronously on the server, throwing any errors and returning `true` or `false`.

### Check Whether the Current User Has a Plan

```js
if (AppPlans.has('premium')) {
  // do something
}
```

When looking up by email on the client, you must provide a callback:

```js
AppPlans.has('premium', function (error, hasPlan) {
  if (!error && hasPlan) {
    // do something
  }
});
```

### Check Whether the Current User Has Access to a Plan's Features

`AppPlans.hasAccess` is similar to `AppPlans.has` but will also return `true` if the user has a plan that includes the plan you're checking.

```js
if (AppPlans.hasAccess('premium')) {
  // do something
}
```

When looking up by email on the client, you must provide a callback:

```js
AppPlans.hasAccess('premium', function (error, hasAccess) {
  if (!error && hasAccess) {
    // do something
  }
});
```

### Get the User's Current Plans

To get the list of plans for the current user:

```js
var list = AppPlans.list();
```

To get the list of plans for any user on the server:

```js
var list = AppPlans.list({userId: someUserId});
```

To get the list of plans for an email address on the server:

```js
var list = AppPlans.list({email: 'foo@bar.com'});
```

When looking up by email on the client, you must provide a callback:

```js
AppPlans.list({email: 'foo@bar.com'}, function (error, list) {
  if (!error && list) {
    console.log(list);
  }
});
```

### Get the User's Current Plan

If you're only ever assigning one plan at a time to a user, you can use `AppPlans.get` instead of `AppPlans.list` for convenience. It returns the first plan in the user's list. The syntax is the same as for `AppPlans.list` and a callback is required when looking up by email on the client.

To get the current user's plan:

```js
var plan = AppPlans.get();
```

This will be reactive, but when looking up by email on the client, the result is *not* reactive.

### Sync Plans List With the Linked Outside Services

It is likely that you will want to periodically query the outside service APIs to verify that plan subscriptions have not been canceled or expired. You can do this by calling `AppPlans.sync` for a user ID or email address.

You can also sync a single plan with `AppPlans.syncOne(planName)`.

Example:

```js
Accounts.onLogin(function (info) {
  AppPlans.sync({userId: info.user._id});
});
```

### Copy Plans to User Upon Registration Based on Email Address

If you are tracking plans by email address prior to registration, you will likely want to copy those plans to the user document once the user registers. Currently this package does not do this automatically because the `Accounts.onCreateUser` function is meant to be called only once. You can copy the code below or add it to your existing `Accounts.onCreateUser` function.

```js
// Upon creating a new user, we copy any plans for the registered email address
Accounts.onCreateUser(function (options, user) {
  // We still want the default hook's 'profile' behavior.
  if (options.profile) {
    user.profile = options.profile;
  }

  var email = user.emails && user.emails[0] && user.emails[0].address;
  if (email) {
    user.appPlans = AppPlans.pullFromEmail(email);
  }

  return user;
});
```

## Template Helpers

Some template helpers are available to get plan information about the current user:

```
{{#if AppPlans.has 'bronze'}}{{/if}}
{{#if AppPlans.hasAccess 'bronze'}}{{/if}}
{{#each AppPlans.list}}{{/each}}
{{AppPlans.get}}
```

And to iterate through all defined plans:

```
{{#each AppPlans.listDefined}}{{/each}}
```

## Database

Information for this package is stored in an `appPlans` object with the following format:

```js
appPlans: {
  list: [
    {
      planName: '<planName>',
      service: '<serviceName>',
      subscriptionId: '<subscriptionIdFromExternalService>'
    }
  ],
  <serviceName>: {
    customerId: customerIdFromExternalService
  }
}
```

For registered users, this property is found on the user document. If you track plans by email address instead, such as for buying plans before signup, then this property is found on a document in the 'AppPlans_emailPlans' collection, which is accessible from server or client code as `AppPlans.emailPlans`.

The `appPlans` property on the user document for the logged in user is published to the client by default. The `AppPlans.emailPlans` collection is not published to any clients.

### Schema

If you use `aldeed:collection2` package to attach a SimpleSchema to the `Meteor.users` collection, add the following to your schema:

```js
appPlans: {
  type: Object,
  optional: true,
  blackbox: true
}
```

## Adding Your Own Outside Service

TODO
