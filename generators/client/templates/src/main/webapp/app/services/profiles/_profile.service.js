(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('ProfileService', ProfileService);

    ProfileService.$inject = ['$q', '$resource'];

    function ProfileService($q, $resource) {

        var dataPromise;

        var service = {
            profileInfo : profileInfo
        };

        return service;

        function rest() {

            return $resource('api/activeProfiles', {}, {
                'get' : {
                    method : 'GET',
                    params : {},
                    isArray : false,
                    interceptor : {
                        response : function(response) {
                            // expose response
                            return response;
                        }
                    }
                }
            });
        }

        function profileInfo() {
            if (dataPromise===null) {
                dataPromise = rest().get().$promise.then(function(result) {
                    if (result.data.activeProfiles) {
                        var response = {};
                        response.activeProfiles = result.data.activeProfiles;
                        response.ribbonEnv = result.data.ribbonEnv;
                        response.inProduction = result.data.activeProfiles.indexOf("prod") !== -1;
                        return response;
                    }
                });
            }
            return dataPromise;
        }
    }
})();
