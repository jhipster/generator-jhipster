import Spy = jasmine.Spy;

import { SpyObject } from './spyobject';
import { LoginModalService } from 'app/core/login/login-modal.service';

export class MockLoginModalService extends SpyObject {
  open: Spy;

  constructor() {
    super(LoginModalService);

    this.open = this.spy('open');
  }
}
