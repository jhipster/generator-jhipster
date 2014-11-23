'use strict';

angular.module('<%=angularAppName%>')
    .config(function ($stateProvider) {
        $stateProvider
            .state('activate', {
                parent: 'account',
                data: {
                    roles: []
                },
                views: {
                    'content@': {
                        templateUrl: 'app/account/activate/activate.html',
                        controller: 'ActivationController'
                    }
                }
            });
    })
    .controller('ActivationController', function ($scope, $routeParams, Auth) {
        Auth.activateAccount({key: $routeParams.key}).then(function () {
            $scope.error = null;
            $scope.success = 'OK';
        }).catch(function (response) {
            $scope.success = null;
            $scope.error = "ERROR";
        });
    });
