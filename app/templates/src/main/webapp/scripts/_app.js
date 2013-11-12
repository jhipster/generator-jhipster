'use strict';

/* App Module */

var <%= baseName %>App = angular.module('<%= baseName %>App', ['ngResource', 'ngRoute']);

<%= baseName %>App
    .config(function ($routeProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginController'
            })
            .when('/settings', {
                templateUrl: 'views/settings.html',
                controller: 'SettingsController'
            })
            .when('/password', {
                templateUrl: 'views/password.html',
                controller: 'PasswordController'
            })
            .when('/sessions', {
                templateUrl: 'views/sessions.html',
                controller: 'SessionsController'
            })
            .when('/metrics', {
                templateUrl: 'views/metrics.html',
                controller: 'MetricsController'
            })
            .when('/logout', {
                templateUrl: 'views/main.html',
                controller: 'LogoutController'
            })
            .otherwise({
                templateUrl: 'views/main.html',
                controller: 'MainController'
            })

    });
