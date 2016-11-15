Package.describe({
  name: "aldeed:plans",
  summary: "Wrapper for managing subscription plans tracking with pluggable external services",
  version: "0.0.1",
  git: "https://github.com/aldeed/meteor-plans"
});

Package.onUse(function(api) {
  api.export('AppPlans');
  api.export('Utility', {testOnly: true});

  api.use('underscore@1.0.1');
  api.use('templating@1.0.9');
  api.use('blaze@2.0.3');
  api.use('tracker@1.0.3');
  api.use('mongo@1.0.0');
  api.use('check@1.0.0');
  api.use('accounts-base@1.0.0');

  api.addFiles([
    'both/utility.js',
    'both/plans.js',
    'both/add.js',
    'both/get.js',
    'both/has.js',
    'both/hasAny.js',
    'both/hasAccess.js',
    'both/list.js',
    'both/remove.js',
    'both/set.js',
    'both/sync.js',
    'both/endDate.js'
  ], ['client', 'server']);

  api.addFiles('client/plans.js', 'client');

  api.addFiles([
    'server/utility.js',
    'server/plans.js',
    'server/methods.js'
  ], 'server');
});

Package.onTest(function(api) {
  api.use('aldeed:plans');
  api.use('accounts-password');
  api.use('tracker');
  api.use('tinytest');

  api.addFiles([
    'tests/plans.js',
    'tests/emailPlans.js',
    'tests/userPlans.js'
  ], ['client', 'server']);
});
