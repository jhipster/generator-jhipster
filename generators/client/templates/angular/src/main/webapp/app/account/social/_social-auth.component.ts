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
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { LoginService } from '../../shared';
import { CookieService } from 'ngx-cookie';

@Component({
    selector: '<%=jhiPrefix%>-auth',
    template: ''
})
export class SocialAuthComponent implements OnInit {

    constructor(
        private loginService: LoginService,
        private cookieService: CookieService,
        private router: Router
    ) {
    }

    ngOnInit() {
        const token = this.cookieService.get('social-authentication');
        if (token.length) {
            this.loginService.loginWithToken(token, false).then(() => {
                    this.cookieService.remove('social-authentication');
                    this.router.navigate(['']);
                 }, () => {
                    this.router.navigate(['social-register'], {queryParams: {'success': 'false'}});
            });
        }
    }
}
