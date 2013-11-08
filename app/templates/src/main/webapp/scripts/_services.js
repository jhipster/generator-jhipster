'use strict';

/* Services */

<%= baseName %>App.factory('Account', function($resource){
        return $resource('app/rest/account', {}, {
        });
    });

<%= baseName %>App.factory('Password', function($resource){
    return $resource('app/rest/account/change_password', {}, {
    });
});

<%= baseName %>App.factory('Sessions', function($resource){
    return $resource('app/rest/account/sessions/:series', {}, {
        'get': { method: 'GET', isArray: true}
    });
});

<%= baseName %>App.factory('Metrics', function($resource){
    return $resource('/metrics/metrics', {}, {
        'get': { method: 'GET'}
    });
});

<%= baseName %>App.factory('HealthChecks', function($resource){
    return $resource('/metrics/healthcheck', {}, {
        'get': { method: 'GET'}
    });
});

<%= baseName %>App.factory('AuthenticationSharedService', function($rootScope) {
    var authenticationSharedService = {};

    authenticationSharedService.message = '';

    authenticationSharedService.prepForBroadcast = function(msg) {
        this.message = msg;
        this.broadcastItem();
    };

    authenticationSharedService.broadcastItem = function() {
        $rootScope.$broadcast("authenticationEvent");
    };

    return authenticationSharedService;
});
