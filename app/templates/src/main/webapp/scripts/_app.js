'use strict';

/* App Module */

var <%= baseName %>App = angular.module('<%= baseName %>App', ['ngResource']);

<%= baseName %>App
    .config(function ($routeProvider) {
        $routeProvider
            .when('/login', {
                controller: 'LoginController'
            })

    });
