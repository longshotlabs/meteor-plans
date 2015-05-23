Tinytest.addAsync('AppPlans - Email - Add', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    var result = AppPlans.add(plan1, {email: testEmail});
    test.isTrue(result);
    test.isTrue(AppPlans.has(plan1, {email: testEmail}));
    test.equal(AppPlans.get({email: testEmail}), plan1);
  }

  // Async
  function checkHasAccess(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    next();
  }

  function checkHas(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.hasAccess(includedPlan, {email: testEmail}, checkHasAccess);
  }

  function checkAdd(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.has(plan2, {email: testEmail}, checkHas);
  }

  AppPlans.add(plan2, {email: testEmail}, checkAdd);
});

Tinytest.addAsync('AppPlans - Email - Remove', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    test.isTrue(AppPlans.has(plan1, {email: testEmail}));
    var result = AppPlans.remove(plan1, {email: testEmail});
    test.isTrue(result);
    test.isFalse(AppPlans.has(plan1, {email: testEmail}));
  }

  // Async
  function checkHasAfter(error, result) {
    test.isFalse(!!error);
    test.isFalse(result);
    next();
  }

  function checkRemove(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.has(plan2, {email: testEmail}, checkHasAfter);
  }

  function checkHasBefore(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.remove(plan2, {email: testEmail}, checkRemove);
  }

  AppPlans.has(plan2, {email: testEmail}, checkHasBefore);
});

Tinytest.addAsync('AppPlans - Email - Set - Setup', function (test, next) {
  AppPlans.add(plan1, {email: testEmail}, next);
});

// Sync
if (Meteor.isServer) {
  Tinytest.add('AppPlans - Email - Set - Sync Test', function (test) {
    test.isTrue(AppPlans.has(plan1, {email: testEmail}));
    var result = AppPlans.set(plan2, {email: testEmail});
    test.isTrue(result);
    test.isFalse(AppPlans.has(plan1, {email: testEmail}));
    test.isTrue(AppPlans.has(plan2, {email: testEmail}));

    // Set up next test
    AppPlans.set(plan1, {email: testEmail});
  });
}

// Async
Tinytest.addAsync('AppPlans - Email - Set - Async Test', function (test, next) {

  function checkHasPlan1After2(error, result) {
    test.isFalse(!!error);
    test.isFalse(result);
    next();
  }

  function checkHasPlan2After(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.has(plan1, {email: testEmail}, checkHasPlan1After2);
  }

  function checkSet(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.has(plan2, {email: testEmail}, checkHasPlan2After);
  }

  function checkHasBefore(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.set(plan2, {email: testEmail}, checkSet);
  }

  AppPlans.has(plan1, {email: testEmail}, checkHasBefore);
});

Tinytest.addAsync('AppPlans - Email - Has Any', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    test.isTrue(AppPlans.hasAny({email: testEmail}));
  }

  // Async
  AppPlans.hasAny({email: testEmail}, function (error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    next();
  });
});

Tinytest.addAsync('AppPlans - Email - Get', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    test.equal(AppPlans.get({email: testEmail}), plan2);
  }

  // Async
  AppPlans.get({email: testEmail}, function (error, result) {
    test.isFalse(!!error);
    test.equal(result, plan2);
    next();
  });
});

Tinytest.addAsync('AppPlans - Email - List', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    test.equal(AppPlans.list({email: testEmail}), [plan2]);
  }

  // Async
  AppPlans.list({email: testEmail}, function (error, result) {
    test.isFalse(!!error);
    test.equal(result, [plan2]);
    next();
  });
});

Tinytest.addAsync('AppPlans - Email - Sync', function (test, next) {

  // Synchronizing won't do anything but should not error
  // and should return true

  // Sync
  if (Meteor.isServer) {
    test.isTrue(AppPlans.sync({email: testEmail}));
  }

  // Async
  AppPlans.sync({email: testEmail}, function (error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    next();
  });
});

Tinytest.addAsync('AppPlans - Email - Sync One', function (test, next) {

  // Synchronizing won't do anything but should not error
  // and should return true

  // Sync
  if (Meteor.isServer) {
    test.isTrue(AppPlans.syncOne(plan2, {email: testEmail}));
  }

  // Async
  AppPlans.syncOne(plan2, {email: testEmail}, function (error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    next();
  });
});
