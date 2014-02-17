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
            $translate.use(languageKey);
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

 <% if (websocket == 'atmosphere') { %><%= angularAppName %>.controller('TrackerController', ['$scope',
    function ($scope) {
        // This controller uses the Atmosphere framework to keep a Websocket connection opened, and receive
        // user activities in real-time.

        $scope.activities = [];
        $scope.trackerSocket = atmosphere;
        $scope.trackerSubSocket;
        $scope.trackerTransport = 'websocket';

        $scope.trackerRequest = { url: 'websocket/tracker',
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

<% } %><%= angularAppName %>.controller('MetricsController', ['$scope', 'resolvedMetrics', 'HealthCheckService',
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

<%= angularAppName %>.controller('AuditsController', ['$scope', '$translate', '$templateCache', 'AuditsService',
    function ($scope, $translate, $templateCache, AuditsService) {
        $scope.onChangeDate = function() {
            AuditsService.findByDates($scope.fromDate.toLocaleString(), $scope.toDate.toLocaleString()).then(function(data){
                $scope.audits = data;
            });
        };

        // Date picker configuration
        $scope.today = function() {
            $scope.toDate = new Date();
        };

        $scope.previousMonth = function() {
            $scope.fromDate = new Date();
            if ($scope.fromDate.getMonth() == 0) {
                $scope.fromDate = new Date($scope.fromDate.getFullYear() - 1, 0, $scope.fromDate.getDate());
            } else {
                $scope.fromDate = new Date($scope.fromDate.getFullYear(), $scope.fromDate.getMonth() - 1, $scope.fromDate.getDate());
            }
        };

        $scope.today();
        $scope.previousMonth();
        
        AuditsService.findByDates($scope.fromDate.toLocaleString(), $scope.toDate.toLocaleString()).then(function(data){
            $scope.audits = data;
        });


        $scope.showWeeks = false;

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.format = 'longDate';

        // Overwrite the template to remove unused buttons
        $templateCache.put("template/datepicker/popup.html",
            "<ul class=\"dropdown-menu\" ng-style=\"{display: (isOpen && 'block') || 'none', top: position.top+'px', left: position.left+'px'}\">\n" +
                "	<li ng-transclude></li>\n" +
                "	<li ng-show=\"showButtonBar\" style=\"padding:10px 9px 2px\">\n" +
                "		<span class=\"btn-group\">\n" +
                "			<button type=\"button\" class=\"btn btn-sm btn-info\" ng-click=\"today()\">{{currentText}}</button>\n" +
                "			<button type=\"button\" class=\"btn btn-sm btn-danger\" ng-click=\"clear()\">{{clearText}}</button>\n" +
                "		</span>\n" +
                "		<button type=\"button\" class=\"btn btn-sm btn-success pull-right\" ng-click=\"isOpen = false\">{{closeText}}</button>\n" +
                "	</li>\n" +
                "</ul>\n" +
                "");
    }]);

