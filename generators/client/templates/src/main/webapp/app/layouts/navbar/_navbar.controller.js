(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('NavbarController', NavbarController);

    NavbarController.$inject = ['$location', '$state', 'Auth', 'Principal', 'ENV', 'LoginService'];

    function NavbarController ($location, $state, Auth, Principal, ENV, LoginService) {
        var vm = this;

        vm.navCollapsed = true;
        vm.isAuthenticated = Principal.isAuthenticated;
        vm.inProduction = ENV === 'prod';
        vm.login = login;
        vm.logout = logout;
        vm.$state = $state;

        function login () {
            LoginService.open();
        }

        function logout () {
            Auth.logout();
            $state.go('home');
        }
    }
})();
