'use strict';

/* Controllers */

<%= angularAppName %>.controller('MainController', ['$scope',
    function ($scope) {
    }]);

<%= angularAppName %>.controller('AdminController', ['$scope',
    function ($scope) {
    }]);

<%= angularAppName %>.controller('LanguageController', ['$scope', '$translate',
    function ($scope, $translate) {
        $scope.changeLanguage = function (languageKey) {
            $translate.uses(languageKey);
        };
    }]);

<%= angularAppName %>.controller('MenuController', ['$scope',
    function ($scope) {
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

<%= angularAppName %>.controller('SettingsController', ['$scope', 'resolvedAccount', 'Account',
    function ($scope, resolvedAccount, Account) {
        $scope.success = null;
        $scope.error = null;
        $scope.settingsAccount = resolvedAccount;

        $scope.save = function () {
            Account.save($scope.settingsAccount,
                function (value, responseHeaders) {
                    $scope.error = null;
                    $scope.success = 'OK';
                    $scope.settingsAccount = Account.get();
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

<%= angularAppName %>.controller('SessionsController', ['$scope', 'resolvedSessions', 'Sessions',
    function ($scope, resolvedSessions, Sessions) {
        $scope.success = null;
        $scope.error = null;
        $scope.sessions = resolvedSessions;
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

<%= angularAppName %>.controller('TrackerController', ['$scope',
    function ($scope) {
        // This controller uses the Atmosphere framework to keep a Websocket connection opened, and receive
        // user activities in real-time.

        $scope.activities = [];
        $scope.trackerSocket = atmosphere;
        $scope.trackerSubSocket;
        $scope.trackerTransport = 'websocket';

        $scope.trackerRequest = { url: '/websocket/tracker',
            contentType : "application/json",
            transport : $scope.trackerTransport ,
            trackMessageLength : true,
            reconnectInterval : 5000,
            enableXDR: true,
            timeout : 60000 };

        $scope.trackerRequest.onOpen = function(response) {
            $scope.trackerTransport = response.transport;
            $scope.trackerRequest.uuid = response.request.uuid;
        };

        $scope.trackerRequest.onMessage = function (response) {
            var message = response.responseBody;
            var activity = atmosphere.util.parseJSON(message);
            var existingActivity = false;
            for (var index = 0; index < $scope.activities.length; index++) {
                if($scope.activities[index].sessionId == activity.sessionId) {
                    existingActivity = true;
                    if (activity.page == "logout") {
                        $scope.activities.splice(index, 1);
                    } else {
                        $scope.activities[index] = activity;
                    }
                }
            }
            if (!existingActivity) {
                $scope.activities.push(activity);
            }
            $scope.$apply();
        };

        $scope.trackerSubSocket = $scope.trackerSocket.subscribe($scope.trackerRequest);
    }]);

<%= angularAppName %>.controller('MetricsController', ['$scope', 'resolvedMetrics', 'HealthCheckService',
    function ($scope, resolvedMetrics, HealthCheckService) {
        $scope.metrics = resolvedMetrics;
        HealthCheckService.check();


        resolvedMetrics.$get({}, function(items) {
            $scope.servicesStats = {};
            $scope.cachesStats = {};
            angular.forEach(items.timers, function(value, key) {
                if (key.indexOf("web.rest") != -1) {
                    $scope.servicesStats[key] = value;
                }

                if (key.indexOf("net.sf.ehcache.Cache") != -1) {
                    // remove gets or puts
                    var index = key.lastIndexOf(".");
                    var newKey = key.substr(0, index);

                    // Keep the name of the domain
                    index = newKey.lastIndexOf(".");
                    $scope.cachesStats[newKey] = {
                        'name': newKey.substr(index + 1),
                        'value': value
                    };
                }
            });
        });
    }]);

<%= angularAppName %>.controller('LogsController', ['$scope', 'resolvedLogs', 'LogsService',
    function ($scope, resolvedLogs, LogsService) {
        $scope.loggers = resolvedLogs;

        $scope.changeLevel = function (name, level) {
            LogsService.changeLevel({name: name, level: level}, function () {
                $scope.loggers = LogsService.findAll();
            });
        }
    }]);
