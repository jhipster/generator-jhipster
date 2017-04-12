<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('authExpiredInterceptor', authExpiredInterceptor);

    <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    authExpiredInterceptor.$inject = ['$rootScope', '$q', '$injector', '$localStorage', '$sessionStorage'];

    function authExpiredInterceptor($rootScope, $q, $injector, $localStorage, $sessionStorage) {
        var service = {
            responseError: responseError
        };

        return service;

        function responseError(response) {
            if (response.status === 401) {
                delete $localStorage.authenticationToken;
                delete $sessionStorage.authenticationToken;
                var Principal = $injector.get('Principal');
                if (Principal.isAuthenticated()) {
                    var Auth = $injector.get('Auth');
                    Auth.authorize(true);
                }
            }
            return $q.reject(response);
        }
    }
    <%_ } _%>
    <%_ if (authenticationType === 'session') { _%>
    authExpiredInterceptor.$inject = ['$rootScope', '$q', '$injector'];

    function authExpiredInterceptor($rootScope, $q, $injector) {
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
                var LoginService = $injector.get('LoginService');
                LoginService.open();
            }
            return $q.reject(response);
        }
    }
    <%_ } _%>
})();
