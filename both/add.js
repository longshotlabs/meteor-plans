
/**
 * Adds a plan for a user. Linked plans will also be added.
 *
 * @method AppPlans.add
 * @public
 * @param {String}   planName                The plan name, as defined by `AppPlans.define`
 * @param {Object}   [options]               Options. This argument can be omitted.
 * @param {String}   [options.service]       Which service to pay/subscribe with. Omit if this plan has no outside services linked or if you want to use the first service listed.
 * @param {Object}   [options.token]         Pass a token object if on the server or if you've already obtained one on the client. Required if on the server and you've specified a service, unless the user already has a customer ID. On the client, payment flow will automatically begin to obtain the token unless the user already has a customer ID.
 * @param {Object}   [options.payOptions]    Options for the client-side payment interface. Otherwise defaults from `AppPlans.define` are used.
 * @param {String}   [options.userId]        On the server, you can specify a different user ID. Otherwise the current user is assumed.
 * @param {String}   [options.email]         The email address to add a plan for. Required if no userId specified and not logged in. Ignored if userId is specified or if logged in.
 * @param {String}   [options.skipSubscribe] On the server, you can set this to `true` to add the plan to the user without subscribing through the outside service first.
 * @param {Boolean}  [options.removeAllFirst] Remove all other plans first (set instead of add)
 * @param {Function} [callback]              Optional callback function. Will be passed an error argument if there was an error.
 */
AppPlans.add = Meteor.wrapAsync(function (planName, options, callback) {
  var planServiceDefinition, service, plan, payOptions;

  // options argument can be omitted. If so, make some adjustments.
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  if (Meteor.isServer || options.token) {
    // If we're on the client and we don't have a
    // token already, we'll show payment flow,
    // so it's OK if we don't yet know the email
    // or user.
    Utility.checkOptions(options);
  }

  // Get the plan definition
  plan = Utility.getPlan(planName);

  function getToken() {
    // On the client, it's fine. Call the
    // external service's `pay` function now to obtain one.
    // After payment flow, `AppPlans.add` should be called
    // again with `options.token` set.
    if (Meteor.isClient) {
      service = Utility.getService(planServiceDefinition.name);
      payOptions = options.payOptions || planServiceDefinition.payOptions;
      service.pay(planName, payOptions, _.omit(options, 'payOptions'), callback);
    }

    // On the server, we must have a token
    else {
      throw new Error('AppPlans.add: Must be called with options.token set on the server if there are outside services linked');
    }
  }

  function doAdd() {
    // If we got here then the plan is not connected with an
    // outside subscription, or a payment token was obtained
    // some other way and passed in `options.token`.

    // Client
    if (Meteor.isClient) {
      if (options.removeAllFirst) {
        // Call server method to set the plan
        Meteor.call('AppPlans/set', planName, options, callback);
      } else {
        // Call server method to add the plan
        Meteor.call('AppPlans/add', planName, options, callback);
      }
    }

    // Server
    else {
      try {
        if (options.removeAllFirst) {
          Utility.removeAllPlans(options);
        }
        var result = Utility.addPlan(planName, options);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    }
  }

  // If this plan is not linked with outside services
  if (!plan.services || plan.services.length === 0) {
    doAdd();
    return;
  }

  // We get the plan service definition outside of the `if` block below
  // because we want to throw an error if it doesn't exist in all cases.
  planServiceDefinition = Utility.getServiceDefinitionForPlan(plan, options.service);

  // If we already have a payment token
  if (options.token) {
    doAdd();
    return;
  }

  var getCustomerIdOptions = _.extend({
    userId: Meteor.isClient && Meteor.userId()
  }, options);

  // If we don't already have a customer ID for this service.
  Utility.getCustomerId(getCustomerIdOptions, planServiceDefinition.name, function (error, customerId) {
    if (error) {
      callback(error);
      return;
    }

    if (customerId) {
      doAdd();
    } else {
      getToken();
    }
  });

});
