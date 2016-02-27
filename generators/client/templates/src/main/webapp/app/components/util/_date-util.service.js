(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('DateUtils', DateUtils);

    DateUtils.$inject = ['$filter'];

    function DateUtils ($filter) {
        this.convertDateTimeFromServer = convertDateTimeFromServer;
        this.convertLocaleDateFromServer = convertLocaleDateFromServer;
        this.convertLocaleDateToServer = convertLocaleDateToServer;
        this.dateformat = dateformat;

        function convertDateTimeFromServer (date) {
            if (date) {
                return new Date(date);
            } else {
                return null;
            }
        }

        function convertLocaleDateFromServer (date) {
            if (date) {
                var dateString = date.split('-');
                return new Date(dateString[0], dateString[1] - 1, dateString[2]);
            }
            return null;
        }

        function convertLocaleDateToServer (date) {
            if (date) {
                return $filter('date')(date, 'yyyy-MM-dd');
            } else {
                return null;
            }
        }

        function dateformat () {
            return 'yyyy-MM-dd';
        }
    }

})();
