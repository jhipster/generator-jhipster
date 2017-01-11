import { Injectable } from '@angular/core';
import { Routes, CanActivate } from '@angular/router';

import { LogsComponent } from './logs.component';
import { Principal } from '../../shared';


export const logsRoute: Routes = [
  {
    path: 'logs',
    component: LogsComponent,
    canActivate: [LogsResolve]
  }
];
