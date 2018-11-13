'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');
  var results = require('../controllers/users/add-results.server.controller');

  // Setting up the users profile api
  app.route('/api/users/me').get(users.me);
  app.route('/api/users').put(users.update);
  app.route('/api/users/accounts').delete(users.removeOAuthProvider);
  app.route('/api/users/password').post(users.changePassword);
  app.route('/api/users/picture').post(users.changeProfilePicture);
 // app.route('/api/users/results').post(results.addResults);
  app.route('/api/users/fileupload').post(users.addTheResults);
  app.route('/api/auth/getCurrentUser').get(users.me);



  // Finish by binding the user middleware
  app.param('userId', users.userByID);
};
