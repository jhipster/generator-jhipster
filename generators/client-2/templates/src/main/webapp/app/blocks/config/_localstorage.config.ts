LocalStorageConfig.$inject = ['$localStorageProvider', '$sessionStorageProvider'];

function LocalStorageConfig($localStorageProvider, $sessionStorageProvider) {
  $localStorageProvider.setKeyPrefix('jhi-');
  $sessionStorageProvider.setKeyPrefix('jhi-');
}

export default LocalStorageConfig;
