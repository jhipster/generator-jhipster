'use strict';

angular.module('<%=angularAppName%>')
    .directive('jhSort', function () {
        return {
            restrict: 'A',
            scope: {
                predicate: '=jhSort',
                ascending: '=',
                callback: '&'
            },
            controller: ['$scope', function ($scope) {
                this.sort = function (field) {
                    if (field !== $scope.predicate) {
                        $scope.ascending = true;
                    } else {
                        $scope.ascending = !$scope.ascending;
                    }
                    $scope.predicate = field;
                    $scope.$apply();
                    $scope.callback();
                }
            }]
        }
    }).directive('jhSortBy', function () {
        return {
            restrict: 'A',
            scope: false,
            require: '^jhSort',
            link: function (scope, element, attrs, parentCtrl) {
                element.bind('click', function () {
                    parentCtrl.sort(attrs.jhSortBy);
                });
            }
        };
    });