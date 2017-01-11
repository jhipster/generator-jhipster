import { AuditsComponent } from './audits.component';
import { Principal } from '../../shared';

<<<<<<< HEAD
=======
@Injectable()
export class AuditsResolve implements CanActivate {

  constructor(private principal: Principal) {}

  canActivate() {
  	return this.principal.identity().then(account => this.principal.hasAnyAuthority(['ROLE_ADMIN']));
  }

}
>>>>>>> polishing

export const auditsRoute: Routes = [
  {
    path: 'audits',
    component: AuditsComponent,
    canActivate: [AuditsResolve]
  }
];
