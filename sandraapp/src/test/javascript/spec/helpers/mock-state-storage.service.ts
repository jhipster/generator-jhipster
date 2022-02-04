import Spy = jasmine.Spy;

import { SpyObject } from './spyobject';
import { StateStorageService } from 'app/core/auth/state-storage.service';

export class MockStateStorageService extends SpyObject {
  getUrlSpy: Spy;
  storeUrlSpy: Spy;
  clearUrlSpy: Spy;

  constructor() {
    super(StateStorageService);
    this.getUrlSpy = this.spy('getUrl').andReturn(null);
    this.storeUrlSpy = this.spy('storeUrl').andReturn(this);
    this.clearUrlSpy = this.spy('clearUrl').andReturn(this);
  }

  setResponse(previousUrl: string | null): void {
    this.getUrlSpy = this.spy('getUrl').andReturn(previousUrl);
  }
}
