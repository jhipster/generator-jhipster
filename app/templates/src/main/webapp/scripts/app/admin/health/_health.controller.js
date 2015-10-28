(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('HealthController', controller);

    controller.$inject = [
        'MonitoringService',
        '$modal'
    ];
    /* @ngInject */
    function controller(MonitoringService, $modal){

        var vm = this;
        vm.updatingHealth = true;
        vm.separator = '.';
        vm.refresh = refresh;
        vm.getLabelClass = getLabelClass;
        vm.transformHealthData = transformHealthData;
        vm.flattenHealthData = flattenHealthData;
        vm.getModuleName = getModuleName;
        vm.showHealth = showHealth;
        vm.addHealthObject = addHealthObject;
        vm.hasSubSystem = hasSubSystem;
        vm.isHealthObject = isHealthObject;
        vm.baseName = baseName;
        vm.subSystemName = subSystemName;

            activate();
        function activate(){
            vm.refresh();
        }

        function refresh() {
            vm.updatingHealth = true;
            MonitoringService.checkHealth().then(function (response) {
                vm.healthData = vm.transformHealthData(response);
                vm.updatingHealth = false;
            }, function (response) {
                vm.healthData =  vm.transformHealthData(response.data);
                vm.updatingHealth = false;
            });
        }

        function getLabelClass(statusState) {
            if (statusState === 'UP') {
                return 'label-success';
            } else {
                return 'label-danger';
            }
        }

        function transformHealthData(data) {
            var response = [];
            vm.flattenHealthData(response, null, data);
            return response;
        }

        function flattenHealthData(result, path, data) {
            angular.forEach(data, function (value, key) {
                if (vm.isHealthObject(value)) {
                    if (vm.hasSubSystem(value)) {
                        vm.addHealthObject(result, false, value, vm.getModuleName(path, key));
                        vm.flattenHealthData(result, vm.getModuleName(path, key), value);
                    } else {
                        vm.addHealthObject(result, true, value, vm.getModuleName(path, key));
                    }
                }
            });
            return result;
        }

        function getModuleName(path, name) {
            var result;
            if (path && name) {
                result = path + vm.separator + name;
            }  else if (path) {
                result = path;
            } else if (name) {
                result = name;
            } else {
                result = '';
            }
            return result;
        }

        function showHealth(health) {
            var modalInstance = $modal.open({
                templateUrl: 'scripts/app/admin/health/health.modal.html',
                controller: 'HealthModalController',
                size: 'lg',
                resolve: {
                    currentHealth: function() {
                        return health;
                    },
                    baseName: function() {
                        return vm.baseName;
                    },
                    subSystemName: function() {
                        return vm.subSystemName;
                    }

                }
            });
        }

        function addHealthObject(result, isLeaf, healthObject, name) {

            var healthData = {
                'name': name
            };
            var details = {};
            var hasDetails = false;

            angular.forEach(healthObject, function (value, key) {
                if (key === 'status' || key === 'error') {
                    healthData[key] = value;
                } else {
                    if (!vm.isHealthObject(value)) {
                        details[key] = value;
                        hasDetails = true;
                    }
                }
            });

            // Add the of the details
            if (hasDetails) {
                angular.extend(healthData, { 'details': details});
            }

            // Only add nodes if they provide additional information
            if (isLeaf || hasDetails || healthData.error) {
                result.push(healthData);
            }
            return healthData;
        }

        function hasSubSystem(healthObject) {
            var result = false;
            angular.forEach(healthObject, function (value) {
                if (value && value.status) {
                    result = true;
                }
            });
            return result;
        }

        function isHealthObject(healthObject) {
            var result = false;
            angular.forEach(healthObject, function (value, key) {
                if (key === 'status') {
                    result = true;
                }
            });
            return result;
        }

        function baseName(name) {
            if (name) {
                var split = name.split('.');
                return split[0];
            }
        }

        function subSystemName(name) {
            if (name) {
                var split = name.split('.');
                split.splice(0, 1);
                var remainder = split.join('.');
                return remainder ? ' - ' + remainder : '';
            }
        }

    }
})();
