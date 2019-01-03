/**
 * Created by Dell on 26-Sep-18.
 */
(function () {
    'use strict';

    angular
        .module('users.admin')
        .controller('AddNewUserController', AddNewUserController);

    AddNewUserController.$inject = ['$scope', '$state', 'UsersService', '$location', '$window', '$timeout', 'Authentication', 'PasswordValidator', 'Notification'];

    function AddNewUserController($scope, $state, UsersService, $location, $window, $timeout, Authentication, PasswordValidator, Notification) {
        var vm = this;


        vm.authentication = Authentication;
        vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
        vm.addNewUser = addNewUser;
        vm.callOauthProvider = callOauthProvider;
        vm.usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;



        // Get an eventual error defined in the URL query string:
        if ($location.search().err) {
            Notification.error({message: $location.search().err});
        }

        function addNewUser(isValid) {
            if (!isValid) {
                $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

                return false;
            }

           if(vm.credentials.phonenumber != vm.credentials.username ){
               Notification.error({
                   message: 'Les Numéros de Téléphone ne correspondent pas.',
                   title: '<i class="glyphicon glyphicon-remove"></i>' +" Erreur!",
                   delay: 6000
               });

               return false;
           }

            var firstPassword = generateFirstPassword();
            vm.credentials.password = firstPassword;
            vm.credentials.firstPassword = firstPassword;
            UsersService.adminAddNewUser(vm.credentials)
                .then(onUserAddingSuccess)
                .catch(onUserAddingError);
        }


        // OAuth provider request
        function callOauthProvider(url) {
            if ($state.previous && $state.previous.href) {
                url += '?redirect_to=' + encodeURIComponent($state.previous.href);
            }

            // Effectively call OAuth authentication route:
            $window.location.href = url;
        }

        // Authentication Callbacks

        function onUserAddingSuccess(response) {
            // If successful we assign the response to the global user model
           vm.authentication.user = response;
            Notification.success({message: '<i class="glyphicon glyphicon-ok"></i>' +" Utilisateur ajouté avec succèss!"});
            // And redirect to the previous or home page
            //$state.go($state.previous.state.name || 'home', $state.previous.params);
            //$state.go("admin.users" , $state.previous.params);
             //$location.path('/admin/users');
            $window.location.reload();
            
            $location.path('/admin/users');


        }

        function onUserAddingError(response) {
            Notification.error({
                message: response.data.message,
                title: '<i class="glyphicon glyphicon-remove"></i>' +" Erreur!",
                delay: 6000
            });
        }


        function generateFirstPassword(){
            var chars = "";
            var possibleLetters = "ABCDEFGHJKLMNPRSTUVWXYZ";
            var possibleNumbers = "123456789";
            //var books = ["matthieu", "romains"," "];

            for (var i = 0; i < 6; i++){
                chars += possibleLetters.charAt(Math.floor(Math.random() * possibleLetters.length));
                chars += possibleNumbers.charAt(Math.floor(Math.random() * possibleNumbers.length));
            }

            return chars;
        }

        generateFirstPassword();
    }
}());
