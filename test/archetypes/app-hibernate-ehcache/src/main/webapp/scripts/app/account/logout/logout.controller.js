'use strict';

angular.module('jhipsterApp')
    .controller('LogoutController', function (Auth) {
        Auth.logout();
    });
