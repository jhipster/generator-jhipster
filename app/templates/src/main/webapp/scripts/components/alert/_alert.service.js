'use strict';

angular.module('<%=angularAppName%>')
    .provider('AlertService', function () {
        this.toast = false;

        this.$get = ['$timeout', '$sce'<% if (enableTranslation) { %>, '$translate'<% } %>, function($timeout, $sce<% if (enableTranslation) { %>,$translate<% } %>) {

            var exports = {
                factory: factory,
                isToast: isToast,
                add: addAlert,
                closeAlert: closeAlert,
                closeAlertByIndex: closeAlertByIndex,
                clear: clear,
                get: get,
                success: success,
                error: error,
                info: info,
                warning : warning
            },
            
            toast = this.toast,
            alertId = 0, // unique id for each alert. Starts from 0.
            alerts = [],
            timeout = 5000; // default timeout

            function isToast() {
                return toast;
            }

            function clear() {
                alerts = [];
            }

            function get() {
                return alerts;
            }

            function success(msg, params, position) {
                this.add({
                    type: "success",
                    msg: msg,
                    params: params,
                    timeout: timeout,
                    toast: toast,
                    position: position
                });
            }

            function error(msg, params, position) {
                this.add({
                    type: "danger",
                    msg: msg,
                    params: params,
                    timeout: timeout,
                    toast: toast,
                    position: position
                });
            }

            function warning(msg, params, position) {
                this.add({
                    type: "warning",
                    msg: msg,
                    params: params,
                    timeout: timeout,
                    toast: toast,
                    position: position
                });
            }

            function info(msg, params, position) {
                this.add({
                    type: "info",
                    msg: msg,
                    params: params,
                    timeout: timeout,
                    toast: toast,
                    position: position
                });
            }

            function factory(alertOptions) {
                return alerts.push({
                    type: alertOptions.type,
                    msg: $sce.trustAsHtml(alertOptions.msg),
                    id: alertOptions.alertId,
                    timeout: alertOptions.timeout,
                    toast: alertOptions.toast,
                    position: alertOptions.position ? alertOptions.position : 'top right',
                    close: function () {
                        return exports.closeAlert(this.id);
                    }
                });
            }

            function addAlert(alertOptions) {
                alertOptions.alertId = alertId++;
                <%_ if (enableTranslation) { _%>
                alertOptions.msg = $translate.instant(alertOptions.msg, alertOptions.params);
                <%_ } _%>
                var that = this;
                this.factory(alertOptions);
                if (alertOptions.timeout && alertOptions.timeout > 0) {
                    $timeout(function () {
                        that.closeAlert(alertOptions.alertId);
                    }, alertOptions.timeout);
                }
            }

            function closeAlert(id) {
                return this.closeAlertByIndex(alerts.map(function(e) { return e.id; }).indexOf(id));
            }

            function closeAlertByIndex(index) {
                return alerts.splice(index, 1);
            }

            return exports;
        }];

        this.showAsToast = function(isToast) {
            this.toast = isToast;
        };


    });