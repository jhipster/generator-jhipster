import {Component, Inject, OnInit} from '@angular/core';

@Component({
    selector: 'settings',
    templateUrl: 'app/account/settings/settings.html'
})
export class SettingsComponent implements OnInit {
    error: string;
    success: string;
    settingsAccount: any;
    Auth: any;
    Principal: any;
    // <%=jhiPrefixCapitalized%>LanguageService: any;

    constructor(@Inject('$translate') private $translate, @Inject('Auth') Auth, @Inject('Principal') Principal)
    @Inject('<%=jhiPrefixCapitalized%>LanguageService') <%=jhiPrefixCapitalized%>LanguageService) {
        this.Auth = Auth;
        this.Principal = Principal;
        this.<%=jhiPrefixCapitalized%>LanguageService = <%=jhiPrefixCapitalized%>LanguageService;
    }

    ngOnInit () {
        let vm = this;
        this.Principal.identity().then(function(account) {
            vm.settingsAccount = this.copyAccount(account);
        });
    }

    save () {
        let vm = this;
        this.Auth.updateAccount(vm.settingsAccount).then(function() {
            vm.error = null;
            vm.success = 'OK';
            this.Principal.identity(true).then(function(account) {
                vm.settingsAccount = this.copyAccount(account);
            });<% if (enableTranslation){ %>
            this.<%=jhiPrefixCapitalized%>LanguageService.getCurrent().then(function(current) {
                if (vm.settingsAccount.langKey !== current) {
                    this.$translate.use(vm.settingsAccount.langKey);
                }
            });<% } %>
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
