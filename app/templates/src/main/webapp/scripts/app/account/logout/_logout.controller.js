'use strict';

angular.module('<%=angularAppName%>')
    .controller('LogoutController', function (Auth) {
        Auth.logout();
    });
