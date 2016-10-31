import * as angular from 'angular';

<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
AuthExpiredInterceptor.$inject = ['$rootScope', '$q', '$injector'/*, '$localStorage', '$sessionStorage'*/];

export function AuthExpiredInterceptor($rootScope, $q, $injector/*, $localStorage, $sessionStorage*/) {
    var service = {
        responseError: responseError
    };

    return service;

    function responseError(response) {
        if (response.status === 401) {
            //delete $localStorage.authenticationToken;
            //delete $sessionStorage.authenticationToken;
            var Principal = $injector.get('Principal');
            if (Principal.isAuthenticated()) {
                var Auth = $injector.get('Auth');
                Auth.authorize(true);
            }
        }
        return $q.reject(response);
    }
}
<%_ } if (authenticationType === 'session') { _%> 
AuthExpiredInterceptor.$inject = ['$rootScope', '$q', '$injector', '$document'];

export function AuthExpiredInterceptor($rootScope, $q, $injector, $document) {
    var service = {
        responseError: responseError
    };

    return service;

    function responseError(response) {
        // If we have an unauthorized request we redirect to the login page
        // Don't do this check on the account API to avoid infinite loop
        if (response.status === 401 && angular.isDefined(response.data.path) && response.data.path.indexOf('/api/account') === -1) {
            var Auth = $injector.get('Auth');
            var to = $rootScope.toState;
            var params = $rootScope.toStateParams;
            Auth.logout();
            if (to.name !== 'accessdenied') {
                Auth.storePreviousState(to.name, params);
            }
            //var LoginService = $injector.get('LoginService');
            //LoginService.open();
        }
        return $q.reject(response);
    }
}<% } %>
