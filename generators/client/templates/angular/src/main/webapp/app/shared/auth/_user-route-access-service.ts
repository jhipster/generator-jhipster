import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

import { AuthService } from '../';
import { Principal } from '../';
import { LoginModalService } from '../login/login-modal.service';

@Injectable()
export class UserRouteAccessService implements CanActivate {

    constructor(private router: Router, private loginModalService: LoginModalService, private principal: Principal) {
    }

    canActivate(route: ActivatedRouteSnapshot): boolean | Promise<boolean> {
        return this.checkLogin(route.data['authorities']);
    }

    checkLogin(authorities: string[]): boolean {
        this.principal.hasAnyAuthority(authorities).then(isOk => {
            if (isOk) {
                return true;
            } else {
                this.router.navigate(['accessdenied']).then(() => {
                    this.loginModalService.open();
                });
                return false;
            }
        });

        // Store the attempted URL for redirecting
        //this.authService.redirectUrl = url;

        // Navigate to the login page with extras
        return false;
    }
}
