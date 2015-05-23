AppPlans = {};
AppPlans._services = {};
AppPlans._plans = {};

/**
 * A collection where we store plan data keyed by email until someone registers and creates a user account.
 *
 * @name AppPlans.emailPlans
 * @type Mongo.Collection
 * @public
 */
AppPlans.emailPlans = new Mongo.Collection('AppPlans_emailPlans');

/**
 * Defines a plan that can then be applied to a user.
 *
 * @method AppPlans.define
 * @public
 * @param {String}   name                             The plan name. Must be unique among plans.
 * @param {Object}   definition                       The definition of the plan
 * @param {Object[]} [definition.services]            List of outside service plans associated with this plan.
 * @param {String}   definition.services.name         The service name. Must have been defined by a call to `AppPlans.registerService`, which might have been done by another package.
 * @param {String}   definition.services.planName     The plan name/ID as defined on the outside service (e.g., in Stripe)
 * @param {Object}   [definition.services.payOptions] The options that will be sent to the `pay` function defined by this service. For example, for Stripe this is the Stripe Checkout popup options. This may be optional depending on which service. This isn't used on the server, but it will be ignored on the server, meaning that you can define your plan in common code if you want.
 * @param {String[]} [definition.includedPlans]         An array of plan names. These other plans will be added/removed for a user along with this plan. Useful for plans that build on the features of other plans.
 */
AppPlans.define = function (name, definition) {
  definition = _.extend({
    services: [],
    includedPlans: []
  }, definition);

  // Check the arguments for proper type/requiredness
  check(name, String);
  check(definition, {
    // If `services` is missing, this plan is not linked with an
    // external payment service, i.e., is free or tracked some other way.
    services: Match.Optional([{
      name: String,
      planName: String,
      payOptions: Match.Optional(Object)
    }]),
    includedPlans: Match.Optional([String])
  });

  // Cache the plan definition
  AppPlans._plans[name] = definition;
};

/**
 * Lists all defined plans.
 *
 * @method  AppPlans.listDefined
 * @public
 * @returns {String[]} Array of plan names
 */
AppPlans.listDefined = function () {
  return _.keys(AppPlans._plans);
};

// TODO emit added and removed events for analytics
