import { Injectable } from '@angular/core';
import { CanActivate, Routes } from '@angular/router';

import {SessionComponent} from './session.component';

import {Principal} from '../../shared';

@Injectable()
export class SessionResolve implements CanActivate {

  constructor(private principal: Principal) {}

  canActivate() {
    return this.principal.hasAnyAuthority(['ROLE_USER']);
  }
}
