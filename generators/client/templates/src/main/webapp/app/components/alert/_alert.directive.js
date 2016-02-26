(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .component('jhAlert', jhAlert);

    function jhAlert () {
        var component = {
            template: '<div class="alerts" ng-cloak="">' +
                            '<div ng-repeat="alert in vm.alerts" ng-class="[alert.position, {\'toast\': alert.toast}]">' +
                                '<uib-alert ng-cloak="" type="{{alert.type}}" close="alert.close()"><pre>{{ alert.msg }}</pre></uib-alert>' +
                            '</div>' +
                      '</div>',
            controller: jhAlertController,
            controllerAs: 'vm'
        };

        return component;

        jhAlertController.$inject = ['$scope', 'AlertService'];

        function jhAlertController($scope, AlertService) {
            var vm = this;

            vm.alerts = AlertService.get();
            $scope.$on('$destroy', function () {
                vm.alerts = [];
            });
        }
    }
})();
