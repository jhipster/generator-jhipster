'use strict';

angular.module('<%=angularAppName%>')
    .factory('Register', function ($resource) {
        return $resource('api/register', {}, {
        });
    });


