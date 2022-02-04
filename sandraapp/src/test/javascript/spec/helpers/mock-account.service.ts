import Spy = jasmine.Spy;
import { of } from 'rxjs';

import { SpyObject } from './spyobject';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/user/account.model';

export class MockAccountService extends SpyObject {
  getSpy: Spy;
  saveSpy: Spy;
  authenticateSpy: Spy;
  identitySpy: Spy;
  getAuthenticationStateSpy: Spy;
  isAuthenticated: Spy;

  constructor() {
    super(AccountService);

    this.getSpy = this.spy('get').andReturn(this);
    this.saveSpy = this.spy('save').andReturn(this);
    this.authenticateSpy = this.spy('authenticate').andReturn(this);
    this.identitySpy = this.spy('identity').andReturn(of(null));
    this.getAuthenticationStateSpy = this.spy('getAuthenticationState').andReturn(of(null));
    this.isAuthenticated = this.spy('isAuthenticated').andReturn(true);
  }

  setIdentityResponse(account: Account | null): void {
    this.identitySpy = this.spy('identity').andReturn(of(account));
    this.getAuthenticationStateSpy = this.spy('getAuthenticationState').andReturn(of(account));
  }
}
