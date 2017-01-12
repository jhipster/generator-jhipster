import { Routes } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { AuditsComponent } from './audits.component';

export const auditsRoute: Routes = [
  {
    path: 'audits',
    component: AuditsComponent,
    data: { 
      authorities: ['ROLE_ADMIN'] 
    },
    canActivate: [UserRouteAccessService]
  }
];
