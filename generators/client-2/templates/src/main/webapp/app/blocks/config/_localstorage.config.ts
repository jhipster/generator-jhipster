(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>.common')
        .config(localStorageConfig);

    localStorageConfig.$inject = ['$localStorageProvider', '$sessionStorageProvider'];

    function localStorageConfig($localStorageProvider, $sessionStorageProvider) {
      $localStorageProvider.setKeyPrefix('jhi-');
      $sessionStorageProvider.setKeyPrefix('jhi-');
    }
})();
