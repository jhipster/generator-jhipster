import { Injectable } from '@angular/core';
import { CanActivate, Routes } from '@angular/router';

import {SettingsComponent} from './settings.component';

import {Principal} from '../../shared';

@Injectable()
export class SettingsResolve implements CanActivate {

  constructor(private principal: Principal) {}

  canActivate() {
    return this.principal.hasAnyAuthority(['ROLE_USER']);
  }
}
