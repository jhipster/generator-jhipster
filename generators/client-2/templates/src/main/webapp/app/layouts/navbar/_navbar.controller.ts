NavbarController.$inject = ['$state', 'Auth', 'Principal', 'ProfileService', 'LoginService'];

export function NavbarController ($state, Auth, Principal, ProfileService, LoginService) {
    var vm = this;

    vm.isNavbarCollapsed = true;
    vm.isAuthenticated = Principal.isAuthenticated;

    ProfileService.getProfileInfo().subscribe(profileInfo => {
        vm.inProduction = profileInfo.inProduction;
        vm.swaggerDisabled = profileInfo.swaggerDisabled;
    });

    vm.login = login;
    vm.logout = logout;
    vm.toggleNavbar = toggleNavbar;
    vm.collapseNavbar = collapseNavbar;
    vm.$state = $state;

    function login() {
        collapseNavbar();
        LoginService.open();
    }

    function logout() {
        collapseNavbar();
        Auth.logout();
        $state.go('home');
    }

    function toggleNavbar() {
        vm.isNavbarCollapsed = !vm.isNavbarCollapsed;
    }

    function collapseNavbar() {
        vm.isNavbarCollapsed = true;
    }
}
