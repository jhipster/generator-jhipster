import { Component, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager } from 'ng-jhipster';

import { Account, LoginModalService, Principal } from '../shared';

@Component({
    selector: '<%=jhiPrefix%>-home',
    templateUrl: './home.component.html',
    styleUrls: [
        <%_ if (useSass) { _%>
        'home.scss'
        <%_ } else { _%>
        'home.css'
        <%_ } _%>
    ]

})
export class HomeComponent implements OnInit {
    account: Account;
    modalRef: NgbModalRef;

    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        private principal: Principal,
        private loginModalService: LoginModalService,
        private eventManager: EventManager
    ) {
         <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(['home']);
        <%_ } _%>
    }

    ngOnInit() {
        this.principal.identity().then((account) => {
            this.account = account;
        });
        this.registerAuthenticationSuccess();
    }

    registerAuthenticationSuccess() {
        this.eventManager.subscribe('authenticationSuccess', (message) => {
            this.principal.identity().then((account) => {
                this.account = account;
            });
        });
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }
}
