import { Component, OnInit, Inject } from '@angular/core';
import { StateService } from "ui-router-ng2";
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { ProfileService } from '../profiles/profile.service'; //barrel doesnt work here
import { <% if (enableTranslation){ %><%=jhiPrefixCapitalized%>LanguageService, <% } %>Principal, LoginModalService, LoginService } from '../../shared';

@Component({
    selector: 'navbar',
    templateUrl: './navbar.html'
})
export class NavbarComponent implements OnInit {

    inProduction: boolean;
    isNavbarCollapsed: boolean;
    languages: any[];
    swaggerEnabled: boolean;
    modalRef: NgbModalRef;

    constructor(
        private $state: StateService,
        private loginService : LoginService,
        <%_ if (enableTranslation){ _%>
        private languageService: <%=jhiPrefixCapitalized%>LanguageService,
        <%_ } _%>
        private principal: Principal,
        private loginModalService: LoginModalService,
        private profileService: ProfileService
    ) { }

    ngOnInit() {
        <%_ if (enableTranslation){ _%>
        this.languageService.getAll().then((languages) => {
            this.languages = languages;
        });
        <%_ } _%>

        this.profileService.getProfileInfo().subscribe(profileInfo => {
            this.inProduction = profileInfo.inProduction;
            this.swaggerEnabled = profileInfo.swaggerEnabled;
        });
    }

    <%_ if (enableTranslation){ _%>
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
