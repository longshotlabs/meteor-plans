/**
 * Removes a plan for a user. Linked plans will also be removed.
 *
 * @method AppPlans.remove
 * @public
 * @param {String}   planName                  The plan name, as defined by `AppPlans.define`
 * @param {Object}   [options]                 Options. This argument can be omitted.
 * @param {String}   [options.userId]          On the server, you can specify a different user ID. Otherwise the current user is assumed.
 * @param {String}   [options.email]           The email address to remove a plan for. Required if no userId specified and not logged in. Ignored if userId is specified or if logged in.
 * @param {String}   [options.skipUnsubscribe] On the server, you can set this to `true` to remove the plan from the user without unsubscribing through the outside service first.
 * @param {Function} [callback]                Optional callback function. Will be passed an error argument if there was an error.
 */
AppPlans.remove = Meteor.wrapAsync(function (planName, options, callback) {
  // options argument can be omitted. If so, make some adjustments.
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  Utility.checkOptions(options);

  // Client
  if (Meteor.isClient) {
    // throw error if plan with that name doesn't exist
    Utility.getPlan(planName);
    // Call server method to remove the plan
    Meteor.call('AppPlans/remove', planName, options, callback);
  }

  // Server
  else {
    try {
      var removed = Utility.removePlan(planName, options);
      callback(null, removed);
    } catch (error) {
      callback(error, false);
    }
  }
});
