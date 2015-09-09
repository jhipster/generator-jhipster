'use strict';

angular.module('<%=angularAppName%>')
.factory('AlertService', function ($timeout, $sce<% if (enableTranslation) { %>,$translate<% } %>, toaster) {
        function success(msg, params) {
            this.add({
                type: "success",
                msg: msg,
                params: params
            });
        }

        function error(msg, params) {
            if (msg) {
                this.add({
                    type: "danger",
                    msg: msg,
                    params: params
                });
            }
        }

        function warning(msg, params) {
            if (msg) {
                this.add({
                    type: "warning",
                    msg: msg,
                    params: params
                });
            }
        }

        function info(msg, params) {
            this.add({
                type: "info",
                msg: msg,
                params: params
            });
        }

        function factory(alertOptions) {
            // type, title, text
            toaster.pop(alertOptions.type, '', $sce.trustAsHtml(alertOptions.msg));
        }

        function addAlert(alertOptions) {
            <% if (enableTranslation) { %>
            alertOptions.msg = $translate.instant(alertOptions.msg, alertOptions.params);<% } %>
            this.factory(alertOptions);
        }

        return {
            factory: factory,
            add: addAlert,
            success: success,
            error: error,
            info: info,
            warning: warning
        };
    });