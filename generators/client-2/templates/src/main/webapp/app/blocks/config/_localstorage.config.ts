LocalStorageConfig.$inject = ['$localStorageProvider', '$sessionStorageProvider'];

export function LocalStorageConfig($localStorageProvider, $sessionStorageProvider) {
  $localStorageProvider.setKeyPrefix('jhi-');
  $sessionStorageProvider.setKeyPrefix('jhi-');
}
