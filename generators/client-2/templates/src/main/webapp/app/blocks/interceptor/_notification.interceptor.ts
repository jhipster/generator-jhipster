NotificationInterceptor.$inject = ['$q', 'AlertService'];

export function NotificationInterceptor ($q, AlertService) {
    var service = {
        response: response
    };

    return service;

    function response (response) {
        var alertKey = response.headers('X-<%=angularAppName%>-alert');
        if (angular.isString(alertKey)) {
            AlertService.success(alertKey, { param : response.headers('X-<%=angularAppName%>-params')});
        }
        return response;
    }
}
