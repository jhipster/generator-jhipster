'use strict';

/* Controllers */

<%= baseName %>App.controller('AccountController', function AccountController($scope, Account) {
    $scope.account = Account.get({}, function () {
        $scope.autenticated = true;
    }, function (response) {
        if (response.status === 401) {
            $scope.autenticated = false;
        }
    });
});

<%= baseName %>App.controller('MenuController', function MenuController($scope, Account) {
    $scope.account = Account.get({}, function () {
        $scope.autenticated = true;
    }, function (response) {
        if (response.status === 401) {
            $scope.autenticated = false;
        }
    });
});

<%= baseName %>App.controller('LoginController', function LoginController($scope, $http, $location) {
    $scope.login = function () {
        var data = "j_username=" + $scope.username + "&j_password=" + $scope.password + "&submit=Login";
        $http.post('/app/authentication', data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).
            success(function (data, status, headers, config) {
                $location.path('');
            }).
            error(function (data, status, headers, config) {
                $scope.authenticationError = true;
            });
    };
});

<%= baseName %>App.controller('LogoutController', function LoginController($scope, $http, $location) {
    $http.get('/app/logout')
        .success(function (data, status, headers, config) {
            console.info('Logged out');
            $location.path('');
        });
});

