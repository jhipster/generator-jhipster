'use strict';

angular.module('<%=angularAppName%>')
    .controller('MetricsController', function ($scope, MonitoringService, $uibModal) {
        $scope.metrics = {};
        $scope.updatingMetrics = true;

        $scope.refresh = function () {
            $scope.updatingMetrics = true;
            MonitoringService.getMetrics().then(function (promise) {
                $scope.metrics = promise;
                $scope.updatingMetrics = false;
            }, function (promise) {
                $scope.metrics = promise.data;
                $scope.updatingMetrics = false;
            });
        };

        $scope.$watch('metrics', function (newValue) {
            $scope.servicesStats = {};
            $scope.cachesStats = {};
            angular.forEach(newValue.timers, function (value, key) {
                if (key.indexOf('web.rest') !== -1 || key.indexOf('service') !== -1) {
                    $scope.servicesStats[key] = value;
                }
                if (key.indexOf('net.sf.ehcache.Cache') !== -1) {
                    // remove gets or puts
                    var index = key.lastIndexOf('.');
                    var newKey = key.substr(0, index);

                    // Keep the name of the domain
                    index = newKey.lastIndexOf('.');
                    $scope.cachesStats[newKey] = {
                        'name': newKey.substr(index + 1),
                        'value': value
                    };
                }
            });
        });

        $scope.refresh();

        $scope.refreshThreadDumpData = function() {
            MonitoringService.threadDump().then(function(data) {

                var modalInstance = $uibModal.open({
                    templateUrl: 'scripts/app/admin/metrics/metrics.modal.html',
                    controller: 'MetricsModalController',
                    size: 'lg',
                    resolve: {
                        threadDump: function() {
                            return data.content;
                        }

                    }
                });
            });
        };
    });
