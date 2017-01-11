import { Routes, CanActivate } from '@angular/router';

import { LogsComponent } from './logs.component';

export const logsRoute: Routes = [
  {
    path: 'logs',
    component: LogsComponent,
    canActivate: [LogsResolve]
  }
];
