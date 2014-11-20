'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/error', {
                templateUrl: 'app/error/error.html'
            })
    });
