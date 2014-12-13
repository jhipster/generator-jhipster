'use strict';

angular.module('<%=angularAppName%>')
    .factory('Password', function ($resource) {
        return $resource('api/account/change_password', {}, {
        });
    });
