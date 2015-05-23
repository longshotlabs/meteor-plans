/**
 * Sync one plan for one user by querying the linked
 * outside service to see if the plan is active and
 * then removing the plan for the user if not active.
 *
 * @method AppPlans.syncOne
 * @public
 * @param {String}   planName         The plan name
 * @param {Object}   [options]        Options
 * @param {String}   [options.userId] On the server, you can specify a different user ID. Otherwise the current user is assumed.
 * @param {String}   [options.email]  The email address to sync for. Required if no userId specified and not logged in. Ignored if userId is specified or if logged in.
 * @param {Function} [callback]       Optional callback function. Will be passed an error argument if there was an error.
 */
AppPlans.syncOne = Meteor.wrapAsync(function (planName, options, callback) {
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
    // Call server method to sync the plan
    Meteor.call('AppPlans/sync', planName, options, callback);
  }

  // Server
  else {
    try {
      var result = Utility.syncPlan(planName, options);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  }
});

/**
 * Sync all plans for one user by querying the linked
 * outside service to see if the plans are active and
 * then removing the plans for the user if not active.
 *
 * @method AppPlans.sync
 * @public
 * @param {Object}   [options]        Options
 * @param {String}   [options.userId] On the server, you can specify a different user ID. Otherwise the current user is assumed.
 * @param {String}   [options.email]  The email address to sync for. Required if no userId specified and not logged in. Ignored if userId is specified or if logged in.
 * @param {Function} [callback]       Optional callback function. Will be passed an error argument if there was an error.
 */
AppPlans.sync = Meteor.wrapAsync(function (options, callback) {
  // options argument can be omitted. If so, make some adjustments.
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  Utility.checkOptions(options);

  // Client
  if (Meteor.isClient) {
    // Call server method to sync all plans
    Meteor.call('AppPlans/syncAll', options, callback);
  }

  // Server
  else {
    try {
      var result = Utility.syncAllPlans(options);
      callback(null, result);
    } catch (error) {
      callback(error);
    }
  }
});
