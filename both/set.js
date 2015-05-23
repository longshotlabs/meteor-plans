/**
 * Sets a user's plan. Linked plans will also be added. Any existing plans are removed and unsubscribed from through the outside service, if applicable
 *
 * @method AppPlans.set
 * @public
 * @param {String}   planName                The plan name, as defined by `AppPlans.define`
 * @param {Object}   [options]               Options. This argument can be omitted.
 * @param {String}   [options.service]       Which service to pay/subscribe with. Omit if this plan has no outside services linked or if you want to use the first service listed.
 * @param {Object}   [options.token]         Pass a token object if on the server or if you've already obtained one on the client. Required if on the server and you've specified a service. On the client, payment flow will automatically begin to obtain the token.
 * @param {Object}   [options.payOptions]    Options for the client-side payment interface. Otherwise defaults from `AppPlans.define` are used.
 * @param {String}   [options.userId]        On the server, you can specify a different user ID. Otherwise the current user is assumed.
 * @param {String}   [options.email]         The email address to set plans for. Required if no userId specified and not logged in. Ignored if userId is specified or if logged in.
 * @param {String}   [options.skipSubscribe] On the server, you can set this to `true` to add the plan to the user without subscribing through the outside service first.
 * @param {Function} [callback]              Optional callback function. Will be passed an error argument if there was an error.
 */
AppPlans.set = function (planName, options, callback) {
  // options argument can be omitted. If so, make some adjustments.
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};

  options.removeAllFirst = true;

  return AppPlans.add(planName, options, callback);
};
