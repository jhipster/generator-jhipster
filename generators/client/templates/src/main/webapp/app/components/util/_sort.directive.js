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
            controller: ['$scope', '$element', function ($scope, $element) {
                var vm = this;
                vm.sort = function (field) {
                    if (field !== $scope.predicate) {
                        $scope.ascending = true;
                    } else {
                        $scope.ascending = !$scope.ascending;
                    }
                    $scope.predicate = field;
                    $scope.$apply();
                    $scope.callback();
                };
                vm.resetClasses = function () {
                    var allThIcons = $element.find('span.glyphicon'),
                        sortIcon = 'glyphicon-sort',
                        sortAsc = 'glyphicon-sort-by-attributes',
                        sortDesc = 'glyphicon-sort-by-attributes-alt';
                    allThIcons.removeClass(sortAsc + ' ' + sortDesc);
                    allThIcons.addClass(sortIcon);
                };
                vm.applyClass = function (element) {
                    var thisIcon = element.find('span.glyphicon'),
                        sortIcon = 'glyphicon-sort',
                        sortAsc = 'glyphicon-sort-by-attributes',
                        sortDesc = 'glyphicon-sort-by-attributes-alt',
                        remove = sortIcon + ' ' + sortDesc,
                        add = sortAsc;
                    if (!$scope.ascending) {
                        remove = sortIcon + ' ' + sortAsc;
                        add = sortDesc;
                    }
                    vm.resetClasses();
                    thisIcon.removeClass(remove);
                    thisIcon.addClass(add);
                };

                vm.triggerApply = function (values) {
                    vm.resetClasses();
                    if (values && values[0] !== '_score') {
                        vm.applyClass($element.find('th[jh-sort-by=\'' + values[0] + '\']'));
                    }
                };

                $scope.$watchGroup(['predicate', 'ascending'], vm.triggerApply);

                vm.triggerApply();
            }]
        };
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
