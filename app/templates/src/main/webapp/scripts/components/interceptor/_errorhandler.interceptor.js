'use strict';

angular.module('<%=angularAppName%>')
    .factory('errorHandlerInterceptor', function ($q, $rootScope) {
        return {
            'responseError': function (response) {
                $rootScope.$emit('httpError', response);
                return $q.reject(response);
            }
        };
    });