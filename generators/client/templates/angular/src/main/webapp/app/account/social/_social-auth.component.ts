import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { JhiLanguageService } from 'ng-jhipster';
import { AuthService, LoginService } from '../../shared';
import { CookieService } from 'angular2-cookie/core';

@Component({
    selector: '<%=jhiPrefix%>-auth',
    templateUrl: '../../shared/login/login.component.html'
})
export class SocialAuthComponent implements OnInit {

    constructor (
        private jhiLanguageService: JhiLanguageService,
        private Auth: AuthService,
        private loginService: LoginService,
        private cookieService: CookieService,
        private router: Router
    ) {
        this.jhiLanguageService.setLocations(['social']);
    }

    ngOnInit() {
        let token = this.cookieService.get('social-authentication');
        if (token.length) {
            this.loginService.loginWithToken(token, false).then(() => {
                    this.cookieService.remove('social-authentication');
                    this.Auth.authorize(true);
                 }, () => {
                    this.router.navigate(['social-register'], {queryParams: {'success': 'false'}});
            });
        }
    }
}
