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
    });
