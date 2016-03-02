(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%=jhiPrefix%>MetricsMonitoringController', <%=jhiPrefix%>MetricsMonitoringController);

    <%=jhiPrefix%>MetricsMonitoringController.$inject = ['$scope','<%=jhiPrefix%>MetricsService', '$uibModal'];

    function <%=jhiPrefix%>MetricsMonitoringController ($scope, <%=jhiPrefix%>MetricsService, $uibModal) {
        var vm = this;

        vm.cachesStats = {};
        vm.metrics = {};
        vm.refresh = refresh;
        vm.refreshThreadDumpData = refreshThreadDumpData;
        vm.servicesStats = {};
        vm.updatingMetrics = true;

        vm.refresh();

        $scope.$watch('vm.metrics', function (newValue) {
            vm.servicesStats = {};
            vm.cachesStats = {};
            angular.forEach(newValue.timers, function (value, key) {
                if (key.indexOf('web.rest') !== -1 || key.indexOf('service') !== -1) {
                    vm.servicesStats[key] = value;
                }
                if (key.indexOf('net.sf.ehcache.Cache') !== -1) {
                    // remove gets or puts
                    var index = key.lastIndexOf('.');
                    var newKey = key.substr(0, index);

                    // Keep the name of the domain
                    index = newKey.lastIndexOf('.');
                    vm.cachesStats[newKey] = {
                        'name': newKey.substr(index + 1),
                        'value': value
                    };
                }
            });
        });

        function refresh () {
            vm.updatingMetrics = true;
            <%=jhiPrefix%>MetricsService.getMetrics().then(function (promise) {
                vm.metrics = promise;
                vm.updatingMetrics = false;
            }, function (promise) {
                vm.metrics = promise.data;
                vm.updatingMetrics = false;
            });
        }

        function refreshThreadDumpData () {
            <%=jhiPrefix%>MetricsService.threadDump().then(function(data) {
                $uibModal.open({
                    templateUrl: 'app/admin/metrics/metrics.modal.html',
                    controller: '<%=jhiPrefix%>MetricsMonitoringModalController',
                    controllerAs: 'vm',
                    size: 'lg',
                    resolve: {
                        threadDump: function() {
                            return data;
                        }

                    }
                });
            });
        }


    }
})();
