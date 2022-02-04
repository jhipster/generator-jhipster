import Spy = jasmine.Spy;
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SpyObject } from './spyobject';

export class MockActiveModal extends SpyObject {
  dismissSpy: Spy;
  closeSpy: Spy;

  constructor() {
    super(NgbActiveModal);
    this.dismissSpy = this.spy('dismiss').andReturn(this);
    this.closeSpy = this.spy('close').andReturn(this);
  }
}
