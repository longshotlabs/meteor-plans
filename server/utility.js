// Pass an options object with userId or email properties,
// and this will update the appPlans object.
Utility.setAppPlansObject = function setAppPlansObject(options, modifier) {
  if (options.userId) {
    Meteor.users.update(options.userId, modifier);
  } else if (options.email) {
    AppPlans.emailPlans.upsert({_id: options.email}, modifier);
  }
};

Utility.addPlan = function addPlan(planName, options) {
  var result, service, serviceName, externalPlanName,
      plan, planServiceDefinition;

  // Set default options
  options = _.extend({
    skipSubscribe: false
  }, options || {});

  var userPlan = Utility.getUserPlanObject(options, planName);
  if (userPlan) {
    // Already has the plan, so we return true
    return true;
  }

  // Get the plan definition, registered using AppPlans.define
  plan = Utility.getPlan(planName);

  // Subscribe using external service if necessary
  if (plan.services && plan.services.length > 0 && !options.skipSubscribe) {
    planServiceDefinition = Utility.getServiceDefinitionForPlan(plan, options.service);
    serviceName = planServiceDefinition.name;
    service = Utility.getService(serviceName);
    externalPlanName = planServiceDefinition.planName;

    options.customerId = Utility.getCustomerId(options, serviceName);

    // TODO need to verify for security reasons that the planName does actually
    // link with the service/externalPlanName that was paid for

    try {

      // Call the service-specific `subscribe` function to subscribe to the
      // external plan.
      result = service.subscribe({
        plan: externalPlanName,
        customerId: options.customerId,
        userId: options.userId,
        email: options.email,
        token: options.token
      });

    } catch (error) {
      throw new Meteor.Error('Service subscription error trying to add plan ' + planName + ' for user ' + (options.userId || options.email), error.message);
    }
  }

  // If successfully subscribed or no external plan linked,
  // add this plan to the user document. `service` may be null.

  var modifier = {
    $addToSet: {
      'appPlans.list': {
        planName: planName,
        service: serviceName
      }
    }
  };

  if (result) {
    modifier.$addToSet['appPlans.list'].subscriptionId = result.subscriptionId;
    modifier.$set = {};
    modifier.$set['appPlans.' + serviceName + '.customerId'] = result.customerId;
  }

  Utility.setAppPlansObject(options, modifier);

  return true;
};

Utility.removePlan = function removePlan(planName, options) {
  var service;

  // Set default options
  options = _.extend({
    skipUnsubscribe: false
  }, options || {});

  var userPlan = Utility.getUserPlanObject(options, planName);

  // If the user does not have this plan, return `true` because that
  // is the desired goal (remove).
  if (!userPlan) {
    return true;
  }

  // Get the plan definition, registered using AppPlans.define
  var plan = Utility.getPlan(planName);

  // Unsubscribe using external service if necessary
  if (userPlan.service && !options.skipUnsubscribe) {
    service = Utility.getService(userPlan.service);
    var planServiceDefinition = Utility.getServiceDefinitionForPlan(plan, userPlan.service);
    var externalPlanName = planServiceDefinition.planName;

    options.customerId = Utility.getCustomerId(options, userPlan.service);

    try {

      // Call the service-specific `subscribe` function to subscribe to the
      // external plan.
      service.unsubscribe({
        plan: externalPlanName,
        customerId: options.customerId,
        userId: options.userId,
        subscriptionId: userPlan.subscriptionId
      });

    } catch (error) {
      throw new Meteor.Error('Error trying to unsubscribe for plan ' + planName + ' for user ' + (options.userId || options.email), error.message);
    }
  }

  // If successfully unsubscribed or no external plan linked,
  // remove this plan from the user.
  Utility.setAppPlansObject(options, {
    $pull: {
      'appPlans.list': {planName: userPlan.planName}
    }
  });

  return true;
};

Utility.removeAllPlans = function removeAllPlans(options, skipUnsubscribe) {
  var list = Utility.getPlansList(options);
  _.each(list || [], function (plan) {
    Utility.removePlan(plan.planName, _.extend({
      skipUnsubscribe: !!skipUnsubscribe
    }, options));
  });
};

Utility.syncPlan = function syncPlan(planName, options) {
  var result, service;

  var userPlan = Utility.getUserPlanObject(options, planName);

  // If the user does not have this plan, return
  if (!userPlan) {
    // XXX we may actually want to query anyway to see if they
    // should have this plan added
    return true;
  }

  // Get the plan definition, registered using AppPlans.define
  var plan = Utility.getPlan(planName);

  // If no external service, no need to sync
  if (!userPlan.service) {
    return true;
  }

  service = Utility.getService(userPlan.service);
  var planServiceDefinition = Utility.getServiceDefinitionForPlan(plan, userPlan.service);
  var externalPlanName = planServiceDefinition.planName;

  options.customerId = Utility.getCustomerId(options, userPlan.service);

  try {

    // Call the service-specific `isSubscribed` function to check status
    result = service.isSubscribed({
      plan: externalPlanName,
      customerId: options.customerId,
      userId: options.userId,
      subscriptionId: userPlan.subscriptionId
    });

  } catch (error) {
    throw new Meteor.Error('Error checking isSubscribed for plan ' + planName + ' for user ' + (options.userId || options.email), error.message);
  }

  // We're not subscribed externally, so remove from plans list
  if (!result) {
    Utility.setAppPlansObject(options, {
      $pull: {
        'appPlans.list': {planName: planName}
      }
    });
  }

  return true;
};

Utility.syncAllPlans = function syncAllPlans(options) {
  var list = Utility.getPlansList(options);
  _.each(list || [], function (plan) {
    Utility.syncPlan(plan.planName, options);
  });
  return true;
};
