'use strict';

angular.module('<%=angularAppName%>')
    .factory('Auth', function Auth($rootScope, $q, $http, Account, AuthServerProvider, Register, Activate, Password) {
        if (AuthServerProvider.hasValidToken()) {
            $rootScope.currentAccount = Account.get();
            $rootScope.authenticated = true;
        } else {
            $rootScope.currentAccount = {};
            $rootScope.authenticated = false;
        }

        return {
            login: function (credentials, callback) {
                var cb = callback || angular.noop;
                var deferred = $q.defer();

                AuthServerProvider.login(credentials).then(function (data) {
                    // retrieve the logged account information
                    $rootScope.currentAccount = Account.get();
                    deferred.resolve(data);

                    return cb();
                }).catch(function (err) {
                    this.logout();
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));

                return deferred.promise;
            },

            logout: function () {
                AuthServerProvider.logout();
                $rootScope.currentAccount = {};
                $rootScope.authenticated = false;
            },

            getCurrentAccount: function () {
                return $rootScope.currentAccount;
            },

            getRoles: function () {
                if ($rootScope.currentAccount.hasOwnProperty('roles')) {
                    return $rootScope.currentAccount.roles;
                }
                return {};
            },

            isLoggedIn: function () {
                if (!AuthServerProvider.hasValidToken()) {
                    return false;
                }

                return $rootScope.currentAccount.hasOwnProperty('roles');
            },

            isLoggedInAsync: function (cb) {
                if (!AuthServerProvider.hasValidToken()) {
                    cb(false);
                }

                if ($rootScope.currentAccount.hasOwnProperty('$promise')) {
                    $rootScope.currentAccount.$promise.then(function () {
                        cb(true);
                    }).catch(function () {
                        cb(false);
                    });
                } else if ($rootScope.currentAccount.hasOwnProperty('roles')) {
                    cb(true);
                } else {
                    cb(false);
                }
            },

            isAuthenticated: function () {
                return AuthServerProvider.hasValidToken();
            },

            createAccount: function (account, callback) {
                var cb = callback || angular.noop;

                return Register.save(account,
                    function () {
                        return cb(account);
                    },
                    function (err) {
                        this.logout();
                        return cb(err);
                    }.bind(this)).$promise;
            },

            updateAccount: function (account, callback) {
                var cb = callback || angular.noop;

                return Account.save(account,
                    function () {
                        return cb(account);
                    },
                    function (err) {
                        return cb(err);
                    }.bind(this)).$promise;
            },

            activateAccount: function (key, callback) {
                var cb = callback || angular.noop;

                return Activate.get(key,
                    function (response) {
                        return cb(response);
                    },
                    function (err) {
                        return cb(err);
                    }.bind(this)).$promise;
            },

            changePassword: function (newPassword, callback) {
                var cb = callback || angular.noop;

                return Password.save(newPassword, function () {
                    return cb();
                }, function (err) {
                    return cb(err);
                }).$promise;
            }
        };
    });
