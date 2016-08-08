import {Component, OnInit, Inject} from '@angular/core';

import {ProfileService} from "../../components/profiles/profile.service";
import {FindLanguageFromKeyPipe} from "../../components/language/language.pipe";

@Component({
    pipes: [FindLanguageFromKeyPipe],
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
                @Inject('<%=jhiPrefixCapitalized%>LanguageService') private languageService,
                @Inject('LoginService') private loginService,
                private profileService: ProfileService) { }

    ngOnInit() {
        //TODO: Remove this once language service in migrated and use 'subscribe' instead of 'then'
        let vm = this;

        this.languageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        this.changeLanguage = this.languageService.changeLanguage;

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
