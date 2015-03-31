'use strict';

angular.module('<%=angularAppName%>')
    .factory('Tracker', function ($rootScope, $cookies, $http) {
        var stompClient = null;
        function sendActivity() {
            if (stompClient != null && stompClient.connected) {
                stompClient
                    .send('/topic/activity',
                    {},
                    JSON.stringify({'page': $rootScope.toState.name}));
            }
        }
        return {
            connect: function () {
                var socket = new SockJS('/websocket/tracker');
                stompClient = Stomp.over(socket);
                var headers = {};
                headers['X-CSRF-TOKEN'] = $cookies[$http.defaults.xsrfCookieName];
                stompClient.connect(headers, function(frame) {
                    sendActivity();
                    $rootScope.$on('$stateChangeStart', function (event) {
                        sendActivity();
                    });
                });
            },
            sendActivity: function () {
                if (stompClient != null) {
                    sendActivity();
                }
            },
            disconnect: function() {
                if (stompClient != null) {
                    stompClient.disconnect();
                    stompClient = null;
                }
            }
        };
    });
