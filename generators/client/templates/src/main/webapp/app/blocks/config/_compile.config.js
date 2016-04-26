(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(compileServiceConfig);

    compileServiceConfig.$inject = ['$compileProvider'];

    function compileServiceConfig($compileProvider) {
        // disable debug data on prod profile to improve performance
        
        // TODO: Howto fetch the dynamic profile in this config.... can this be done elsewhere ?
        // if(ENV === 'prod'){
        //     $compileProvider.debugInfoEnabled(false);
        // }

        /*
        If you wish to debug an application with this information
        then you should open up a debug console in the browser
        then call this method directly in this console:

		angular.reloadWithDebugInfo();
		*/
    }
})();
