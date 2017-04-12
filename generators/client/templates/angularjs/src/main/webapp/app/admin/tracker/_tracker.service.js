<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
(function() {
    'use strict';
    /* globals SockJS, Stomp */

    angular
        .module('<%=angularAppName%>')
        .factory('<%=jhiPrefixCapitalized%>TrackerService', <%=jhiPrefixCapitalized%>TrackerService);

    <%=jhiPrefixCapitalized%>TrackerService.$inject = ['$rootScope', '$window', '$cookies', '$http', '$q'<% if (authenticationType === 'jwt' || authenticationType === 'uaa') { %>, 'AuthServerProvider'<%}%><% if (authenticationType === 'oauth2') { %>, '$localStorage'<%}%>];

    function <%=jhiPrefixCapitalized%>TrackerService ($rootScope, $window, $cookies, $http, $q<% if (authenticationType === 'jwt' || authenticationType === 'uaa') { %>, AuthServerProvider<%}%><% if (authenticationType === 'oauth2') { %>, $localStorage<%}%>) {
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
            //building absolute path so that websocket doesn't fail when deploying with a context path
            var loc = $window.location;
            var url = '//' + loc.host + loc.pathname + 'websocket/tracker';<% if (authenticationType === 'oauth2') { %>
            /*jshint camelcase: false */
            var authToken = angular.fromJson($localStorage.authenticationToken).access_token;
            url += '?access_token=' + authToken;<% } %><% if (authenticationType === 'jwt' || authenticationType === 'uaa') { %>
            var authToken = AuthServerProvider.getToken();
            if(authToken){
                url += '?access_token=' + authToken;
            }<% } %>
            var socket = new SockJS(url);
            stompClient = Stomp.over(socket);
            var stateChangeStart;
            var headers = {};<% if (authenticationType === 'session') { %>
            headers[$http.defaults.xsrfHeaderName] = $cookies.get($http.defaults.xsrfCookieName);<% } %>
            stompClient.connect(headers, function() {
                connected.resolve('success');
                sendActivity();
                if (!alreadyConnectedOnce) {
                    stateChangeStart = $rootScope.$on('$stateChangeStart', function () {
                        sendActivity();
                    });
                    alreadyConnectedOnce = true;
                }
            });
            $rootScope.$on('$destroy', function () {
                if(angular.isDefined(stateChangeStart) && stateChangeStart !== null){
                    stateChangeStart();
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
                    angular.toJson({'page': $rootScope.toState.name}));
            }
        }

        function subscribe () {
            connected.promise.then(function() {
                subscriber = stompClient.subscribe('/topic/tracker', function(data) {
                    listener.notify(angular.fromJson(data.body));
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
