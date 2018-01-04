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
import { Component, OnInit } from '@angular/core';
<%_ if (authenticationType !== 'oauth2') { _%>
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
<%_ } _%>
import { JhiEventManager } from 'ng-jhipster';

import { Account, <% if (authenticationType !== 'oauth2') { %>LoginModalService<% } else { %>LoginService<% } %>, Principal } from '../shared';

@Component({
    selector: '<%= jhiPrefixDashed %>-home',
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
    <%_ if (authenticationType !== 'oauth2') { _%>
    modalRef: NgbModalRef;
    <%_ } _%>

    constructor(
        private principal: Principal,
        <%_ if (authenticationType !== 'oauth2') { _%>
        private loginModalService: LoginModalService,
        <%_ } else { _%>
        private loginService: LoginService,
        <%_ } _%>
        private eventManager: JhiEventManager
    ) {
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
        <%_ if (authenticationType !== 'oauth2') { _%>
        this.modalRef = this.loginModalService.open();
        <%_ } else { _%>
        this.loginService.login();
        <%_ }_%>
    }
}
