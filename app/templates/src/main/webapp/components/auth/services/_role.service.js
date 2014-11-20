'use strict';

angular.module('<%=angularAppName%>')
    .factory('Role', function Role(Auth) {
        return {
            allRoles: function () {
                return {
                    'all': '*',
                    'admin': 'ROLE_ADMIN',
                    'user': 'ROLE_USER'
                }
            },
            hasRole: function (authorizedRoles) {
                if (!angular.isArray(authorizedRoles)) {
                    if (authorizedRoles == '*') {
                        return true;
                    }

                    authorizedRoles = [authorizedRoles];
                }

                var isAuthorized = false;
                angular.forEach(authorizedRoles, function (authorizedRole) {
                    var authorized = (Auth.isAuthenticated() &&
                        Auth.getRoles().indexOf(authorizedRole) !== -1);

                    if (authorized || authorizedRole == '*') {
                        isAuthorized = true;
                    }
                });

                return isAuthorized;
            }
        }
    });
