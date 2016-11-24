import { Component, OnInit, Inject } from '@angular/core';
import { StateService } from 'ui-router-ng2';
import { AuthService, LoginService } from '../../shared';
import { CookieService } from 'angular2-cookie/core';

@Component({
    selector: '<%=jhiPrefix%>-auth',
    templateUrl: './login.html'
})
export class SocialAuthComponent implements OnInit {

    constructor (
        private $state: StateService,
        private Auth: AuthService,
        private loginService: LoginService,
        private cookieService: CookieService
    ) {}

    ngOnInit() {
        let token = this.cookieService.get('social-authentication')
        if (token.length) {
            this.loginService.loginWithToken(token, false).then(() => {
                    this.cookieService.remove('social-authentication');
                    this.Auth.authorize(true);
                 }, () => {
                    this.$state.go('social-register', {'success': 'false'});
            });
        }
    }
}
