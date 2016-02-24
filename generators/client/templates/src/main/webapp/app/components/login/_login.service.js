(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('LoginService', function ($uibModal) {
            var modalInstance = null;
            var resetModal = function () {
                modalInstance = null;
            };
            return {
                open: function () {
                    if (modalInstance != null) return;
                    modalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'app/components/login/login.html',
                        controller: 'LoginController',
                        resolve: {
                            translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                                $translatePartialLoader.addPart('login');
                                return $translate.refresh();
                            }]
                        }
                    });
                    modalInstance.result.then(
                        resetModal,
                        resetModal
                    );
                }
            }
        });
})();
