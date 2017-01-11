import { AuditsComponent } from './audits.component';
import { Principal } from '../../shared';


export const auditsRoute: Routes = [
  {
    path: 'audits',
    component: AuditsComponent,
    canActivate: [AuditsResolve]
  }
];
