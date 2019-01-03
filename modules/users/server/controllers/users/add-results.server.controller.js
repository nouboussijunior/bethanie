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
    randomstring = require("randomstring"),
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
            cb(null, './modules/users/client/img/results/');
        },
        filename: function (req, file, cb) {

            //var datetimestamp = Date.now();
            var fileName = file.originalname;

            cb(null, fileName);

           // http://localhost:8080/admin/users/5bc224e9af119702c8e11483/addResults

           /* var regex1 = "http://localhost:8080/admin/users/";
            var regex2 = "/addResults";
            var chaine= req.headers.referer;
            chaine = chaine.replace(regex1,'');
            var finalChain = chaine.replace(regex2,'');

            console.log(finalChain);

            User.findOne({_id: finalChain}, function(err, foundUser) {
                if(!err) {
                    if(!user) {
                        return res.status(422).send({
                            message: errorHandler.getErrorMessage(err)
                        });
                    }

                    user = new User(foundUser);
                    console.log(fileName);
                    console.log(user.salt);
                    //console.log(foundUser.salt);

                    //user.password = undefined;
                    //user.salt = undefined;
                    //console.log(foundUser.password);

                    //user.provider = 'local';

                    user.results = './modules/users/results/' + fileName;
                    user.salt = foundUser.salt ;
                    //user.salt = foundUser.salt;
                    //delete user.password;


                    const doc = {
                        results : './modules/users/results/' + fileName
                        /*quote: req.body.quote,
                        source: req.body.source,
                        rating: req.body.rating,
                        updatedAt: Date.now(), */
                    /*};
                    user.update({_id: finalChain}, doc, function(err, raw) {
                        if (err) {
                            console.log(err);
                            res.send(err);
                        }

                        user.save(function(err) {
                            if(err) throw err;
                        });
                        console.log(user);
                        cb(null, fileName);
                    });
               // });
                    console.log(user);



                   /* user.save(function(err) {
                        if (err) { console.log(err);
                            return res.status(422).send({
                                message: errorHandler.getErrorMessage(err)
                            });
                        }
                            cb(null, fileName);
                            console.log("SUCCEED");
                        console.log(user);

                            //res.json({error_code:0,err_desc:null})

                        });

                }
            });*/



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





/**
 * Update Results
 */
/*exports.addTheResult = function (req, res) {

    var user =  new User(req.body),
        formidable = require('formidable'),
        fs = require('fs');

    //console.log();
/*
    function saveUser(theResultUrl) {

        user.results = theResultUrl;
        user.lastName = "New Last MONOUY5e Yeah";

        user.$__save(function (err) { alert("heyy")
            if (err) {
                return res.status(422).send({
                    message: errorHandler.getErrorMessage(err)
                });
            }

            res.json(user);

        });
        console.log(user);
    }




    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldPath = files.filetoupload.path;
        var newPath = './modules/users/results/' + randomstring.generate(30) + files.filetoupload.name;
        if (err) throw err;
        var is = fs.createReadStream(oldPath);
        var os = fs.createWriteStream(newPath);

        is.pipe(os);
        is.on('end', function () {
            fs.unlinkSync(oldPath);
        });
        saveUser(newPath);
        res.redirect("back");


    });
*/





   /* function uploadImage() {
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

    uploadImage()
        .then(updateUser)
        .then(function () {
            res.json(user);
        })
        .catch(function (err) {
            res.status(422).send(err);
        });


};
*/