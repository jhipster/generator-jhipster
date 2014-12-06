'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('register', {
                parent: 'account',
                url: '/register',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'app/account/register/register.html',
                        controller: 'RegisterController'
                    }
                },
                resolve: {
                    translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                        $translatePartialLoader.addPart('register');
                        return $translate.refresh();
                    }]
                }
            });
    })
    .controller('RegisterController', function ($scope, $translate, Auth) {
        $scope.success = null;
        $scope.error = null;
        $scope.doNotMatch = null;
        $scope.errorUserExists = null;
        $scope.registerAccount = {};

        $scope.register = function () {
            if ($scope.registerAccount.password != $scope.confirmPassword) {
                $scope.doNotMatch = "ERROR";
            } else {
                $scope.registerAccount.langKey = $translate.use();
                $scope.doNotMatch = null;
                $scope.error = null;
                $scope.errorUserExists = null;
                $scope.errorEmailExists = null;

                Auth.createAccount($scope.registerAccount).then(function (account) {
                    $scope.success = 'OK';
                }).catch(function (response) {
                    $scope.success = null;
                    if (response.status === 400 && response.data === "login already in use") {
                        $scope.errorUserExists = "ERROR";
                    } else if (response.status === 400 && response.data === "e-mail address already in use") {
                        $scope.errorEmailExists = "ERROR";
                    } else {
                        $scope.error = "ERROR";
                    }
                });
            }
        }
    });
