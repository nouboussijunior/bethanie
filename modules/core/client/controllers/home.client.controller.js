(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['$scope', '$state', 'Authentication'];

  function HomeController($scope, $state, Authentication) {
    var vm = this;

    vm.authentication = Authentication;
    //vm.connected = true;

    function checkLogin(){
      if(vm.authentication.user){
        vm.connected = false
      }
      else{
        vm.connected = true;
      }
    }

    checkLogin();

  }
}());
