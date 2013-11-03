'use strict';

/* Controllers */

<%= baseName %>App.controller('MainController', function MainController($scope) {

});

<%= baseName %>App.controller('MenuController', function MenuController($rootScope, $scope, Account, AuthenticationSharedService) {
    $scope.init = function () {
        $rootScope.account = Account.get({}, function () {
            $rootScope.authenticated = true;
        }, function (response) {
            if (response.status === 401) {
                $rootScope.authenticated = false;
            }
        });
    };
    $scope.$on('authenticationEvent', function() {
        $scope.init();
    });
    $scope.init();
});

<%= baseName %>App.controller('LoginController', function LoginController($scope, $http, $location, AuthenticationSharedService) {
    $scope.login = function () {
        var data =
            "j_username=" + $scope.username +
            "&j_password=" + $scope.password +
            "&_spring_security_remember_me=" + $scope.rememberMe +
                "&submit=Login";

        $http.post('/app/authentication', data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).
            success(function (data, status, headers, config) {
                AuthenticationSharedService.prepForBroadcast("login");
                $location.path('');
            }).
            error(function (data, status, headers, config) {
                $scope.authenticationError = true;
            });
    };
});

<%= baseName %>App.controller('LogoutController', function LoginController($scope, $http, $location, AuthenticationSharedService) {
    $http.get('/app/logout')
        .success(function (data, status, headers, config) {
            AuthenticationSharedService.prepForBroadcast("logout");
            $location.path('');
        });
});
