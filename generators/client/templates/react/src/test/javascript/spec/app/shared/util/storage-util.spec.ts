import { expect } from 'chai';

import Storage, { StorageType, getStorage } from './../../../../../../main/webapp/app/shared/util/storage-util';

describe('Storage', () => {
  describe('getStorage', () => {
    it('should return appropriate storage type', () => {
      let out = getStorage(StorageType.SESSION);
      expect(out).to.eql(window.sessionStorage);
      out = getStorage(StorageType.LOCAL);
      expect(out).to.eql(window.localStorage);
    });
  });
  describe('set', () => {
    it('should set key for correct storage type', () => {
      Storage.session.set('testKey', 'testVal');
      let out = window.sessionStorage.getItem('testKey');
      expect(out).to.eql('testVal');
      Storage.local.set('testKey', 'testVal');
      out = window.localStorage.getItem('testKey');
      expect(out).to.eql('testVal');
    });
  });
  describe('get', () => {
    it('should return key from correct storage type', () => {
      window.sessionStorage.setItem('testKey', 'testVal');
      let out = Storage.session.get('testKey');
      expect(out).to.eql('testVal');
      window.localStorage.setItem('testKey', 'testVal');
      out = Storage.local.get('testKey');
      expect(out).to.eql('testVal');
    });
  });
  describe('remove', () => {
    it('should remove key from correct storage type', () => {
      window.sessionStorage.setItem('testKey', 'testVal');
      Storage.session.remove('testKey');
      let out = window.sessionStorage.getItem('testKey');
      expect(out).to.eql(null);
      window.localStorage.setItem('testKey', 'testVal');
      Storage.local.remove('testKey');
      out = window.localStorage.getItem('testKey');
      expect(out).to.eql(null);
    });
  });
});
