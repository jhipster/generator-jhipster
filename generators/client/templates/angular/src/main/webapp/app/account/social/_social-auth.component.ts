import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService, LoginService } from '../../shared';
import { CookieService } from 'angular2-cookie/core';

@Component({
    selector: '<%=jhiPrefix%>-auth',
    templateUrl: './login.component.html'
})
export class SocialAuthComponent implements OnInit {

    constructor (
        private jhiLanguageService: JhiLanguageService,
        private Auth: AuthService,
        private loginService: LoginService,
        private cookieService: CookieService,
        private router: Router
    ) {
        this.languageService.setLocations(['social']);
    }

    ngOnInit() {
        let token = this.cookieService.get('social-authentication')
        if (token.length) {
            this.loginService.loginWithToken(token, false).then(() => {
                    this.cookieService.remove('social-authentication');
                    this.Auth.authorize(true);
                 }, () => {
                    this.router.navigate(['social-register'], {params: {'success': 'false'}});
            });
        }
    }
}
