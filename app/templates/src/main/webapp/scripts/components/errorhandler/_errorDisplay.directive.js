(function () {
    'use strict';

    angular.module('<%=angularAppName%>').directive('errorDisplay', ['$rootScope', '$translate', function ($rootScope, $translate) {
        return {
            restrict: 'E',
            templateUrl: 'scripts/components/errorhandler/errorDisplay.html',
            link: function (scope) {
                scope.alerts = [];
                scope.collapsed = true;
                scope.closeAlert = function (index) {
                    scope.alerts.splice(index, 1);
                    scope.collapsed = scope.alerts.length === 0;
                };

                var cleanupStateChangeListener = $rootScope.$on('$stateChangeSuccess', function () {
                    scope.alerts = [];
                });

                var cleanHttpErrorListener = $rootScope.$on('httpError', function (event, httpResponse) {
                    var i;
                    scope.alerts = [];

                    switch (httpResponse.status) {
                        // connection refused, server not reachable
                        case 0:
                            $translate('error.serverNotReachable').then(scope.addAlert);
                            break;

                        case 400:
                            if (httpResponse.data && httpResponse.data.fieldErrors) {
                                for (i = 0; i < httpResponse.data.fieldErrors.length; i++) {
                                    var fieldError = httpResponse.data.fieldErrors[i];
                                    // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
                                    var convertedField = fieldError.field.replace(/\[\d*\]/g, "[]");
                                    var fieldName = $translate.instant('error.fieldName.' + fieldError.objectName + '.' + convertedField);
                                    scope.addAlert($translate.instant('error.' + fieldError.message, {fieldName: fieldName}));
                                }
                            } else if (httpResponse.data && httpResponse.data.message) {
                              scope.addAlert($translate.instant(httpResponse.data.message, httpResponse.data));
                            } else {
                              scope.addAlert(httpResponse.data);
                            }
                            break;

                        default:
                            if (httpResponse.data && httpResponse.data.message) {
                                scope.addAlert($translate.instant(httpResponse.data.message));
                            } else {
                                scope.addAlert(JSON.stringify(httpResponse));
                            }
                    }
                });

                var cleanupCleanErrorsListener = $rootScope.$on('clearErrors', function () {
                    scope.alerts = [];
                    scope.collapsed = true;
                });

                scope.$on('$destroy', function () {
                    cleanupStateChangeListener();
                    cleanHttpErrorListener();
                    cleanupCleanErrorsListener();
                });

                scope.addAlert = function (msg, important) {
                    scope.alerts.push({'type': 'danger', 'msg': msg, 'important': important});
                    scope.collapsed = scope.alerts.length === 0;
                };
            }
        };
    }]);
})();
