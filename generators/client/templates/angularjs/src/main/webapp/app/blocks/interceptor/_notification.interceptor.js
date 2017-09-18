<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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
        .factory('notificationInterceptor', notificationInterceptor);

    notificationInterceptor.$inject = ['$q', 'AlertService'];

    function notificationInterceptor ($q, AlertService) {
        var service = {
            response: response
        };

        return service;

        function response (response) {
            var headers = Object.keys(response.headers()).filter(function (header) {
                return header.indexOf('app-alert', header.length - 'app-alert'.length) !== -1 || header.indexOf('app-params', header.length - 'app-params'.length) !== -1;
            }).sort();
            var alertKey = response.headers(headers[0]);
            if (angular.isString(alertKey)) {
                AlertService.success(alertKey, { param : response.headers(headers[1])});
            }
            return response;
        }
    }
})();
