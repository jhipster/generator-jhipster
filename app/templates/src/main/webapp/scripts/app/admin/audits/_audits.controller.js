(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('AuditsController', controller);

    controller.$inject = ['$filter', 'AuditsService'];
    /* @ngInject */
    function controller($filter, AuditsService){

        var vm = this;

        vm.onChangeDate = onChangeDate;
        vm.today = today;
        vm.previousMonth = previousMonth;

        activate();
        function activate(){
            vm.today();
            vm.previousMonth();
            vm.onChangeDate();
        }

        function onChangeDate() {
            var dateFormat = 'yyyy-MM-dd';
            var fromDate = $filter('date')(vm.fromDate, dateFormat);
            var toDate = $filter('date')(vm.toDate, dateFormat);

            AuditsService.findByDates(fromDate, toDate).then(function (data) {
                vm.audits = data;
            });
        }

        // Date picker configuration
        function today() {
            // Today + 1 day - needed if the current day must be included
            var today = new Date();
            vm.toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        }

        function previousMonth() {
            var fromDate = new Date();
            if (fromDate.getMonth() === 0) {
                fromDate = new Date(fromDate.getFullYear() - 1, 0, fromDate.getDate());
            } else {
                fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, fromDate.getDate());
            }

            vm.fromDate = fromDate;
        }

    }
})();
