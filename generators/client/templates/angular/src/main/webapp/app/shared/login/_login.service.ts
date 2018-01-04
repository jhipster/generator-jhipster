<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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
<%_ if (enableTranslation && !(authenticationType === 'oauth2')) { _%>
import { JhiLanguageService } from 'ng-jhipster';
<%_ } _%>

import { Principal } from '../auth/principal.service';
<%_ if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthServerProvider } from '../auth/auth-jwt.service';
<%_ } else if (authenticationType === 'session' || authenticationType === 'oauth2') { _%>
import { AuthServerProvider } from '../auth/auth-session.service';
<%_ } _%>
<%_ if (websocket === 'spring-websocket') { _%>
import { <%=jhiPrefixCapitalized%>TrackerService } from '../tracker/tracker.service';
<%_ } _%>

@Injectable()
export class LoginService {

    constructor(
        <%_ if (enableTranslation && !(authenticationType === 'oauth2')) { _%>
        private languageService: JhiLanguageService,
        <%_ } _%>
        private principal: Principal,
        <%_ if (websocket === 'spring-websocket') { _%>
        private trackerService: <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
        private authServerProvider: AuthServerProvider
    ) {}

    <%_ if (authenticationType === 'oauth2') { _%>
    login() {
        let port = (location.port ? ':' + location.port : '');
        if (port === ':9000') {
            port = ':<%= serverPort %>';
        }
        location.href = '//' + location.hostname + port + '/login';
    }
    <%_ } else { _%>
    login(credentials, callback?) {
        const cb = callback || function() {};

        return new Promise((resolve, reject) => {
            this.authServerProvider.login(credentials).subscribe((data) => {
                this.principal.identity(true).then((account) => {
                    <%_ if (enableTranslation) { _%>
                    // After the login the language will be changed to
                    // the language selected by the user during his registration
                    if (account !== null) {
                        this.languageService.changeLanguage(account.langKey);
                    }
                    <%_ } _%>
                    <%_ if (websocket === 'spring-websocket') { _%>
                    this.trackerService.sendActivity();
                    <%_ } _%>
                    resolve(data);
                });
                return cb();
            }, (err) => {
                this.logout();
                reject(err);
                return cb(err);
            });
        });
    }
    <%_ } _%>
    <%_ if (authenticationType === 'jwt') { _%>

    loginWithToken(jwt, rememberMe) {
        return this.authServerProvider.loginWithToken(jwt, rememberMe);
    }
    <%_ } _%>

    logout() {
        <%_ if (authenticationType === 'uaa') { _%>
        if (this.principal.isAuthenticated()) {
            this.authServerProvider.logout().subscribe(() => this.principal.authenticate(null));
        } else {
            this.principal.authenticate(null);
        }
        <%_ } else { _%>
        this.authServerProvider.logout().subscribe();
        this.principal.authenticate(null);
        <%_ } _%>
    }
}
