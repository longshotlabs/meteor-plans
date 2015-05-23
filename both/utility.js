Utility = {};

Utility.getPlan = function getPlan(planName) {
  if (_.has(AppPlans._plans, planName)) {
    return _.extend({name: planName}, AppPlans._plans[planName]);
  }
  throw new Meteor.Error('AppPlans: No defined plan has the name ' + planName);
};

Utility.getService = function getService(serviceName) {
  if (_.has(AppPlans._services, serviceName)) {
    return AppPlans._services[serviceName];
  }
  throw new Meteor.Error('AppPlans: No defined service has the name ' + serviceName);
};

Utility.getServiceDefinitionForPlan = function (plan, serviceName) {
  // Find the definition for the service we want to use.
  // Use `serviceName` if set, otherwise the first one in the array.
  if (serviceName) {
    planServiceDefinition = _.findWhere(plan.services, {name: serviceName});

    if (!planServiceDefinition) {
      throw new Meteor.Error('AppPlans: The plan "' + plan.name + '" has not defined a corresponding external ' + serviceName + ' plan.');
    }
  } else {
    planServiceDefinition = plan.services[0];

    if (!planServiceDefinition) {
      throw new Meteor.Error('AppPlans: The plan "' + plan.name + '" has not defined any corresponding external plans.');
    }
  }

  return planServiceDefinition;
};

Utility.checkOptions = function checkOptions(options) {
  var loggedIn = false;

  // Calling Meteor.userId on server can sometimes throw an error
  try {
    loggedIn = (typeof Meteor.userId === 'function' && Meteor.userId());
  } catch (e) {}

  if (!options.userId && !options.email && !loggedIn) {
    throw new Error('Must provide either userId or email');
  }
};

// Pass an options object with userId or email properties,
// and this will look up and return the appPlans object.
Utility.getAppPlansObject = Meteor.wrapAsync(function getAppPlansObject(options, callback) {
  var user;

  if (options.userId) {
    user = Meteor.users.findOne(options.userId);
  } else if (options.email) {
    // We can't publish all emailPlans documents to
    // every client, so we'll query a server method
    // if we're in client code.
    if (Meteor.isClient) {
      Meteor.call('AppPlans/getObject', options.email, callback);
      return;
    }

    user = AppPlans.emailPlans.findOne(options.email);
  }

  callback(null, user && user.appPlans);
  return user && user.appPlans;
});

// Pass an options object with userId or email properties,
// and this will look up and return the appPlans list.
Utility.getPlansList = Meteor.wrapAsync(function getPlansList(options, callback) {
  var appPlans = Utility.getAppPlansObject(options, function (error, result) {
    callback(error, result && result.list);
  });
  return appPlans && appPlans.list;
});

// Pass an options object with userId or email properties
// and a plan name, and this will look up and return the
// plan object from the user's appPlans list.
Utility.getUserPlanObject = Meteor.wrapAsync(function getUserPlanObject(options, planName, callback) {
  var list = Utility.getPlansList(options, function (error, result) {
    callback(error, _.findWhere(result || [], {planName: planName}));
  });
  return _.findWhere(list || [], {planName: planName});
});

// Pass an options object with userId or email properties
// and a service name, and this will look up and return the
// user's customer ID for that service.
Utility.getCustomerId = Meteor.wrapAsync(function getCustomerId(options, serviceName, callback) {
  if (!options.email && !options.userId) {
    callback(null);
    return;
  }

  var appPlans = Utility.getAppPlansObject(options, function (error, result) {
    callback(error, result &&
      result[serviceName] &&
      result[serviceName].customerId);
  });

  return appPlans &&
    appPlans[serviceName] &&
    appPlans[serviceName].customerId;
});
