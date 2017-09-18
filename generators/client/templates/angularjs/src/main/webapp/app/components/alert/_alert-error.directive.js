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

    var jhiAlertError = {
        template: '<div class="alerts" ng-cloak="" role="alert">' +
                        '<div ng-repeat="alert in $ctrl.alerts" ng-class="[alert.position, {\'toast\': alert.toast}]">' +
                            '<uib-alert ng-cloak="" type="{{alert.type}}" close="alert.close($ctrl.alerts)"><pre>{{ alert.msg }}</pre></uib-alert>' +
                        '</div>' +
                  '</div>',
        controller: jhiAlertErrorController
    };

    angular
        .module('<%=angularAppName%>')
        .component('jhiAlertError', jhiAlertError);

    jhiAlertErrorController.$inject = ['$scope', 'AlertService', '$rootScope'<% if (enableTranslation) { %>, '$translate'<% } %>];

    function jhiAlertErrorController ($scope, AlertService, $rootScope<% if (enableTranslation) { %>, $translate<% } %>) {
        var vm = this;

        vm.alerts = [];

        function addErrorAlert (message, key, data) {
            <%_ if (enableTranslation) { _%>
            key = key ? key : message;
            vm.alerts.push(
                AlertService.add(
                    {
                        type: 'danger',
                        msg: key,
                        params: data,
                        timeout: 5000,
                        toast: AlertService.isToast(),
                        scoped: true
                    },
                    vm.alerts
                )
            );
            <%_ } else { _%>
            vm.alerts.push(
                AlertService.add(
                    {
                        type: 'danger',
                        msg: message,
                        timeout: 5000,
                        toast: AlertService.isToast(),
                        scoped: true
                    },
                    vm.alerts
                )
            );
            <%_ } _%>
        }

        var cleanHttpErrorListener = $rootScope.$on('<%=angularAppName%>.httpError', function (event, httpResponse) {
            var i;
            event.stopPropagation();
            switch (httpResponse.status) {
            // connection refused, server not reachable
            case 0:
                addErrorAlert('Server not reachable','error.server.not.reachable');
                break;

            case 400:
                var headers = Object.keys(httpResponse.headers()).filter(function (header) {
                    return header.indexOf('app-error', header.length - 'app-error'.length) !== -1 || header.indexOf('app-params', header.length - 'app-params'.length) !== -1;
                }).sort();
                var errorHeader = httpResponse.headers(headers[0]);
                var entityKey = httpResponse.headers(headers[1]);
                if (angular.isString(errorHeader)) {
                    var entityName = <% if (enableTranslation) { %>$translate.instant('global.menu.entities.' + entityKey)<% }else{ %>entityKey<% } %>;
                    addErrorAlert(errorHeader, errorHeader, {entityName: entityName});
                } else if (httpResponse.data && httpResponse.data.fieldErrors) {
                    for (i = 0; i < httpResponse.data.fieldErrors.length; i++) {
                        var fieldError = httpResponse.data.fieldErrors[i];
                        // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
                        var convertedField = fieldError.field.replace(/\[\d*\]/g, '[]');
                        var fieldName = <% if (enableTranslation) { %>$translate.instant('<%= angularAppName %>.' + fieldError.objectName + '.' + convertedField)<% }else{ %>convertedField.charAt(0).toUpperCase() + convertedField.slice(1)<% } %>;
                        addErrorAlert('Field ' + fieldName + ' cannot be empty', 'error.' + fieldError.message, {fieldName: fieldName});
                    }
                } else if (httpResponse.data && httpResponse.data.message) {
                    addErrorAlert(httpResponse.data.message, httpResponse.data.message, httpResponse.data);
                } else {
                    addErrorAlert(httpResponse.data);
                }
                break;

            case 404:
                addErrorAlert('Not found','error.url.not.found');
                break;

            default:
                if (httpResponse.data && httpResponse.data.message) {
                    addErrorAlert(httpResponse.data.message);
                } else {
                    addErrorAlert(angular.toJson(httpResponse));
                }
            }
        });

        $scope.$on('$destroy', function () {
            if(angular.isDefined(cleanHttpErrorListener) && cleanHttpErrorListener !== null){
                cleanHttpErrorListener();
                vm.alerts = [];
            }
        });
    }
})();
