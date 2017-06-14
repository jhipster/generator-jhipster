<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('<%=jhiPrefixCapitalized%>HealthService', <%=jhiPrefixCapitalized%>HealthService);

    <%=jhiPrefixCapitalized%>HealthService.$inject = ['$rootScope', '$http'];

    function <%=jhiPrefixCapitalized%>HealthService ($rootScope, $http) {
        var separator = '.';
        var service = {
            checkHealth: checkHealth,
            transformHealthData: transformHealthData,
            getBaseName: getBaseName,
            getSubSystemName: getSubSystemName
        };

        return service;

        function checkHealth () {
            return $http.get('management/health').then(function (response) {
                return response.data;
            });
        }

        function transformHealthData (data) {
            var response = [];
            flattenHealthData(response, null, data);
            return response;
        }

        function getBaseName (name) {
            if (name) {
                var split = name.split('.');
                return split[0];
            }
        }

        function getSubSystemName (name) {
            if (name) {
                var split = name.split('.');
                split.splice(0, 1);
                var remainder = split.join('.');
                return remainder ? ' - ' + remainder : '';
            }
        }

        /* private methods */
        function flattenHealthData (result, path, data) {
            angular.forEach(data, function (value, key) {
                if (isHealthObject(value)) {
                    if (hasSubSystem(value)) {
                        addHealthObject(result, false, value, getModuleName(path, key));
                        flattenHealthData(result, getModuleName(path, key), value);
                    } else {
                        addHealthObject(result, true, value, getModuleName(path, key));
                    }
                }
            });
            return result;
        }

        function addHealthObject (result, isLeaf, healthObject, name) {

            var healthData = {
                'name': name
            };
            var details = {};
            var hasDetails = false;

            angular.forEach(healthObject, function (value, key) {
                if (key === 'status' || key === 'error') {
                    healthData[key] = value;
                } else {
                    if (!isHealthObject(value)) {
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

        function getModuleName (path, name) {
            var result;
            if (path && name) {
                result = path + separator + name;
            }  else if (path) {
                result = path;
            } else if (name) {
                result = name;
            } else {
                result = '';
            }
            return result;
        }

        function hasSubSystem (healthObject) {
            var result = false;
            angular.forEach(healthObject, function (value) {
                if (value && value.status) {
                    result = true;
                }
            });
            return result;
        }

        function isHealthObject (healthObject) {
            var result = false;
            angular.forEach(healthObject, function (value, key) {
                if (key === 'status') {
                    result = true;
                }
            });
            return result;
        }

    }
})();
