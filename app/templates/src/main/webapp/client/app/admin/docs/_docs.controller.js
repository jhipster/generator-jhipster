'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($routeProvider) {
        $routeProvider
            .when('/docs', {
                templateUrl: 'client/app/admin/docs/docs.html',
                authenticate: true,
                roles: 'ROLE_ADMIN'
            })
    });
