'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  config = require(path.resolve('./config/config')),
  User = mongoose.model('User'),
  fs = require('fs');


// URLs for which user can't be redirected on signin
var noReturnUrls = [
  '/authentication/signin',
  '/authentication/signup'
];

/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
 // delete req.body.roles;

  // Init user and add missing fields
  var user = new User(req.body);
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;
  user.roles  = ['admin'];

  // Then save the user
  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  });
};

/**
 * Add A New User
 */
exports.addNewUser = function (req, res) {
  // For security measurement we remove the roles from the req.body object
   // delete req.body.email;


  // Init user and add missing fields
  var user = new User(req.body);
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;
  user.roles  = ['user'];

  // Then save the user
  user.save(function (err) {
    if(err){
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

      //res.redirect('users');
      res.send('Succeed !!')

  });
};

exports.addResults = function (req, res) { console.log(req.body);

  var user = new User(req.body);

  User.findById(req.body._id, function (err, user) {
    var bucket = [];  // Create an empty array
    bucket = req.body.results; // Use created array as bucket to receive the actual value of results
    user.results = bucket;  // set the new value of results as the one of the bucket that has been updated


    user.save(function (err) {
      if (err) {
        return res.status(422).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
      console.log('SUCEED');
      console.log(user);
    })
  })
};
/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(422).send(info);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};

/**
 * OAuth provider call
 */
exports.oauthCall = function (req, res, next) {
  var strategy = req.params.strategy;
  // Authenticate
  passport.authenticate(strategy)(req, res, next);
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (req, res, next) {
  var strategy = req.params.strategy;

  // info.redirect_to contains inteded redirect path
  passport.authenticate(strategy, function (err, user, info) {
    if (err) {
      return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
    }
    if (!user) {
      return res.redirect('/authentication/signin');
    }
    req.login(user, function (err) {
      if (err) {
        return res.redirect('/authentication/signin');
      }

      return res.redirect(info.redirect_to || '/');
    });
  })(req, res, next);
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  // Setup info and user objects
  var info = {};
  var user;

  // Set redirection path on session.
  // Do not redirect to a signin or signup page
  if (noReturnUrls.indexOf(req.session.redirect_to) === -1) {
    info.redirect_to = req.session.redirect_to;
  }

  // Define a search query fields
  var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
  var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

  // Define main provider search query
  var mainProviderSearchQuery = {};
  mainProviderSearchQuery.provider = providerUserProfile.provider;
  mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

  // Define additional provider search query
  var additionalProviderSearchQuery = {};
  additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

  // Define a search query to find existing user with current provider profile
  var searchQuery = {
    $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
  };

  // Find existing user with this provider account
  User.findOne(searchQuery, function (err, existingUser) {
    if (err) {
      return done(err);
    }

    if (!req.user) {
      if (!existingUser) {
        var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

        User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
          user = new User({
            firstName: providerUserProfile.firstName,
            lastName: providerUserProfile.lastName,
            username: availableUsername,
            displayName: providerUserProfile.displayName,
            profileImageURL: providerUserProfile.profileImageURL,
            provider: providerUserProfile.provider,
            providerData: providerUserProfile.providerData
          });

          // Email intentionally added later to allow defaults (sparse settings) to be applid.
          // Handles case where no email is supplied.
          // See comment: https://github.com/meanjs/mean/pull/1495#issuecomment-246090193
          user.email = providerUserProfile.email;

          // And save the user
          user.save(function (err) {
            return done(err, user, info);
          });
        });
      } else {
        return done(err, existingUser, info);
      }
    } else {
      // User is already logged in, join the provider data to the existing user
      user = req.user;

      // Check if an existing user was found for this provider account
      if (existingUser) {
        if (user.id !== existingUser.id) {
          return done(new Error('Ce compte appartient déjà à un autre utilisateur'), user, info);
        }

        return done(new Error('Utilisateur déjà connecté avec ceci'), user, info);
      }

      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, info);
      });
    }
  });
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
  var user = req.user;
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'Utilisateur non authentifié'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};



exports.uploadResults = function (req, res) {
  //console.log(res);
  var user = new User(req.body);
  var amazonS3URI = require('amazon-s3-uri');
  var multerConfig;
  var s3,
      multer = require('multer'),
      multerS3 = require('multer-s3'),
      aws = require('aws-sdk'),
      config = require(path.resolve('./config/config'));
  var useS3Storage = config.uploads.storage === 's3' && config.aws.s3;



  if (useS3Storage) {
    multerConfig = {
      storage: multerS3({
        s3: s3,
        bucket: config.aws.s3.bucket,
        acl: 'public-read'
      })
    };
  } else {
    multerConfig = config.uploads.profile.image;
  }

  // Filtering to upload only images
  multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;

  var upload = multer(multerConfig).single('resultUrl');

   // existingImageUrl = user.profileImageURL;
    uploadImage()
        .then(updateUser)
      // .then(deleteOldImage)
      //.then(login)
        .then(function () {
          res.json(user);
        })
        .catch(function (err) {
          res.status(422).send(err);
        });


  function uploadImage() {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  function updateUser() {
    return new Promise(function (resolve, reject) {
      user.results = config.uploads.storage === 's3' && config.aws.s3 ?
          req.file.location :
      '/' + req.file.path;
      user.save(function (err, theuser) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
