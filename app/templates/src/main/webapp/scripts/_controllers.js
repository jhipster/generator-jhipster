'use strict';

/* Controllers */

<%= baseName %>App.controller('AccountController', function AccountController($scope, Account) {
    $scope.getAccount = function () {
        $scope.account = Account.get({}, function () {
            // success
        }, function (response) {
            if (response.status === 401) {
                console.log("Access denied, you need to login!")
            }
        });
    };
});

<%= baseName %>App.controller('LoginController', function LoginController($scope) {
    $scope.login = function () {
        var data = "j_username=" + $scope.username + "&j_password=" + $scope.password + "&submit=Login";
        $http.post('/authentication', data, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        }).
            success(function (data, status, headers, config) {
                console.info("You're now logged in, welcome " + $scope.username);
                
            }).
            error(function (data, status, headers, config) {
                console.warn('This is a wrong username or/and a wrong password. Try again');
                
            });
    };

    $scope.logout = function () {
        $http.get('/logout')
            .success(function (data, status, headers, config) {
                console.info('Logged out');
                
            });
    };
});

