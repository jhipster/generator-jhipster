import { DEBUG_INFO_ENABLED } from '../../app.constants';

CompileServiceConfig.$inject = ['$compileProvider'];

export function CompileServiceConfig($compileProvider) {
    // disable debug data on prod profile to improve performance
    $compileProvider.debugInfoEnabled(DEBUG_INFO_ENABLED);

    /*
    If you wish to debug an application with this information
    then you should open up a debug console in the browser
    then call this method directly in this console:

	angular.reloadWithDebugInfo();
	*/
}
