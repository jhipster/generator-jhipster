 'use strict';

angular.module('<%=angularAppName%>')
    .factory('notificationInterceptor', function ($q, AlertService) {
        return {
            response: function(response) {
                var alertKey = response.headers('X-<%=angularAppName%>-alert');
                if (angular.isString(alertKey)) {
                    AlertService.success(alertKey, { param : response.headers('X-<%=angularAppName%>-params')});
                }
                return response;
            }
        };
    })
    .factory('loadingInterceptor', function ($rootScope, $q) {
        $rootScope.loading = 0;
        return {
            request: function (config) {
                $rootScope.loading++;
                return config;
            },
            response: function (response) {
                $rootScope.loading--;
                return response;
            },
            responseError: function (response) {
                $rootScope.loading--;
                if (!(response.status == 401 && response.data.path.indexOf("/api/account") == 0 )) {
                    $rootScope.$emit('<%=angularAppName%>.httpError', response);
                }
                return $q.reject(response);
            }
        };
    });
