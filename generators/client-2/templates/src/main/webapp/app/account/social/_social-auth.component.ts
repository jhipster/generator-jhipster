import { Component, OnInit, Inject } from '@angular/core';
import { StateService } from 'ui-router-ng2';
import { AuthService } from '../../shared';
import { LoginService } from '../../shared';

@Component({
    selector: '<%=jhiPrefix%>-register',
    templateUrl: 'app/account/register/register.html'
})
export class SocialAuthComponent implements OnInit {

    constructor (private $state: StateService,
                @Inject('$cookies') private $cookies,
                private Auth: AuthService,
                private loginService: LoginService
                ) {}

    ngOnInit() {
        let token = this.$cookies.get('social-authentication');
        this.loginService.loginWithToken(token, false).then(() => {
            this.$cookies.remove('social-authentication');
            this.Auth.authorize(true);
         }, () => {
            this.$state.go('social-register', {'success': 'false'});
        });
    }
}
