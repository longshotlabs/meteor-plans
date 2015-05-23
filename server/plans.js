// Publish the extra appPlans property in the user document
Meteor.publish('AppPlans_appPlans', function () {
  return Meteor.users.find(this.userId, {fields: {appPlans: 1}});
});

// Must call AppPlans.registerService on both client and server.
// The accepted options are different.

/**
 * Must call AppPlans.registerService on both client and server.
 * The accepted options are different.
 *
 * @method AppPlans.registerService
 * @public
 * @param {String}   name                                Service name
 * @param {Object}   [definition]                        Tells this package how to query the service API
 * @param {Function} [definition.subscribe]
 * @param {Function} [definition.unsubscribe]
 * @param {Function} [definition.isSubscribed]
 * @param {Function} [definition.getExternalPlansStatus]
 */
AppPlans.registerService = function registerService(name, definition) {
  // Check the arguments for proper type/requiredness
  check(name, String);
  check(definition, {
    subscribe: Function,
    unsubscribe: Function,
    isSubscribed: Function,
    getExternalPlansStatus: Function
  });

  // Cache the service definition
  AppPlans._services[name] = definition;
};

/**
 * Returns the `appPlans` object for an email, deleting
 * that email from the collection. Use this for moving
 * `appPlans` to a user document.
 *
 * @method AppPlans.pullFromEmail
 * @public
 * @param {String} email Email address
 */
AppPlans.pullFromEmail = function pullFromEmail(email) {
  var user = AppPlans.emailPlans.findOne(email);
  if (!user) {
    return;
  }

  AppPlans.emailPlans.remove({_id: email});

  return user.appPlans;
};
