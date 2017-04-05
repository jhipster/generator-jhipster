import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../';
import { Principal } from '../';
import { LoginModalService } from '../login/login-modal.service';
import { StateStorageService } from './state-storage.service';

@Injectable()
export class UserRouteAccessService implements CanActivate {

    constructor(private router: Router,
                private loginModalService: LoginModalService,
                private principal: Principal,
                private stateStorageService: StateStorageService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {
        return this.checkLogin(route.data['authorities'], state.url);
    }

    checkLogin(authorities: string[], url: string): Promise<boolean> {
        return Promise.resolve(this.principal.hasAnyAuthority(authorities).then(isOk => {
            if (isOk) {
                return true;
            } else {
                this.stateStorageService.storeUrl(url);
                this.router.navigate(['accessdenied']).then(() => {
                    this.loginModalService.open();
                });
                return false;
            }
        }));
    }
}
