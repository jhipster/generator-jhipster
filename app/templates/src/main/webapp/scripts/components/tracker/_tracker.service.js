'use strict';

angular.module('<%=angularAppName%>')
    .factory('Tracker', function ($rootScope, $cookies, $http, $q) {
        var stompClient = null;
        var subscriber = null;
        var listener = $q.defer();
        var connected = $q.defer();
        var alreadyConnectedOnce = false;
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
                //building absolute path so that websocket doesnt fail when deploying with a context path
                var loc = window.location;
                var url = '//' + loc.host + loc.pathname + 'websocket/tracker';<% if (authenticationType == 'oauth2') { %>
                var authToken = JSON.parse(localStorage.getItem("ls.token")).access_token;
                url += '?access_token=' + authToken;<% } %>
                var socket = new SockJS(url);
                stompClient = Stomp.over(socket);
                var headers = {};<% if (authenticationType == 'session') { %>
                headers['X-CSRF-TOKEN'] = $cookies[$http.defaults.xsrfCookieName];<% } %>
                stompClient.connect(headers, function(frame) {
                    connected.resolve("success");
                    sendActivity();
                    if (!alreadyConnectedOnce) {
                        $rootScope.$on('$stateChangeStart', function (event) {
                            sendActivity();
                        });
                        alreadyConnectedOnce = true;
                    }
                });
            },
            subscribe: function() {
                connected.promise.then(function() {
                    subscriber = stompClient.subscribe("/topic/tracker", function(data) {
                        listener.notify(JSON.parse(data.body));
                    });
                }, null, null);
            },
            unsubscribe: function() {
                if (subscriber != null) {
                    subscriber.unsubscribe();
                }
            },
            receive: function() {
                return listener.promise;
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
