'use strict';

angular.module('<%=angularAppName%>')
    .factory('SocialService', function ($http) {
        var socialService = {};

        socialService.getProviderSetting = function (provider) {
            switch(provider) {
                case 'google': return 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email';
                case 'facebook': return 'public_profile,email';
                case 'twitter': return '';
                default: return 'Provider setting not defined';
            }
        };

        socialService.getProviderURL = function (provider) {
            return 'signin/' + provider;
        };

        socialService.getCSRF = function () {
            var name = "CSRF-TOKEN=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') c = c.substring(1);
                if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
            }
            return "";
        };

        return socialService;
    });
