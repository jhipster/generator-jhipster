(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(localStorageConfig);

    localStorageConfig.$inject = ['$localStorageProvider', '$sessionStorageProvider'];

    function localStorageConfig($localStorageProvider) {
        $localStorageProvider.setKeyPrefix('jhi-');
        $sessionStorageProvider.setKeyPrefix('jhi-');
    }
})();
