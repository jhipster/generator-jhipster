'use strict';

/* Controllers */

<%= angularAppName %>.controller('MainController', ['$scope',
    function ($scope) {
    }]);

<%= angularAppName %>.controller('LanguageController', ['$scope', '$translate',
    function ($scope, $translate) {
        $scope.changeLanguage = function (languageKey) {
            $translate.uses(languageKey);
        };
    }]);

<%= angularAppName %>.controller('MenuController', ['$rootScope', '$scope', '$location', 'Account',
    function ($rootScope, $scope, $location, Account) {
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
        $scope.$on('authenticationEvent', function () {
            $scope.init();
        });
        $scope.init();
    }]);

<%= angularAppName %>.controller('LoginController', ['$scope', '$location', 'AuthenticationSharedService',
    function ($scope, $location, AuthenticationSharedService) {
        $scope.rememberMe = true;
        $scope.login = function () {
            AuthenticationSharedService.login({
                username: $scope.username,
                password: $scope.password,
                rememberMe: $scope.rememberMe,
                success: function () {
                    $location.path('');
                }
            })
        }
    }]);

<%= angularAppName %>.controller('LogoutController', ['$location', 'AuthenticationSharedService',
    function ($location, AuthenticationSharedService) {
        AuthenticationSharedService.logout({
            success: function () {
                $location.path('');
            }
        });
    }]);

<%= angularAppName %>.controller('SettingsController', ['$scope', 'Account',
    function ($scope, Account) {
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
    }]);

<%= angularAppName %>.controller('PasswordController', ['$scope', 'Password',
    function ($scope, Password) {
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
    }]);

<%= angularAppName %>.controller('SessionsController', ['$scope', 'Sessions',
    function ($scope, Sessions) {
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
    }]);

<%= angularAppName %>.controller('MetricsController', ['$scope', 'Metrics',
    function ($scope, Metrics) {
        $scope.init = function () {
            $scope.metrics = Metrics.get();
        };
    }]);

<%= angularAppName %>.controller('LogsController', ['$scope', 'LogsService',
    function ($scope, LogsService) {
        $scope.loggers = LogsService.findAll();

        $scope.changeLevel = function (name, level) {
            LogsService.changeLevel({name: name, level: level}, function () {
                $scope.loggers = LogsService.findAll();
            });
        }
    }]);
