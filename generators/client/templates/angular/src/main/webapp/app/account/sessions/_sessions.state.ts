import { CanActivate, Routes } from '@angular/router';

import {SessionsComponent} from './sessions.component';

<<<<<<< HEAD
export const sessionRoute: Routes = [
=======
import {Principal} from '../../shared';

@Injectable()
export class SessionsResolve implements CanActivate {

  constructor(private principal: Principal) {}

  canActivate() {
    return this.principal.identity().then(account => this.principal.hasAnyAuthority(['ROLE_USER']));
  }
}

export const sessionsRoute: Routes = [
>>>>>>> refactor layout routing and account
  {
    path: 'password',
    component: SessionsComponent,
    canActivate: [SessionsResolve]
  }
];