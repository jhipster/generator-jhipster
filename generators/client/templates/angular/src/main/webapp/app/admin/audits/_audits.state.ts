import { AuditsComponent } from './audits.component';
import { Principal } from '../../shared';

@Injectable()
export class AuditsResolve implements Resolve<any>, CanActivate {

  constructor(private principal: Principal) {}

  canActivate() {
      return this.principal.hasAnyAuthority(['ROLE_ADMIN']);
  }

}

export const auditsRoute: Routes = [
  {
    path: 'audits',
    component: AuditsComponent,
    resolve: {
      'translate': AuditsResolve
    }
  }
];
