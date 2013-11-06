'use strict';

/* Services */

<%= baseName %>App.factory('Account', function($resource){
        return $resource('app/rest/account', {}, {
        });
    });

<%= baseName %>App.factory('Password', function($resource){
    return $resource('app/rest/change_password', {}, {
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
