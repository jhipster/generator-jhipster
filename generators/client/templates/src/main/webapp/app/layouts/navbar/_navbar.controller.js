(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('NavbarController', NavbarController);

    NavbarController.$inject = ['$state', 'Auth', 'Principal', 'ActiveProfiles', 'LoginService'];

    function NavbarController ($state, Auth, Principal, ActiveProfiles, LoginService) {
        var vm = this;

        vm.isNavbarCollapsed = true;
        vm.isAuthenticated = Principal.isAuthenticated;
        
        ActiveProfiles.fetch().then(function(response) {
                vm.inProduction = response.inProduction;
        })


        vm.login = login;
        vm.logout = logout;
        vm.toggleNavbar = toggleNavbar;
        vm.collapseNavbar = collapseNavbar;
        vm.$state = $state;

        function login () {
            collapseNavbar();
            LoginService.open();
        }

        function logout () {
            collapseNavbar();
            Auth.logout();
            $state.go('home');
        }

        function toggleNavbar () {
            vm.isNavbarCollapsed = !vm.isNavbarCollapsed;
        }

        function collapseNavbar () {
            vm.isNavbarCollapsed = true;
        }
    }
})();
