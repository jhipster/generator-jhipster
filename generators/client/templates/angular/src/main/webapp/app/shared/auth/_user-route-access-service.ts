import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

import { Principal } from '../';

@Injectable()
export class UserRouteAccessService implements CanActivate {

    constructor(private router: Router, private principal: Principal) {
    }

    canActivate(route: ActivatedRouteSnapshot): boolean | Promise<boolean> {
        let authorities: string[] = route.data['authorities'];

        if (authorities.length === 0) {
            return true;
        }

        return this.principal.identity().then(account => {
            let authorized: boolean = this.principal.hasAnyAuthority(authorities);
            if (!authorized) {
                this.router.navigate(['/accessdenied']);
            }
            return authorized;
        });
    }
}
