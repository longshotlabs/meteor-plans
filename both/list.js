/**
 * Lists all plans for the user. Reactive on the client.
 *
 * @method  AppPlans.list
 * @public
 * @reactive
 * @param   {Object}  [options]                 Options. This argument can be omitted.
 * @param   {String}  [options.userId]          You can specify a different user ID. Otherwise the current user is assumed.
 * @param   {String}  [options.email]           The email address to remove a plan for. Required if no userId specified and not logged in. Ignored if userId is specified or if logged in.
 * @param {Function}  [callback]                Optional callback function. Required if looking up by email address in client code. Will be passed an error argument if there was an error.
 * @returns {String[]} Array of plan names, possibly empty
 */
AppPlans.list = Meteor.wrapAsync(function (options, callback) {
// options argument can be omitted. If so, make some adjustments.
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options = _.extend({
    // If no userId argument provided, use the current user.
    userId: Meteor.isClient && Meteor.userId(),
    email: null
  }, options || {});

  if (Meteor.isServer) {
    Utility.checkOptions(options);
  }

  var list = Utility.getPlansList(options, function (error, list) {
    if (!list) {
      callback(error);
      return;
    }

    list = _.map(list || [], function (plan) {
      return plan.planName;
    });
    callback(error, list);
  });

  if (!list) {
    return;
  }

  return _.map(list || [], function (plan) {
    return plan.planName;
  });
});
