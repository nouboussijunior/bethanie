(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', '$state', 'UsersService', '$location', '$window', 'Authentication', 'PasswordValidator', 'Notification'];

  function AuthenticationController($scope, $state, UsersService, $location, $window, Authentication, PasswordValidator, Notification) {
    var vm = this;

    $scope.options = false;
    vm.errorForPhone = "";
    vm.authentication = Authentication;
    vm.getPopoverMsg = PasswordValidator.getPopoverMsg;
    vm.signup = signup;
    vm.signin = signin;
    vm.verifyAdmin = verifyAdmin;
    vm.callOauthProvider = callOauthProvider;
    vm.usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;
    var codeAdmin = "changehealth";

    // Get an eventual error defined in the URL query string:
    if ($location.search().err) {
      Notification.error({message: $location.search().err});
    }

    // If user is signed in then redirect back home
    if (vm.authentication.user) {
      $location.path('/');
    }

    function signup(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      UsersService.userSignup(vm.credentials)
          .then(onUserSignupSuccess)
          .catch(onUserSignupError);
    }

    function signin(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      UsersService.userSignin(vm.credentials)
          .then(onUserSigninSuccess)
          .catch(onUserSigninError);
    }

    function verifyAdmin(isValid) {
      if (!isValid  || isValid != vm.adminCodeVerif) {
          $scope.invalidCode = "Les deux codes ne correspondent pas!!";
          Notification.error({
            message: "Les deux codes ne correspondent pas",
            title: '<i class="glyphicon glyphicon-remove"></i>' + " Erreur d'Identification",
            delay: 6000
          });
        }
        else if (!isValid  || isValid != codeAdmin){
          $scope.invalidCode = "Veuillez entrer le Code Administrateur correct !!";
          Notification.error({
            message: "Code Invalide ou Incorrect",
            title: '<i class="glyphicon glyphicon-remove"></i>' + " Erreur d'Identification",
            delay: 6000
          });
          return false;
        }

      else {
        $state.go('authentication.signup', $state.previous.params);
      }

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

    function onUserSignupSuccess(response) {
      // If successful we assign the response to the global user model
      vm.authentication.user = response;
      Notification.success({message: '<i class="glyphicon glyphicon-ok"></i> Signup successful!'});
      // And redirect to the previous or home page
      $state.go($state.previous.state.name || 'home', $state.previous.params);
    }

    function onUserSignupError(response) {
      Notification.error({
        message: response.data.message,
        title: '<i class="glyphicon glyphicon-remove"></i> Signup Error!',
        delay: 6000
      });
    }

    function onUserSigninSuccess(response) {
      // If successful we assign the response to the global user model
      vm.authentication.user = response;
      Notification.info({message: 'Bienvenue ' + response.firstName});
      // And redirect to the previous or home page
      $state.go($state.previous.state.name || 'home', $state.previous.params);
    }

    function onUserSigninError(response) {
      vm.errorForPhone =  response.data.message;
      Notification.error({
        message: response.data.message,
        title: '<i class="glyphicon glyphicon-remove"></i> Erreur de Connexion',
        delay: 6000
      });
    }
  }
}());
