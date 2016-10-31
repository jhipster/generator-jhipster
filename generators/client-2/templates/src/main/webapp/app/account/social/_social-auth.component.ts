import { Component, OnInit, Inject } from '@angular/core';
import { StateService } from 'ui-router-ng2';
import { AuthService, LoginService } from '../../shared';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
    selector: '<%=jhiPrefix%>-auth',
    templateUrl: 'app/shared/login/login.html'
})
export class SocialAuthComponent implements OnInit {

    constructor (
        private $state: StateService,
        private Auth: AuthService,
        private loginService: LoginService
    ) {}

    ngOnInit() {
        let token = Cookie.get('social-authentication')
        if (token.length) {
            this.loginService.loginWithToken(token, false).then(() => {
                    Cookie.delete('social-authentication');
                    this.Auth.authorize(true);
                 }, () => {
                    this.$state.go('social-register', {'success': 'false'});
            });
        }
    }
}
