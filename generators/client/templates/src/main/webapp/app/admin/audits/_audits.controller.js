'use strict';

angular.module('<%=angularAppName%>')
    .controller('AuditsController', function ($scope, $filter, AuditsService, ParseLinks) {
        $scope.page = 1;

        $scope.onChangeDate = function () {
            var dateFormat = 'yyyy-MM-dd';
            var fromDate = $filter('date')($scope.fromDate, dateFormat);
            var toDate = $filter('date')($scope.toDate, dateFormat);

            AuditsService.query({page: $scope.page -1, size: 20, fromDate: fromDate, toDate: toDate}, function(result, headers){
                $scope.audits = result;
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.totalItems = headers('X-Total-Count');
            });
        };

        // Date picker configuration
        $scope.today = function () {
            // Today + 1 day - needed if the current day must be included
            var today = new Date();
            $scope.toDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        };

        $scope.previousMonth = function () {
            var fromDate = new Date();
            if (fromDate.getMonth() === 0) {
                fromDate = new Date(fromDate.getFullYear() - 1, 11, fromDate.getDate());
            } else {
                fromDate = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, fromDate.getDate());
            }

            $scope.fromDate = fromDate;
        };

        $scope.loadPage = function (page) {
            $scope.page = page;
            $scope.onChangeDate();
        };

        $scope.today();
        $scope.previousMonth();
        $scope.onChangeDate();
    });
