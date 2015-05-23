/**
 * Lists the user's first plan. Reactive on the client.
 *
 * @method  AppPlans.get
 * @public
 * @param   {Object}  [options]                 Options. This argument can be omitted.
 * @param   {String}  [options.userId]          You can specify a different user ID. Otherwise the current user is assumed.
 * @param   {String}  [options.email]           The email address to remove a plan for. Required if no userId specified and not logged in. Ignored if userId is specified or if logged in.
 * @param {Function}  [callback]                Optional callback function. Required if looking up by email address in client code. Will be passed an error argument if there was an error.
 * @returns {String|undefined} The plan name
 */
AppPlans.get = Meteor.wrapAsync(function (options, callback) {
  var list = AppPlans.list(options, function (error, result) {
    callback(error, (result && result[0]) || undefined);
  });
  return (list && list[0]) || undefined;
});
