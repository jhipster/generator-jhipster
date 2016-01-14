'use strict';

angular.module('<%=angularAppName%>')
    .directive('jhAlert', function(AlertService) {
        return {
            restrict: 'E',
            template: '<div class="alerts" ng-cloak="">' +
                            '<div ng-repeat="alert in alerts" ng-class="[alert.position, {\'toast\': alert.toast}]">' +
                                '<uib-alert ng-cloak="" type="{{alert.type}}" close="alert.close()"><pre>{{ alert.msg }}</pre></uib-alert>' +
                            '</div>' +
                      '</div>',
            controller: ['$scope',
                function($scope) {
                    $scope.alerts = AlertService.get();
                    $scope.$on('$destroy', function () {
                        $scope.alerts = [];
                    });
                }
            ]
        }
    })
    .directive('jhAlertError', function(AlertService, $rootScope<% if (enableTranslation) { %>, $translate<% } %>) {
        return {
            restrict: 'E',
            template: '<div class="alerts" ng-cloak="">' +
                            '<div ng-repeat="alert in alerts" ng-class="[alert.position, {\'toast\': alert.toast}]">' +
                                '<uib-alert ng-cloak="" type="{{alert.type}}" close="alert.close(alerts)"><pre>{{ alert.msg }}</pre></uib-alert>' +
                            '</div>' +
                      '</div>',
            controller: ['$scope',
                function($scope) {

                    $scope.alerts = [];

                    var cleanHttpErrorListener = $rootScope.$on('<%=angularAppName%>.httpError', function (event, httpResponse) {
                        var i;
                        event.stopPropagation();
                        switch (httpResponse.status) {
                            // connection refused, server not reachable
                            case 0:
                                addErrorAlert("Server not reachable",'error.server.not.reachable');
                                break;

                            case 400:
                                var errorHeader = httpResponse.headers('X-<%=angularAppName%>-error');
                                var entityKey = httpResponse.headers('X-<%=angularAppName%>-params');
                                if (errorHeader) {
                                    var entityName = <% if (enableTranslation) { %>$translate.instant('global.menu.entities.' + entityKey)<% }else{ %>entityKey<% } %>;
                                    addErrorAlert(errorHeader, errorHeader, {entityName: entityName});
                                } else if (httpResponse.data && httpResponse.data.fieldErrors) {
                                    for (i = 0; i < httpResponse.data.fieldErrors.length; i++) {
                                        var fieldError = httpResponse.data.fieldErrors[i];
                                        // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
                                        var convertedField = fieldError.field.replace(/\[\d*\]/g, "[]");
                                        var fieldName = <% if (enableTranslation) { %>$translate.instant('<%= angularAppName %>.' + fieldError.objectName + '.' + convertedField)<% }else{ %>convertedField.charAt(0).toUpperCase() + convertedField.slice(1)<% } %>;
                                        addErrorAlert('Field ' + fieldName + ' cannot be empty', 'error.' + fieldError.message, {fieldName: fieldName});
                                    }
                                } else if (httpResponse.data && httpResponse.data.message) {
                                    addErrorAlert(httpResponse.data.message, httpResponse.data.message, httpResponse.data);
                                } else {
                                    addErrorAlert(httpResponse.data);
                                }
                                break;

                            default:
                                if (httpResponse.data && httpResponse.data.message) {
                                    addErrorAlert(httpResponse.data.message);
                                } else {
                                    addErrorAlert(JSON.stringify(httpResponse));
                                }
                        }
                    });

                    $scope.$on('$destroy', function () {
                        if(cleanHttpErrorListener !== undefined && cleanHttpErrorListener !== null){
                            cleanHttpErrorListener();
                            $scope.alerts = [];
                        }
                    });

                    var addErrorAlert = function (message, key, data) {
                    <%_ if (enableTranslation) { _%>
                        key = key && key != null ? key : message;
                        $scope.alerts.push(
                            AlertService.add(
                                {
                                    type: "danger",
                                    msg: key,
                                    params: data,
                                    timeout: 5000,
                                    toast: AlertService.isToast(),
                                    scoped: true
                                },
                                $scope.alerts
                            )
                        );
                    <%_ } else { _%>
                        $scope.alerts.push(
                            AlertService.add(
                                {
                                    type: "danger",
                                    msg: message,
                                    timeout: 5000,
                                    toast: AlertService.isToast(),
                                    scoped: true
                                },
                                $scope.alerts
                            )
                        );
                    <%_ } _%>
                    }
                }
            ]
        }
    });
