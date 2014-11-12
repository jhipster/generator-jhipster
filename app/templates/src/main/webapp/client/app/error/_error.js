'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/error', {
                templateUrl: 'client/app/error/error.html'
            })
    });
