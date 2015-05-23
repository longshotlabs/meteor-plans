var testOptions = null;

if (Meteor.isClient) {
  // On the client, the "get" functions should not throw errors
  // due to not being logged in because we want to be able to
  // use the reactively and as template helpers.
  
  Tinytest.addAsync('AppPlans - User - Has Any Before Login', function (test, next) {
    
    var hasAny = AppPlans.hasAny();
    test.isFalse(hasAny);

    // Async
    AppPlans.hasAny(function (error, result) {
      test.isFalse(!!error);
      test.isFalse(result);
      next();
    });
    
  });

  Tinytest.addAsync('AppPlans - User - Get Before Login', function (test, next) {

    var plan = AppPlans.get();
    test.isUndefined(plan);

    // Async
    AppPlans.get(function (error, result) {
      test.isFalse(!!error);
      test.isUndefined(result);
      next();
    });
    
  });

  Tinytest.addAsync('AppPlans - User - List Before Login', function (test, next) {

    var plans = AppPlans.list();
    test.isUndefined(plans);

    // Async
    AppPlans.list(function (error, result) {
      test.isFalse(!!error);
      test.isUndefined(result);
      next();
    });
    
  });
}
  
Tinytest.addAsync('AppPlans - User - Create User and Log In', function (test, next) {
  if (Meteor.isClient) {
    Accounts.createUser({
      email: testEmail,
      password: 'password'
    }, function () {
      testUserId = Meteor.userId();
      test.isTrue(!!testUserId);

      if (Meteor.isServer) {
        testOptions = {userId: testUserId};
      }

      next();
    });
  } else {
    testUserId = Accounts.createUser({
      email: testEmail,
      password: 'password'
    });
    test.isTrue(!!testUserId);

    if (Meteor.isServer) {
      testOptions = {userId: testUserId};
    }

    next();
  }

});

Tinytest.addAsync('AppPlans - User - Verify Plans Were Copied', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    test.isTrue(AppPlans.has(plan2, testOptions));
  }

  // Async
  function checkRemove(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    next();
  }

  function checkHasAccess(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.remove(plan2, testOptions, checkRemove);
  }

  function checkHas(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.hasAccess(includedPlan, testOptions, checkHasAccess);
  }

  AppPlans.has(plan2, testOptions, checkHas);
});

Tinytest.addAsync('AppPlans - User - Add', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    var result = AppPlans.add(plan1, testOptions);
    test.isTrue(result);
    test.isTrue(AppPlans.has(plan1, testOptions));
    test.equal(AppPlans.get(testOptions), plan1);
    test.isFalse(AppPlans.hasAccess(includedPlan, testOptions));
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
    AppPlans.hasAccess(includedPlan, testOptions, checkHasAccess);
  }

  function checkAdd(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.has(plan2, testOptions, checkHas);
  }

  AppPlans.add(plan2, testOptions, checkAdd);
});

Tinytest.addAsync('AppPlans - User - Remove', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    test.isTrue(AppPlans.has(plan1, testOptions));
    var result = AppPlans.remove(plan1, testOptions);
    test.isTrue(result);
    test.isFalse(AppPlans.has(plan1, testOptions));
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
    AppPlans.has(plan2, testOptions, checkHasAfter);
  }

  function checkHasBefore(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.remove(plan2, testOptions, checkRemove);
  }

  AppPlans.has(plan2, testOptions, checkHasBefore);
});

Tinytest.addAsync('AppPlans - User - Set - Setup', function (test, next) {
  AppPlans.add(plan1, testOptions, next);
});

// Sync
if (Meteor.isServer) {
  Tinytest.add('AppPlans - User - Set - Sync Test', function (test) {
    test.isTrue(AppPlans.has(plan1, testOptions));
    var result = AppPlans.set(plan2, testOptions);
    test.isTrue(result);
    test.isFalse(AppPlans.has(plan1, testOptions));
    test.isTrue(AppPlans.has(plan2, testOptions));

    // Set up next test
    AppPlans.set(plan1, testOptions);
  });
}

// Async
Tinytest.addAsync('AppPlans - User - Set - Async Test', function (test, next) {

  function checkHasPlan1After2(error, result) {
    test.isFalse(!!error);
    test.isFalse(result);
    next();
  }

  function checkHasPlan2After(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.has(plan1, testOptions, checkHasPlan1After2);
  }

  function checkSet(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.has(plan2, testOptions, checkHasPlan2After);
  }

  function checkHasBefore(error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    AppPlans.set(plan2, testOptions, checkSet);
  }

  AppPlans.has(plan1, testOptions, checkHasBefore);
});

Tinytest.addAsync('AppPlans - User - Has Any', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    test.isTrue(AppPlans.hasAny(testOptions));
  }

  // Async
  AppPlans.hasAny(testOptions, function (error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    next();
  });
});

Tinytest.addAsync('AppPlans - User - Get', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    test.equal(AppPlans.get(testOptions), plan2);
  }

  // Async
  AppPlans.get(testOptions, function (error, result) {
    test.isFalse(!!error);
    test.equal(result, plan2);
    next();
  });
});

if (Meteor.isClient) {
  Tinytest.addAsync('AppPlans - User - Synchronous and Reactive Get', function (test, next) {
    // Since `get` uses `list` internally, this also tests `list`
    var shouldBe = plan2;
    var timesCalled = 0;

    Tracker.autorun(function (c) {
      var plan = AppPlans.get();
      if (!plan) {
        // Can rerun empty in between
        return;
      }

      timesCalled++;
      test.equal(plan, shouldBe);

      switch (timesCalled) {
        case 1:
          AppPlans.set(plan1);
          shouldBe = plan1;
          break;
        case 2:
          AppPlans.set(plan2);
          shouldBe = plan2;
          break;
        case 3:
          c.stop();
          next();
          break;
      }
    });
  });
}

Tinytest.addAsync('AppPlans - User - List', function (test, next) {

  // Sync
  if (Meteor.isServer) {
    test.equal(AppPlans.list(testOptions), [plan2]);
  }

  // Async
  AppPlans.list(testOptions, function (error, result) {
    test.isFalse(!!error);
    test.equal(result, [plan2]);
    next();
  });
});

Tinytest.addAsync('AppPlans - User - Sync', function (test, next) {

  // Synchronizing won't do anything but should not error
  // and should return true

  // Sync
  if (Meteor.isServer) {
    test.isTrue(AppPlans.sync(testOptions));
  }

  // Async
  AppPlans.sync(testOptions, function (error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    next();
  });
});

Tinytest.addAsync('AppPlans - User - Sync One', function (test, next) {

  // Synchronizing won't do anything but should not error
  // and should return true

  // Sync
  if (Meteor.isServer) {
    test.isTrue(AppPlans.syncOne(plan2, testOptions));
  }

  // Async
  AppPlans.syncOne(plan2, testOptions, function (error, result) {
    test.isFalse(!!error);
    test.isTrue(result);
    next();
  });
});
