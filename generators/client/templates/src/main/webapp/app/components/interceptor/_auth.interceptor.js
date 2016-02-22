(function() {
  'use strict';

  angular.module('<%=angularAppName%>')<% if (authenticationType == 'oauth2' || authenticationType == 'jwt') { %>
      .factory('authInterceptor', function ($rootScope, $q, $location, $localStorage, $sessionStorage) {
          return {
              // Add authorization token to headers
              request: function (config) {
                  /*jshint camelcase: false */
                  config.headers = config.headers || {};
                  var token = $localStorage.authenticationToken || $sessionStorage.authenticationToken;
                  <% if (authenticationType == 'oauth2') { %>
                  if (token && token.expires_at && token.expires_at > new Date().getTime()) {
                      config.headers.Authorization = 'Bearer ' + token.access_token;
                  }
                  <% } %><% if (authenticationType == 'jwt') { %>
                  if (token) {
                    config.headers.Authorization = 'Bearer ' + token;
                  }
                  <% } %>
                  return config;
              }
          };
      })<% } %><% if (authenticationType === 'oauth2' || authenticationType === 'jwt') { %>
      .factory('authExpiredInterceptor', function ($rootScope, $q, $injector, $localStorage, $sessionStorage) {
          return {
              responseError: function (response) {
                  // token has expired
                  if (response.status === 401) {
                      delete $localStorage.authenticationToken;
                      delete $sessionStorage.authenticationToken;
                      var Principal = $injector.get('Principal');
                      if (Principal.isAuthenticated()) {
                          var Auth = $injector.get('Auth');
                          Auth.authorize(true);
                      }
                  }
                  return $q.reject(response);
              }
          };
      })<% } %><% if (authenticationType === 'session') { %>
      /* globals document */
      .factory('authExpiredInterceptor', function ($rootScope, $q, $injector) {
          function getCSRF() {
              var name = 'CSRF-TOKEN=';
              var ca = document.cookie.split(';');
              for (var i = 0; i < ca.length; i++) {
                  var c = ca[i];
                  while (c.charAt(0) === ' ') {c = c.substring(1);}

                  if (c.indexOf(name) !== -1) {
                      return c.substring(name.length, c.length);
                  }
              }
              return '';
          }

          function afterCSRFRenewed(oldResponse) {
              if (getCSRF() !== '') {
                  // retry the old request after the new CSRF-TOKEN is obtained
                  var $http = $injector.get('$http');
                  return $http(oldResponse.config);
              } else {
                  // unlikely get here but reject with the old response any way and avoid infinite loop
                  return $q.reject(oldResponse);
              }
          }

          return {
              responseError: function(response) {
                  // If we have an unauthorized request we redirect to the login page
                  // Don't do this check on the account API to avoid infinite loop
                  if (response.status === 401 && response.data.path !== undefined && response.data.path.indexOf('/api/account') === -1){
                      var Auth = $injector.get('Auth');
                      var $state = $injector.get('$state');
                      var to = $rootScope.toState;
                      var params = $rootScope.toStateParams;
                      Auth.logout();
                      $rootScope.previousStateName = to;
                      $rootScope.previousStateNameParams = params;
                      var LoginPopupService = $injector.get('LoginService');
                      LoginPopupService.open();
                  } else if (response.status === 403 && response.config.method !== 'GET' && getCSRF() === '') {
                      // If the CSRF token expired, then try to get a new CSRF token and retry the old request
                      var $http = $injector.get('$http');
                      return $http.get('/').finally(function() { return afterCSRFRenewed(response); });
                  }
                  return $q.reject(response);
              }
          };
      })<% } %>;
})();
