(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('ProfileService', ProfileService);

    ProfileService.$inject = ['$q', '$http'];

    function ProfileService($q, $http) {

        var dataPromise;

        var service = {
            getProfileInfo : getProfileInfo
        };

        return service;

        function getProfileInfo() {
            if (angular.isUndefined(dataPromise)) {
                dataPromise = $http.get('api/profile-info').then(function(result) {
                    if (result.data.activeProfiles) {
                        var response = {};
                        response.activeProfiles = result.data.activeProfiles;
                        response.ribbonEnv = result.data.ribbonEnv;
                        response.inProduction = result.data.activeProfiles.indexOf("prod") !== -1;
                        response.swaggerDisabled = result.data.activeProfiles.indexOf("no-swagger") !== -1;
                        return response;
                    }
                });
            }
            return dataPromise;
        }
    }
})();
