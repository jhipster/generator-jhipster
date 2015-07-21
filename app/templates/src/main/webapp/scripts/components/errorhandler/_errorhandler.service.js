(function () {
  'use strict';

  angular.module('<%=angularAppName%>')
    .factory('errorHandlerInterceptor', ['$q', '$rootScope', function ($q, $rootScope) {
        return {
            'responseError': function (response) {
                $rootScope.$emit('httpError', response);
                return $q.reject(response);
            }
        };
    }]);
})();
