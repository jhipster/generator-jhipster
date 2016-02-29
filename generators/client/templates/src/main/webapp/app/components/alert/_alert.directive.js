(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .component('jhiAlert', jhiAlert);

    function jhiAlert () {
        var component = {
            template: '<div class="alerts" ng-cloak="">' +
                            '<div ng-repeat="alert in vm.alerts" ng-class="[alert.position, {\'toast\': alert.toast}]">' +
                                '<uib-alert ng-cloak="" type="{{alert.type}}" close="alert.close()"><pre>{{ alert.msg }}</pre></uib-alert>' +
                            '</div>' +
                      '</div>',
            controller: jhiAlertController,
            controllerAs: 'vm'
        };

        return component;
    }

    jhiAlertController.$inject = ['$scope', 'AlertService'];

    function jhiAlertController($scope, AlertService) {
        var vm = this;

        vm.alerts = AlertService.get();
        $scope.$on('$destroy', function () {
            vm.alerts = [];
        });
    }
})();
