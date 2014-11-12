'use strict';

angular.module('<%=angularAppName%>')
    .factory('Password', function ($resource) {
        return $resource('app/rest/account/change_password', {}, {
        });
    });
