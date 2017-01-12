import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

import {Principal} from '../shared';

@Injectable()
export class RouteCanActivate implements CanActivate {

    constructor(private router: Router, private principal: Principal) {
    }

    canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        let authorities = route.data['authorities'];
        return this.principal.identity().then(account => {
            let authorized: boolean = this.principal.hasAnyAuthority(authorities);
            if (!authorized) {
                this.router.navigate(['/accessdenied']);
            }
            return authorized;
        });
    }
}
