// Subscribe to the extra appPlans property in the user document
Meteor.subscribe('AppPlans_appPlans');

// Must call AppPlans.registerService on both client and server.
// The accepted options are different.
AppPlans.registerService = function (name, definition) {
  // Check the arguments for proper type/requiredness
  check(name, String);
  check(definition, {
    pay: Function
  });

  // Cache the service definition
  AppPlans._services[name] = definition;
};

// Register template helpers
Template.registerHelper('AppPlans', {
  endDate: function (planName) {
    return AppPlans.endDate(planName);
  },
  has: function (planName) {
    return AppPlans.has(planName);
  },
  hasAccess: function (planName) {
    return AppPlans.hasAccess(planName);
  },
  get: function () {
    return AppPlans.get();
  },
  list: function () {
    return AppPlans.list();
  },
  listDefined: function () {
    return AppPlans.listDefined();
  }
});