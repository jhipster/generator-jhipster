'use strict';

/* App Module */

var <%= baseName %>App = angular.module('<%= baseName %>App', ['ngResource']);

<%= baseName %>App
    .config(function ($routeProvider) {
        $routeProvider
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginController'
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
