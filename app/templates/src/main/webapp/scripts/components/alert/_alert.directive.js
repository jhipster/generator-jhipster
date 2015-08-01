'use strict';

angular.module('<%=angularAppName%>')
    .directive('jhAlertToast', function(AlertService, $rootScope<% if (enableTranslation) { %>, $translate<% } %>) {
		return {
            restrict: 'E',
            template: '<div class="alerts" ng-cloak="">' +
			                '<alert ng-cloak="" ng-repeat="alert in alerts" type="{{alert.type}}" close="alert.close()"><pre>{{ alert.msg }}</pre></alert>' +
			            '</div>',
			controller: ['$scope', 
	            function($scope) {
	                $scope.alerts = AlertService.get();

					var cleanHttpErrorListener = $rootScope.$on('<%=angularAppName%>.httpError', function (event, httpResponse) {
					    var i;

					    switch (httpResponse.status) {
					        // connection refused, server not reachable
					        case 0:
					            addErrorAlert("Server not reachable",'error.serverNotReachable');
					            break;

					        case 400:
					            if (httpResponse.data && httpResponse.data.fieldErrors) {
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
					    cleanupCleanErrorsListener();
					});

					var addErrorAlert = function (message, key, data) {
						AlertService.error(<% if (enableTranslation) { %>key, data<%}else { %>message<% } %>);
					}

	            }
	        ]
        }
    });