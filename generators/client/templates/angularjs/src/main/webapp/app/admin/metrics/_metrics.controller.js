<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
        .controller('<%=jhiPrefixCapitalized%>MetricsMonitoringController', <%=jhiPrefixCapitalized%>MetricsMonitoringController);

    <%=jhiPrefixCapitalized%>MetricsMonitoringController.$inject = ['$scope','<%=jhiPrefixCapitalized%>MetricsService', '$uibModal'];

    function <%=jhiPrefixCapitalized%>MetricsMonitoringController ($scope, <%=jhiPrefixCapitalized%>MetricsService, $uibModal) {
        var vm = this;

        <%_ if (hibernateCache === 'ehcache' || hibernateCache === 'infinispan') { _%>
        vm.cachesStats = {};
        <%_ } _%>
        vm.metrics = {};
        vm.refresh = refresh;
        vm.refreshThreadDumpData = refreshThreadDumpData;
        vm.servicesStats = {};
        vm.updatingMetrics = true;

        vm.refresh();

        $scope.$watch('vm.metrics', function (newValue) {
            vm.servicesStats = {};
            angular.forEach(newValue.timers, function (value, key) {
                if (key.indexOf('web.rest') !== -1 || key.indexOf('service') !== -1) {
                    vm.servicesStats[key] = value;
                }
            });

            <%_ if (hibernateCache === 'ehcache' || hibernateCache === 'infinispan') { _%>
            vm.cachesStats = {};
            angular.forEach(newValue.gauges, function (value, key) {
                if (key.indexOf('jcache.statistics') !== -1) {
                    // remove gets or puts
                    var index = key.lastIndexOf('.');
                    var newKey = key.substr(0, index);

                    // Keep the name of the domain
                    vm.cachesStats[newKey] = {
                        'name': newKey.substr(18),
                        'value': value
                    };
                }
            });
            <%_ } _%>
        });

        function refresh () {
            vm.updatingMetrics = true;
            <%=jhiPrefixCapitalized%>MetricsService.getMetrics().then(function (promise) {
                vm.metrics = promise;
                vm.updatingMetrics = false;
            }, function (promise) {
                vm.metrics = promise.data;
                vm.updatingMetrics = false;
            });
        }

        function refreshThreadDumpData () {
            <%=jhiPrefixCapitalized%>MetricsService.threadDump().then(function(data) {
                $uibModal.open({
                    templateUrl: 'app/admin/metrics/metrics.modal.html',
                    controller: '<%=jhiPrefixCapitalized%>MetricsMonitoringModalController',
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
