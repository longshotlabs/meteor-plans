// Tests Config

AppPlans.define('server1');
AppPlans.define('server-included');
AppPlans.define('server2', {
  includedPlans: ['server-included']
});
AppPlans.define('client1');
AppPlans.define('client-included');
AppPlans.define('client2', {
  includedPlans: ['client-included']
});

if (Meteor.isServer) {
  plan1 = 'server1';
  plan2 = 'server2';
  includedPlan = 'server-included';
  testEmail = 'foo-server@bar.com';
} else {
  plan1 = 'client1';
  plan2 = 'client2';
  includedPlan = 'client-included';
  testEmail = 'foo-client@bar.com';
}

if (Meteor.isServer) {
  Meteor.methods({
    clear: function () {
      AppPlans.emailPlans.remove({});
      Meteor.users.remove({});
    }
  });

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
}

// Helpers

noOp = function () {};
testUserId = null;

// Tests

Tinytest.addAsync('AppPlans - General - Clear', function (test, next) {
  Meteor.call('clear', next);
});

Tinytest.add('AppPlans - General - Throws Error When Not Logged In And No Email', function (test) {
  // Without Callback
  if (Meteor.isServer) {
    // On the client, an error is not thrown because the
    // payment flow can provide the email
    test.throws(function () {
      AppPlans.add(plan1);
    });
  }

  test.throws(function () {
    AppPlans.remove(plan1);
  });

  if (Meteor.isServer) {
    // On the client, an error is not thrown because the
    // payment flow can provide the email
    test.throws(function () {
      AppPlans.set(plan1);
    });
    
    // On the client, the reactive "get" functions should
    // not throw
    test.throws(function () {
      AppPlans.has(plan1);
    });

    test.throws(function () {
      AppPlans.hasAccess(plan1);
    });

    test.throws(function () {
      AppPlans.hasAny();
    });

    test.throws(function () {
      AppPlans.list();
    });

    test.throws(function () {
      AppPlans.get();
    });
  }

  test.throws(function () {
    AppPlans.syncOne(plan1);
  });

  // With Callback
  if (Meteor.isServer) {
    // On the client, an error is not thrown because the
    // payment flow can provide the email
    test.throws(function () {
      AppPlans.add(plan1, noOp);
    });
  }

  test.throws(function () {
    AppPlans.remove(plan1, noOp);
  });

  if (Meteor.isServer) {
    // On the client, an error is not thrown because the
    // payment flow can provide the email
    test.throws(function () {
      AppPlans.set(plan1, noOp);
    });
    
    // On the client, the reactive "get" functions should
    // not throw
    test.throws(function () {
      AppPlans.has(plan1, noOp);
    });

    test.throws(function () {
      AppPlans.hasAny();
    });

    test.throws(function () {
      AppPlans.list();
    });

    test.throws(function () {
      AppPlans.get();
    });
  }

  test.throws(function () {
    AppPlans.syncOne(plan1, noOp);
  });
});

Tinytest.add('AppPlans - General - Throws Error When Plan Name Was Not Defined', function (test) {
  // Without callback
  test.throws(function () {
    AppPlans.add('foo');
  });

  test.throws(function () {
    AppPlans.remove('foo');
  });

  test.throws(function () {
    AppPlans.set('foo');
  });

  test.throws(function () {
    AppPlans.has('foo');
  });

  test.throws(function () {
    AppPlans.hasAccess('foo');
  });

  test.throws(function () {
    AppPlans.syncOne('foo');
  });

  // With callback
  test.throws(function () {
    AppPlans.add('foo', noOp);
  });

  test.throws(function () {
    AppPlans.remove('foo', noOp);
  });

  test.throws(function () {
    AppPlans.set('foo', noOp);
  });

  test.throws(function () {
    AppPlans.has('foo', noOp);
  });
  
  test.throws(function () {
    AppPlans.hasAccess('foo', noOp);
  });

  test.throws(function () {
    AppPlans.syncOne('foo', noOp);
  });
});

