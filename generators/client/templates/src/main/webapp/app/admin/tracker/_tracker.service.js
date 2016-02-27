(function() {
    'use strict';
    /* globals window, SockJS, Stomp */

    angular
        .module('<%=angularAppName%>')
        .factory('Tracker', Tracker);

    Tracker.$inject = ['$rootScope', '$cookies', '$http', '$q'<% if (authenticationType == 'jwt') { %>, 'AuthServerProvider'<%}%>];

    function Tracker ($rootScope, $cookies, $http, $q<% if (authenticationType == 'jwt') { %>, AuthServerProvider<%}%>) {
        var stompClient = null;
        var subscriber = null;
        var listener = $q.defer();
        var connected = $q.defer();
        var alreadyConnectedOnce = false;

        var service = {
            connect: connect,
            disconnect: disconnect,
            receive: receive,
            sendActivity: sendActivity,
            subscribe: subscribe,
            unsubscribe: unsubscribe
        };

        return service;

        function connect () {
            //building absolute path so that websocket doesnt fail when deploying with a context path
            var loc = window.location;
            var url = '//' + loc.host + loc.pathname + 'websocket/tracker';<% if (authenticationType == 'oauth2') { %>
            /*jshint camelcase: false */
            var authToken = JSON.parse(localStorage.getItem('jhi-authenticationToken')).access_token;
            url += '?access_token=' + authToken;<% } %><% if (authenticationType == 'jwt') { %>
            var authToken = AuthServerProvider.getToken();
            if(authToken){
                url += '?access_token=' + authToken;
            }<% } %>
            var socket = new SockJS(url);
            stompClient = Stomp.over(socket);
            var headers = {};<% if (authenticationType == 'session') { %>
            headers['X-CSRF-TOKEN'] = $cookies[$http.defaults.xsrfCookieName];<% } %>
            stompClient.connect(headers, function() {
                connected.resolve('success');
                sendActivity();
                if (!alreadyConnectedOnce) {
                    $rootScope.$on('$stateChangeStart', function () {
                        sendActivity();
                    });
                    alreadyConnectedOnce = true;
                }
            });
        }

        function disconnect () {
            if (stompClient !== null) {
                stompClient.disconnect();
                stompClient = null;
            }
        }

        function receive () {
            return listener.promise;
        }

        function sendActivity() {
            if (stompClient !== null && stompClient.connected) {
                stompClient
                    .send('/topic/activity',
                    {},
                    JSON.stringify({'page': $rootScope.toState.name}));
            }
        }

        function subscribe () {
            connected.promise.then(function() {
                subscriber = stompClient.subscribe('/topic/tracker', function(data) {
                    listener.notify(JSON.parse(data.body));
                });
            }, null, null);
        }

        function unsubscribe () {
            if (subscriber !== null) {
                subscriber.unsubscribe();
            }
            listener = $q.defer();
        }
    }
})();
