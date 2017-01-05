import { Component, OnInit } from '@angular/core';
import { StateService } from 'ui-router-ng2';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiLanguageService } from 'ng-jhipster';

import { ProfileService } from '../profiles/profile.service'; // FIXME barrel doesnt work here
import { <% if (enableTranslation) { %>JhiLanguageHelper, <% } %>Principal, LoginModalService, LoginService } from '../../shared';

import { VERSION, DEBUG_INFO_ENABLED } from '../../app.constants';

@Component({
    selector: '<%=jhiPrefix%>-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: [
        <%_ if (useSass) { _%>
        'navbar.scss'
        <%_ } else { _%>
        'navbar.css'
        <%_ } _%>
    ]
})
export class NavbarComponent implements OnInit {

    inProduction: boolean;
    isNavbarCollapsed: boolean;
    languages: any[];
    swaggerEnabled: boolean;
    modalRef: NgbModalRef;
    version: string;

    constructor(
        private $state: StateService,
        private loginService: LoginService,
        <%_ if (enableTranslation) { _%>
        private languageHelper: JhiLanguageHelper,
        private languageService: JhiLanguageService,
        <%_ } _%>
        private principal: Principal,
        private loginModalService: LoginModalService,
        private profileService: ProfileService
    ) {
        this.version = DEBUG_INFO_ENABLED ? 'v' + VERSION : '';
        this.isNavbarCollapsed = true;
    }

    ngOnInit() {
        <%_ if (enableTranslation) { _%>
        this.languageHelper.getAll().then((languages) => {
            this.languages = languages;
        });
        <%_ } _%>

        this.profileService.getProfileInfo().subscribe(profileInfo => {
            this.inProduction = profileInfo.inProduction;
            this.swaggerEnabled = profileInfo.swaggerEnabled;
        });
    }

    <%_ if (enableTranslation) { _%>
    changeLanguage(languageKey: string) {
      this.languageService.changeLanguage(languageKey);
    }
    <%_ } _%>

    collapseNavbar() {
        this.isNavbarCollapsed = true;
    }

    isAuthenticated() {
        return this.principal.isAuthenticated();
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }

    logout() {
        this.collapseNavbar();
        this.loginService.logout();
        this.$state.go('home');
    }

    toggleNavbar() {
        this.isNavbarCollapsed = !this.isNavbarCollapsed;
    }
}
