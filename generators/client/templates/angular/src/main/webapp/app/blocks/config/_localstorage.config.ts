import { KeyStorageHelper } from 'ng2-webstorage';

export function localStorageConfig() {
    KeyStorageHelper.setStorageKeyPrefix('jhi-');
}
