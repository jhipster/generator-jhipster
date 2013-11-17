'use strict';

/* Controllers */

<%= angularAppName %>.controller('MainController', function MainController($scope) {

});

<%= angularAppName %>.controller('MenuController', function MenuController($rootScope, $scope, $location, Account, AuthenticationSharedService) {
    $scope.init = function () {
        $rootScope.account = Account.get({}, function () {
            $rootScope.authenticated = true;
        }, function (response) {
            if (response.status === 401) {
                $rootScope.authenticated = false;
                $location.path('');
            }
        });
    };
    $scope.$on('authenticationEvent', function() {
        $scope.init();
    });
    $scope.init();
});

<%= angularAppName %>.controller('LoginController', function LoginController($scope, $location, AuthenticationSharedService) {
    $scope.rememberMe = true;
    $scope.login = function () {
        AuthenticationSharedService.login({
            username: $scope.username,
            password: $scope.password,
            rememberMe: $scope.rememberMe,
            success:function () {
                $location.path('');
            }
        })
    };
});

<%= angularAppName %>.controller('SettingsController', function SettingsController($scope, Account) {
    $scope.success = null;
    $scope.error = null;
    $scope.init = function () {
        $scope.settingsAccount = Account.get();
    };
    $scope.save = function () {
        Account.save($scope.settingsAccount,
            function (value, responseHeaders) {
                $scope.error = null;
                $scope.success = 'OK';
                $scope.init();
            },
            function (httpResponse) {
                $scope.success = null;
                $scope.error = "ERROR";
            });
    };
});

<%= angularAppName %>.controller('PasswordController', function PasswordController($scope, Password) {
    $scope.success = null;
    $scope.error = null;
    $scope.doNotMatch = null;
    $scope.changePassword = function () {
        if ($scope.password != $scope.confirmPassword) {
            $scope.doNotMatch = "ERROR";
        } else {
            $scope.doNotMatch = null;
            Password.save($scope.password,
                function (value, responseHeaders) {
                    $scope.error = null;
                    $scope.success = 'OK';
                },
                function (httpResponse) {
                    $scope.success = null;
                    $scope.error = "ERROR";
                });
        }
    };
});

<%= angularAppName %>.controller('SessionsController', function SessionsController($scope, Sessions) {
    $scope.success = null;
    $scope.error = null;
    $scope.sessions = Sessions.get();
    $scope.invalidate = function (series) {
        Sessions.delete({series: encodeURIComponent(series)},
            function (value, responseHeaders) {
                $scope.error = null;
                $scope.success = "OK";
                $scope.sessions = Sessions.get();
            },
            function (httpResponse) {
                $scope.success = null;
                $scope.error = "ERROR";
            });
    };
});

<%= angularAppName %>.controller('MetricsController', function MetricsController($scope, $timeout, Metrics) {
    $scope.init = function () {
        $scope.metrics = Metrics.get();
    };
});

<%= angularAppName %>.controller('LogoutController', function LogoutController($scope, $http, $location, AuthenticationSharedService) {
    $http.get('/app/logout')
        .success(function (data, status, headers, config) {
            AuthenticationSharedService.prepForBroadcast("logout");
            $location.path('');
        }).
        error(function (data, status, headers, config) {
            $location.path('');
        });
});

<%= angularAppName %>.controller('LogsController', function LogsController($scope, LogsService) {
    $scope.findAll = function () {
        LogsService.findAll().
            success(function (loggers) {
                $scope.loggers = loggers;
            })
            .error(function (resp) {
                console.log("Error with LogsService.findAll" + resp);
            });
    }

    $scope.changeLevel = function(loggerName, newLevel) {
        LogsService.changeLevel(loggerName, newLevel).
            success(function(loggers) {
                console.log("Success changing Level for " + loggerName + " to " + newLevel);
                $scope.findAll();
            }).
            error(function(resp) {
                console.log("Error with LogsService.changeLevel : " + resp)
            });
    }

    $scope.findAll();
});
