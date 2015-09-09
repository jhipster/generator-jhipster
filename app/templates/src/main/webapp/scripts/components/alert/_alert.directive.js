'use strict';

angular.module('<%=angularAppName%>')
    .directive('jhAlertToast', function(AlertService, $rootScope<% if (enableTranslation) { %>, $translate<% } %>, $window) {
		return {
            restrict: 'E',
            template: '<toaster-container toaster-options="{\'close-button\': true, \'position-class\': positionClass}"></toaster-container>',
			controller: ['$scope', 
	            function($scope) {
	                // default location
	                $scope.positionClass = 'toast-bottom-right';
	                // full-width on smart devices
                    if (isSmartDevice($window)) {
                        $scope.positionClass = 'toast-bottom-full-width';
                    }
	                
					var cleanHttpErrorListener = $rootScope.$on('<%=angularAppName%>.httpError', function (event, httpResponse) {
					    var i;
					    event.stopPropagation();
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
					    if(cleanHttpErrorListener !== undefined && cleanHttpErrorListener !== null){
							cleanHttpErrorListener();
						}
					});

					var addErrorAlert = function (message, key, data) {
						<% if (enableTranslation) { %>
						key = key && key != null ? key : message;
						AlertService.error(key, data); <%} else { %> AlertService.error(message); <% } %>
					}
					
					function isSmartDevice( $window ) {
                        // Adapted from http://www.detectmobilebrowsers.com
                        var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
                        // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
                        return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
                    }
	            }
	        ]
        }
    });