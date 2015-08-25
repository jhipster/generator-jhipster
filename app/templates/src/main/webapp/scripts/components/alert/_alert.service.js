'use strict';

angular.module('<%=angularAppName%>')
    .factory('AlertService', function ($timeout, $sce<% if (enableTranslation) { %>,$translate<% } %>) {
        var exports = {
            factory: factory,
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
        alertId = 0, // unique id for each alert. Starts from 0.
        alerts = [],
        timeout = 5000; // default timeout

        function clear() {
            alerts = [];
        }

        function get() {
            return alerts;
        }

        function success(msg, params) {
            this.add({
                type: "success",
                msg: msg,
                params: params,
                timeout: timeout
            });
        }

        function error(msg, params) {
            this.add({
                type: "danger",
                msg: msg,
                params: params,
                timeout: timeout
            });
        }

        function warning(msg, params) {
            this.add({
                type: "warning",
                msg: msg,
                params: params,
                timeout: timeout
            });
        }

        function info(msg, params) {
            this.add({
                type: "info",
                msg: msg,
                params: params,
                timeout: timeout
            });
        }

        function factory(alertOptions) {
            return alerts.push({
                type: alertOptions.type,
                msg: $sce.trustAsHtml(alertOptions.msg),
                id: alertOptions.alertId,
                timeout: alertOptions.timeout,
                close: function () {
                    return exports.closeAlert(this.id);
                }
            });
        }

        function addAlert(alertOptions) {
            alertOptions.alertId = alertId++;<% if (enableTranslation) { %>
            alertOptions.msg = $translate.instant(alertOptions.msg, alertOptions.params);<% } %>
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

    });