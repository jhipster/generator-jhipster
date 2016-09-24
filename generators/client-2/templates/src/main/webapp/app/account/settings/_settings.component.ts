import {Component, Inject, OnInit} from '@angular/core';
<%_ if (enableTranslation){ _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from '../../components/language/language.service';
<%_ } _%>
@Component({
    selector: 'settings',
    templateUrl: 'app/account/settings/settings.html'
})
export class SettingsComponent implements OnInit {
    error: string;
    success: string;
    settingsAccount: any;
    languages: any[];
    Auth: any;
    Principal: any;
    <%_ if (enableTranslation){ _%>
    <%=jhiPrefixCapitalized%>LanguageService: any;
    <%_ } _%>

    constructor(@Inject('Auth') Auth, @Inject('Principal') Principal<%_ if (enableTranslation){ _%>, @Inject('$translate') private $translate,
                private languageService: <%=jhiPrefixCapitalized%>LanguageService <%_ } _%>) {
        this.Auth = Auth;
        this.Principal = Principal;
        <%_ if (enableTranslation){ _%>
        this.<%=jhiPrefixCapitalized%>LanguageService = <%=jhiPrefixCapitalized%>LanguageService;
        <%_ } _%>
    }

    ngOnInit () {
        this.Principal.identity().then(function (account) {
            this.settingsAccount = this.copyAccount(account);
        }.bind(this));
        <%_ if (enableTranslation){ _%>
        this.languageService.getAll().then(function (languages) {
            this.languages = languages;
        }.bind(this));
        <%_ } _%>
    }

    save () {
        let vm = this;
        this.Auth.updateAccount(vm.settingsAccount).then(function() {
            vm.error = null;
            vm.success = 'OK';
            vm.Principal.identity(true).then(function(account) {
                vm.settingsAccount = vm.copyAccount(account);
            });
            <%_ if (enableTranslation){ _%>
            vm.languageService.getCurrent().then(function(current) {
                if (vm.settingsAccount.langKey !== current) {
                    vm.$translate.use(vm.settingsAccount.langKey);
                }
            });
            <%_ } _%>
        }).catch(function() {
            vm.success = null;
            vm.error = 'ERROR';
        });
    }

    copyAccount (account) {
        return {
            activated: account.activated,
            email: account.email,
            firstName: account.firstName,
            langKey: account.langKey,
            lastName: account.lastName,
            login: account.login
        };
    }
}
