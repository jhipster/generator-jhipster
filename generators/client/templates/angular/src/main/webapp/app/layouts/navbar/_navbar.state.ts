import { Route } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../shared';

// @Injectable()
// export class AuthorizeResolve implements Resolve<any> {
//
//   constructor(private authService: AuthService) {}
//
//   resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
//       return this.authService.authorize();
//   }
//
// }

export const navbarRoute: Route = {
  path: '',
  component: NavbarComponent,
  // TODO : Make this work
  // resolve: {
  //  'authorize': AuthorizeResolve
  // },
  outlet: 'navbar',
  data: {
    authorities: []
  },
  canActivate: [UserRouteAccessService]
};
