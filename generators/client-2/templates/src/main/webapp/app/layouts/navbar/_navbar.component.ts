import { Component, OnInit, Inject } from '@angular/core';

import { ProfileService } from '../../components/profiles/profile.service';
<%_ if (enableTranslation){ _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from '../../components/language/language.service';
<%_ } _%>

@Component({
    selector: 'navbar',
    templateUrl: 'app/layouts/navbar/navbar.html'
})
export class NavbarComponent implements OnInit {

    changeLanguage: Function;
    inProduction: boolean;
    isAuthenticated: Function;
    isNavbarCollapsed: boolean;
    languages: any[];
    swaggerEnabled: boolean;

    constructor(@Inject('Principal') private principal,
                @Inject('$state') private $state,
                @Inject('Auth') private auth,
                <%_ if (enableTranslation){ _%>
                private languageService: <%=jhiPrefixCapitalized%>LanguageService,
                <%_ } _%>
                @Inject('LoginService') private loginService,
                private profileService: ProfileService) { }

    ngOnInit() {
        //TODO: Remove this once language service in migrated and use 'subscribe' instead of 'then'
        let vm = this;
        <%_ if (enableTranslation){ _%>
        this.languageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        this.changeLanguage = this.languageService.changeLanguage;
        <%_ } _%>

        this.isAuthenticated = this.principal.isAuthenticated;
        this.profileService.getProfileInfo().subscribe(profileInfo => {
            this.inProduction = profileInfo.inProduction;
            this.swaggerEnabled = profileInfo.swaggerEnabled;
        });
    }

    collapseNavbar() {
        this.isNavbarCollapsed = true;
    }

    login() {
        this.collapseNavbar();
        this.loginService.open();
    }

    logout() {
        this.collapseNavbar();
        this.auth.logout();
        this.$state.go('home');
    }

    toggleNavbar() {
        this.isNavbarCollapsed = !this.isNavbarCollapsed;
    }
}
