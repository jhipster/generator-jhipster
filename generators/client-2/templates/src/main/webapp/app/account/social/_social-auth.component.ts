import { Component, OnInit, Inject } from '@angular/core';
import { StateService } from 'ui-router-ng2';
import { AuthService } from '../../shared';
import { LoginService } from '../../shared';

@Component({
    selector: '<%=jhiPrefix%>-auth',
    templateUrl: 'app/shared/login/login.html'
})
export class SocialAuthComponent implements OnInit {

    constructor (private $state: StateService,
                private $document: Document,
                private Auth: AuthService,
                private loginService: LoginService
                ) {}

    ngOnInit() {
        //let token = this.$document.cookie.get('social-authentication');
        let doc = this.$document;
        if (doc) {
            let token;
            let name = 'social-authentication';
            let ca = doc.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) !== -1) {
                    token = c.substring(name.length, c.length);
                    break;
                }
            }
            this.loginService.loginWithToken(token, false).then(() => {
                    let doc = this.$document.cookie;
                    let b = doc.indexOf('social-authentication');
                    let e = doc.indexOf(';', b);
                    doc = doc.substring(b, e) + doc.substring(e);
                    //this.$document.cookie.remove('social-authentication');
                    this.Auth.authorize(true);
                 }, () => {
                    this.$state.go('social-register', {'success': 'false'});
            });
        }
    }
}
