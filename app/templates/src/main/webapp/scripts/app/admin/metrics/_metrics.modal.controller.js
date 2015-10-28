(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('MetricsModalController', controller);

    controller.$inject = [
        '$modalInstance',
        'threadDump'
    ];
    /* @ngInject */
    function controller($modalInstance, threadDump){

        var vm = this;
        vm.threadDump = threadDump;
        vm.threadDumpRunnable = 0;
        vm.threadDumpWaiting = 0;
        vm.threadDumpTimedWaiting = 0;
        vm.threadDumpBlocked = 0;
        vm.threadDumpAll = vm.threadDumpRunnable +
            vm.threadDumpWaiting +
            vm.threadDumpTimedWaiting +
            vm.threadDumpBlocked;
        vm.cancel = cancel;
        vm.getLabelClass = getLabelClass;

        activate();
        function activate(){
            angular.forEach(threadDump, function(value) {
                if (value.threadState === 'RUNNABLE') {
                    vm.threadDumpRunnable += 1;
                } else if (value.threadState === 'WAITING') {
                    vm.threadDumpWaiting += 1;
                } else if (value.threadState === 'TIMED_WAITING') {
                    vm.threadDumpTimedWaiting += 1;
                } else if (value.threadState === 'BLOCKED') {
                    vm.threadDumpBlocked += 1;
                }
            });
        }

        function cancel() {
            $modalInstance.dismiss('cancel');
        }

        function getLabelClass(threadState) {
            if (threadState === 'RUNNABLE') {
                return 'label-success';
            } else if (threadState === 'WAITING') {
                return 'label-info';
            } else if (threadState === 'TIMED_WAITING') {
                return 'label-warning';
            } else if (threadState === 'BLOCKED') {
                return 'label-danger';
            }
        }

    }
})();
