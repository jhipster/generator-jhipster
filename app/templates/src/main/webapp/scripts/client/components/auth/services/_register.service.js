'use strict';

angular.module('<%=angularAppName%>')
    .factory('Register', function ($resource) {
        return $resource('app/rest/register', {}, {
        });
    });


