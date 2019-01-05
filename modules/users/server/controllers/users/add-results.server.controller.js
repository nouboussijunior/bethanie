'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    mongoose = require('mongoose'),
    multer = require('multer'),
    multerS3 = require('multer-s3'),
    aws = require('aws-sdk'),
    config = require(path.resolve('./config/config')),
    User = mongoose.model('User'),
    validator = require('validator'),
    bodyParser = require('body-parser');


//console.log(User.findById(theId, 'firstName age', function (err, user) {}));
//var AddResultsController = require('.modules/users/client/controllers/admin/add-results.client.controller');



exports.addTheResults = function(req, res) {  //console.log(req.headers.referer);
        var user =  new User(req.body);
        var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './public/results/');
        },
        filename: function (req, file, cb) {

            //var datetimestamp = Date.now();
            var fileName = file.originalname;

            cb(null, fileName);



        }
    });

    var upload = multer({ //multer settings
        storage: storage
    }).single('file');

    upload(req,res,function(err){
        if(err){ console.log(err);
            res.json({error_code:1,err_desc:err});
            return;
        }
        res.json({error_code:0,err_desc:null});
    });


};
