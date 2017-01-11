import { Injectable } from '@angular/core';
import { CanActivate, Routes } from '@angular/router';

import {SettingsComponent} from './settings.component';

export const settingsRoute: Routes = [
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [SettingsResolve]
  }
];
