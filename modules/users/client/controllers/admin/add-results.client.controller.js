/**
 * Created by Dell on 05-Oct-18.
 */

(function () {
    'use strict';

    angular
        .module('users.admin')
        .controller('AddResultsController', AddResultsController);

    AddResultsController.$inject = ['$uibModal', '$window','userResolve', 'Upload', 'Notification', 'UsersService'];

    function AddResultsController($uibModal, $window, user, Upload, Notification, UsersService) {
        var vm = this;

        vm.user = user;
        vm.progress = 0;
        vm.removeResult = removeResult;


        //var vm = this;
        vm.submit = function() { //function to call on form submit
            if (vm.upload_form.file.$valid && vm.file) { //check if from is valid
                vm.upload(vm.file); //call upload function
            }
        };


        function generateFileName(initialFile) {
            var initialFileName, fileExtension;
            var fileName = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 30; i++)
                fileName += possible.charAt(Math.floor(Math.random() * possible.length));

            initialFileName = initialFile ;
            fileExtension = initialFileName.replace(/^.*\./, '');

            return fileName+"."+fileExtension;
        }


        vm.upload = function (file) { //console.log(file);
            var newFileName = generateFileName(file.name);
            file = Upload.rename(file, newFileName);


            Upload.upload({
                url: '/api/users/fileupload',      //webAPI exposed to upload the file
                data: {file: file}  //pass file as data, should be user ng-model
                // userData:{user:vm.user} //pass file as data, should be user ng-model


            }).then(function (resp) { //upload function returns a promise
                if (resp.data.error_code === 0) { //validate success
                    console.log(resp);
                    Notification.success({message: '<i class="glyphicon glyphicon-ok"></i> Résultat ' + ' ajouté avec succès.'});
                    //setTimeout(function(){ $window.location.reload()}, 2000);
                } else {
                    Notification.error({
                        message: resp.message,
                        title: '<i class="glyphicon glyphicon-remove"></i> Erreur!!'
                    });
                }
            }, function (resp) { //catch error
                console.log('Error status: ' + resp.message);
                Notification.error({
                    message: resp.message,
                    title: '<i class="glyphicon glyphicon-remove"></i> Erreur!!'
                });
                // $window.alert('Error status: ' + resp.status);
            }, function (evt) {
                console.log(evt);
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                //console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                vm.progress =  progressPercentage ; // capture upload progress
            });


            var finalResult = "/results/" + newFileName;
            var bucket = [];
            bucket = vm.user.results; // Use created array as bucket to receive the actual value of results
            bucket.push(finalResult); // push the incomming result into the bucket in question
            vm.user.results = bucket;  // set the new value of results as the bucket into which the incomming result has been pushed
            console.log(bucket);

            saveUser(vm.user);

        };


        function removeResult(result){
            if ($window.confirm(' Etes-vous sûr de vouloir supprimer ce résultat?')) {
                var bucket = vm.user.results; // Use created array as bucket to receive the actual value of results
                var index = bucket.indexOf(result); var nUser = user;
                if (index > -1) {
                    bucket.splice(index, 1);
                }
                console.log(bucket);
                nUser.results = bucket;  // set the new value of results as the bucket into which the incomming result has been pushed
                saveUser(nUser)
            }
        }


        function saveUser(){
            UsersService.saveResultUrl(user)
                .catch(onResultSavingError);


            function onResultSavingError(response){
                Notification.error({
                    message: response.message,
                    title: '<i class="glyphicon glyphicon-remove"></i>' + " Erreur! Veuillez réessayer",
                    delay: 6000
                });
            }
        }


        var provisoryStuff = vm.user.results;
        vm.theResults = provisoryStuff;

    }
}());
