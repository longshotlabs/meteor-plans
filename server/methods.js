/*
 * Make some functions accessible from the client with methods
 */

Meteor.methods({
  // This method can be called from any client
  // to add a plan for the current user
  'AppPlans/add': function (planName, options) {
    check(planName, String);
    check(options, Match.Optional(Match.OneOf(null, Object)));

    // Pick properties and force userId since
    // this is being called from untrusted code
    options = _.pick(options, 'service', 'token', 'email');
    options.userId = this.userId;

    checkEmail(options);

    return Utility.addPlan(planName, options);
  },
  // This method can be called from any client
  // to add a plan for the current user,
  // removing any other plans first.
  'AppPlans/set': function (planName, options) {
    check(planName, String);
    check(options, Match.Optional(Match.OneOf(null, Object)));

    options = options || {};

    // Pick properties and force userId since
    // this is being called from untrusted code
    options = _.pick(options, 'service', 'token', 'email');
    options.userId = this.userId;

    checkEmail(options);

    Utility.removeAllPlans(options);

    return Utility.addPlan(planName, options);
  },
  // This method can be called from any client
  // to remove a plan for the current user
  'AppPlans/remove': function (planName, options) {
    check(planName, String);
    check(options, Match.Optional(Match.OneOf(null, Object)));

    options = options || {};

    // Pick properties and force userId since
    // this is being called from untrusted code
    options = _.pick(options, 'email');
    options.userId = this.userId;

    checkEmail(options);

    return Utility.removePlan(planName, options);
  },
  // This method can be called from any client
  // to sync a plan for the current user
  'AppPlans/sync': function (planName, options) {
    check(planName, String);
    check(options, Match.Optional(Match.OneOf(null, Object)));

    // Pick properties and force userId since
    // this is being called from untrusted code
    options = _.pick(options, 'email');
    options.userId = this.userId;

    checkEmail(options);

    return Utility.syncPlan(planName, options);
  },
  // This method can be called from any client
  // to sync all plans for the current user
  'AppPlans/syncAll': function (options) {
    check(options, Match.Optional(Match.OneOf(null, Object)));

    // Pick properties and force userId since
    // this is being called from untrusted code
    options = _.pick(options, 'email');
    options.userId = this.userId;

    checkEmail(options);

    return Utility.syncAllPlans(options);
  },
  // This method can be called from any client
  // to get appPlans object for an email address
  'AppPlans/getObject': function (email) {
    var user = AppPlans.emailPlans.findOne(email);
    return user && user.appPlans;
  }
});

function checkEmail(options) {
  // If we're not logged in and we've been provided
  // an email, make sure that there isn't already a
  // registered user with that email
  if (!options.userId && options.email) {
    var user = Meteor.users.findOne({'emails.address': options.email}, {fields: {_id: 1}});
    if (user) {
      throw new Meteor.Error('Email already belongs to a registered user. If you are registered, you must log in.');
    }
  }
}
