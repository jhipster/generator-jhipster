'use strict';

angular.module('<%=angularAppName%>')
    .factory('Principal', function Principal($q, Account<% if (websocket == 'spring-websocket') { %>, Tracker<% } %>) {
        var _identity,
            _authenticated = false;

        return {
            isIdentityResolved: function () {
                return angular.isDefined(_identity);
            },
            isAuthenticated: function () {
                return _authenticated;
            },
            isInRole: function (role) {
                if (!_authenticated || !_identity.roles) {
                    return false;
                }

                return _identity.roles.indexOf(role) !== -1;
            },
            isInAnyRole: function (roles) {
                if (!_authenticated || !_identity.roles) {
                    return false;
                }

                for (var i = 0; i < roles.length; i++) {
                    if (this.isInRole(roles[i])) {
                        return true;
                    }
                }

                return false;
            },
            authenticate: function (identity) {
                _identity = identity;
                _authenticated = identity !== null;
            },
            identity: function (force) {
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
                    .then(function (account) {
                        _identity = account.data;
                        _authenticated = true;
                        deferred.resolve(_identity);<% if (websocket == 'spring-websocket') { %>
                        Tracker.connect();<% } %>
                    })
                    .catch(function() {
                        _identity = null;
                        _authenticated = false;
                        deferred.resolve(_identity);
                    });
                return deferred.promise;
            }
        };
    });
