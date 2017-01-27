import { Injectable } from '@angular/core';
<%_ if (enableTranslation) { _%>
import { JhiLanguageService } from 'ng-jhipster';
<%_ } _%>

import { Principal } from '../auth/principal.service';
<%_ if (authenticationType === 'oauth2') { _%>
import { AuthServerProvider } from '../auth/auth-oauth2.service';
<%_ } else if (authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthServerProvider } from '../auth/auth-jwt.service';
<%_ } else if (authenticationType === 'session') { _%>
import { AuthServerProvider } from '../auth/auth-session.service';
<%_ } _%>
<%_ if (websocket === 'spring-websocket') { _%>
import { <%=jhiPrefixCapitalized%>TrackerService } from '../tracker/tracker.service';
<%_ } _%>

@Injectable()
export class LoginService {

    constructor (
        <%_ if (enableTranslation) { _%>
        private languageService: JhiLanguageService,
        <%_ } _%>
        private principal: Principal,
        <%_ if (websocket === 'spring-websocket') { _%>
        private trackerService: <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
        <%_ if (!skipServer) { _%>
        private authServerProvider: AuthServerProvider
        <%_ } _%>
    ) {}

    login (credentials, callback?) {
        let cb = callback || function() {};

        return new Promise((resolve, reject) => {
            this.authServerProvider.login(credentials).subscribe(data => {
                this.principal.identity(true).then(account => {
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
            }, err => {
                this.logout();
                reject(err);
                return cb(err);
            });
        });
    }
    <%_ if (authenticationType == 'jwt') { _%>
    loginWithToken(jwt, rememberMe) {
        return this.authServerProvider.loginWithToken(jwt, rememberMe);
    }
    <%_ } _%>

    logout () {
        this.authServerProvider.logout().subscribe();
        this.principal.authenticate(null);
    }
}
