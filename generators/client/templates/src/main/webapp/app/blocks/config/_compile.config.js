(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(compileServiceConfig);

    compileServiceConfig.$inject = ['$compileProvider', 'ENV'];

    function compileServiceConfig($compileProvider, ENV) {
        // disable debug data on prod profile to improve performance
        if(ENV === 'prod'){
            $compileProvider.debugInfoEnabled(false);
        }

        /*
        If you wish to debug an application with this information
        then you should open up a debug console in the browser
        then call this method directly in this console:

		angular.reloadWithDebugInfo();
		*/
    }
})();
