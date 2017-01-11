import { Injectable } from '@angular/core';
import { CanActivate, Routes } from '@angular/router';

import {PasswordComponent} from './password.component';

import {Principal} from '../../shared';

@Injectable()
export class PasswordResolve implements CanActivate {

  constructor(private principal: Principal) {}

  canActivate() {
    return this.principal.hasAnyAuthority(['ROLE_USER']);
  }
}
