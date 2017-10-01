<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { Principal } from '../';
<%_ if (authenticationType !== 'oauth2') { _%>
import { LoginModalService } from '../login/login-modal.service';
<%_ } else { _%>
import { LoginService } from '../login/login.service';
<%_ } _%>
import { StateStorageService } from './state-storage.service';

@Injectable()
export class UserRouteAccessService implements CanActivate {

    constructor(private router: Router,
                <%_ if (authenticationType !== 'oauth2') { _%>
                private loginModalService: LoginModalService,
                <%_ } else { _%>
                private loginService: LoginService,
                <%_ } _%>
                private principal: Principal,
                private stateStorageService: StateStorageService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean> {

        const authorities = route.data['authorities'];
        // We need to call the checkLogin / and so the principal.identity() function, to ensure,
        // that the client has a principal too, if they already logged in by the server.
        // This could happen on a page refresh.
        return this.checkLogin(authorities, state.url);
    }

    checkLogin(authorities: string[], url: string): Promise<boolean> {
        const principal = this.principal;
        return Promise.resolve(principal.identity().then((account) => {

            if (!authorities || authorities.length === 0) {
                return true;
            }

            if (account) {
              return principal.hasAnyAuthority(authorities).then(
                (response) => {
                  if (response) {
                    return true;
                  }
                  return false;
                }
              );
            }

            this.stateStorageService.storeUrl(url);
            this.router.navigate(['accessdenied']).then(() => {
                // only show the login dialog, if the user hasn't logged in yet
                if (!account) {
                    <%_ if (authenticationType !== 'oauth2') { _%>
                    this.loginModalService.open();
                    <%_ } else { _%>
                    this.loginService.login();
                    <%_ } _%>
                }
            });
            return false;
        }));
    }
}
