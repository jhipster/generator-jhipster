(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('ActiveProfiles', ActiveProfiles);

    ActiveProfiles.$inject = ['$q', '$resource'];

    function ActiveProfiles($q, $resource) {

        var _activeProfiles;

        var service = {
            activeProfiles : activeProfiles
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

        function activeProfiles() {
            var deferred = $q.defer();
            if (angular.isDefined(_activeProfiles)) {
                deferred.resolve(_activeProfiles);
            } else {
                rest().get(function(result) {
                    if (result.data.activeProfiles) {
                        var response = {};
                        response.activeProfiles = result.data.activeProfiles;
                        response.ribbonEnv = result.data.ribbonEnv;
                        response.inProduction = result.data.activeProfiles.indexOf("prod") !== -1;
                        _activeProfiles = response;
                        deferred.resolve(response);
                    }
                });
            }

            return deferred.promise;
        }
    }
})();
