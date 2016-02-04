'use strict';

angular.module('<%=angularAppName%>')
    .controller('MetricsModalController', function($scope, $uibModalInstance, threadDump) {

        $scope.threadDump = threadDump;
        $scope.threadDumpRunnable = 0;
        $scope.threadDumpWaiting = 0;
        $scope.threadDumpTimedWaiting = 0;
        $scope.threadDumpBlocked = 0;

        angular.forEach(threadDump, function(value) {
            if (value.threadState === 'RUNNABLE') {
                $scope.threadDumpRunnable += 1;
            } else if (value.threadState === 'WAITING') {
                $scope.threadDumpWaiting += 1;
            } else if (value.threadState === 'TIMED_WAITING') {
                $scope.threadDumpTimedWaiting += 1;
            } else if (value.threadState === 'BLOCKED') {
                $scope.threadDumpBlocked += 1;
            }
        });

        $scope.threadDumpAll = $scope.threadDumpRunnable + $scope.threadDumpWaiting +
            $scope.threadDumpTimedWaiting + $scope.threadDumpBlocked;

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.getLabelClass = function (threadState) {
            if (threadState === 'RUNNABLE') {
                return 'label-success';
            } else if (threadState === 'WAITING') {
                return 'label-info';
            } else if (threadState === 'TIMED_WAITING') {
                return 'label-warning';
            } else if (threadState === 'BLOCKED') {
                return 'label-danger';
            }
        };
    });
