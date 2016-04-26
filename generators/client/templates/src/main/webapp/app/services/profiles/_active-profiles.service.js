(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .service('ActiveProfiles', ActiveProfiles);

    ActiveProfiles.$inject = ['$q','$resource'];

    function ActiveProfiles ($q, $resource) {

        var _activeProfiles,_ribbonEnv,_inProduction,_response;

	    var service = {
	    	activeProfiles: activeProfiles,	    		
	    	ribbonEnv: ribbonEnv,
	        inProduction: inProduction,
	        fetch:fetch
	    };

	    return service;
    	
	    function fetch() {
	        var deferred = $q.defer();
	        if (angular.isDefined(_response)) {
	        	deferred.resolve(_response);
	        	return deferred.promise;
	        }
	        
	    	rest().get(function(result) {
	            if (result.data.activeProfiles) {
        			var response = {};
        			response.activeProfiles=result.data.activeProfiles;
        			response.ribbonEnv=result.data.ribbonEnv;
        			response.inProduction=result.data.activeProfiles.indexOf("prod")!=-1;
        			_response = response;
        			deferred.resolve(response)
	            }
	        })
	        
	        return deferred.promise;	    	
	    }
    	
        function rest() { 
        	
        	return $resource('api/activeProfiles', {}, {
        		'get': { method: 'GET', params: {}, isArray: false,
                interceptor: {
                    response: function(response) {
                        // expose response
                        return response;
                    }
                }
            }});
        }
        
        function inProduction() {
        	return _inProduction;
        }
        
        function ribbonEnv() {
        	return _ribbonEnv;
        }
        
        function activeProfiles() {
        	return _activeProfiles;
        }
    }
})();