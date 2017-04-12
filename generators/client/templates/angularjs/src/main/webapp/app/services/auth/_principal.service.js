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
        .factory('Principal', Principal);

    Principal.$inject = ['$q', 'Account'<% if (websocket == 'spring-websocket') { %>, '<%=jhiPrefixCapitalized%>TrackerService'<% } %>];

    function Principal ($q, Account<% if (websocket == 'spring-websocket') { %>, <%=jhiPrefixCapitalized%>TrackerService<% } %>) {
        var _identity,
            _authenticated = false;

        var service = {
            authenticate: authenticate,
            hasAnyAuthority: hasAnyAuthority,
            hasAuthority: hasAuthority,
            identity: identity,
            isAuthenticated: isAuthenticated,
            isIdentityResolved: isIdentityResolved
        };

        return service;

        function authenticate (identity) {
            _identity = identity;
            _authenticated = identity !== null;
        }

        function hasAnyAuthority (authorities) {
            if (!_authenticated || !_identity || !_identity.authorities) {
                return false;
            }

            for (var i = 0; i < authorities.length; i++) {
                if (_identity.authorities.indexOf(authorities[i]) !== -1) {
                    return true;
                }
            }

            return false;
        }

        function hasAuthority (authority) {
            if (!_authenticated) {
                return $q.when(false);
            }

            return this.identity().then(function(_id) {
                return _id.authorities && _id.authorities.indexOf(authority) !== -1;
            }, function(){
                return false;
            });
        }

        function identity (force) {
            var deferred = $q.defer();

            if (force === true) {
                _identity = undefined;
            }

            // check and see if we have retrieved the identity data from the server.
            // if we have, reuse it by immediately resolving
            if (angular.isDefined(_identity)) {
                deferred.resolve(_identity);

                return deferred.promise;
            }

            // retrieve the identity data from the server, update the identity object, and then resolve.
            Account.get().$promise
                .then(getAccountThen)
                .catch(getAccountCatch);

            return deferred.promise;

            function getAccountThen (account) {
                _identity = account.data;
                _authenticated = true;
                deferred.resolve(_identity);<% if (websocket == 'spring-websocket') { %>
                <%=jhiPrefixCapitalized%>TrackerService.connect();<% } %>
            }

            function getAccountCatch () {
                _identity = null;
                _authenticated = false;
                deferred.resolve(_identity);
            }
        }

        function isAuthenticated () {
            return _authenticated;
        }

        function isIdentityResolved () {
            return angular.isDefined(_identity);
        }
    }
})();
