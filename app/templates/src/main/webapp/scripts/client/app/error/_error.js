'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/error', {
                templateUrl: 'scripts/client/app/error/error.html'
            })
    });
