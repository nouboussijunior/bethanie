/**
 * Created by Dell on 30-Oct-18.
 */

(function () {
    'use strict';

    angular
        .module('users')
        .controller('ResultsController', ResultsController);

    ResultsController.$inject = ['$scope', '$location','Authentication',  'Notification', 'UsersService'];

    function ResultsController($scope, $location, Authentication,  Notification, UsersService) {
        var vm = this;




        vm.authentication = Authentication ;
        vm.displayResult = displayResult;
        vm.showButton = true;
        //console.log(vm.authentication.user);

        //Send User back to Connection if he is not logged in
        if (vm.authentication.user) {
            $location.path('/see-your-results');
            UsersService.getCurrentUser(vm.authentication)
                .then(onUserGettingSuccess)
                .catch(onUserGettingError);
        } else{
            $location.path('/authentication/signin');
        }


        function onUserGettingSuccess(message) { console.log(message.results);
            console.log(message);
            vm.user = message;

            vm.user.results = message.results.reverse();





        }
        //console.log(user);

        function onUserGettingError(response){
            Notification.error({
                message: response.message,
                title: '<i class="glyphicon glyphicon-remove"></i>' + " Erreur!",
                delay: 6000
            });
        }


        function displayResult(){
            //(".results").submit();
        }

    }
}());
