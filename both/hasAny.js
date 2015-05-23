/**
 * Checks whether a user (by default the current user)
 * has any plans.
 *
 * @method  AppPlans.hasAny
 * @public
 * @reactive
 * @param   {Object}  [options]                 Options. This argument can be omitted.
 * @param   {String}  [options.userId]          You can specify a different user ID. Otherwise the current user is assumed.
 * @param   {String}  [options.email]           The email address to remove a plan for. Required if no userId specified and not logged in. Ignored if userId is specified or if logged in.
 * @param {Function}  [callback]                Optional callback function. Required if looking up by email address in client code. Will be passed an error argument if there was an error.
 * @returns {Boolean} Has plan?
 */
AppPlans.hasAny = Meteor.wrapAsync(function (options, callback) {
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

  var list = Utility.getPlansList(options, function (error, result) {
    callback(error, !!(result && result.length > 0));
  });

  // Check whether the `appPlans.list` array in the user
  // document contains plans
  return !!(list && list.length > 0);
});
