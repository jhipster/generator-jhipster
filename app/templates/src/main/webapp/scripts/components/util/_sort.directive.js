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
                this.applyClass = function (element) {
                    var allThIcons = element.parent().find('span.glyphicon'),
                    sortIcon = 'glyphicon-sort',
                    sortAsc = 'glyphicon-sort-by-attributes',
                    sortDesc = 'glyphicon-sort-by-attributes-alt',
                    remove = sortIcon + ' ' + sortDesc,
                    add = sortAsc,
                    thisIcon = element.find('span.glyphicon');
                    if (!$scope.ascending) {
                        remove = sortIcon + ' ' + sortAsc;
                        add = sortDesc;
                    }
                    allThIcons.removeClass(sortAsc + ' ' + sortDesc);
                    allThIcons.addClass(sortIcon);
                    thisIcon.removeClass(remove);
                    thisIcon.addClass(add);
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
                    parentCtrl.applyClass(element);
                });
            }
        };
    });
