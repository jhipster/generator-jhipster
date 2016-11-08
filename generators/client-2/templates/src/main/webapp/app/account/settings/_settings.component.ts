import { Component, Inject, OnInit } from '@angular/core';

import { Principal, AccountService<% if (enableTranslation){ %>, <%=jhiPrefixCapitalized%>LanguageService<% } %> } from '../../shared';

@Component({
    selector: 'settings',
    templateUrl: './settings.html'
})
export class SettingsComponent implements OnInit {
    error: string;
    success: string;
    settingsAccount: any;
    languages: any[];

    constructor(private account: AccountService, private principal: Principal<% if (enableTranslation){ %>, private languageService: <%=jhiPrefixCapitalized%>LanguageService <% } %>) {}

    ngOnInit () {
        this.principal.identity().then((account) => {
            this.settingsAccount = this.copyAccount(account);
        });
        <%_ if (enableTranslation){ _%>
        this.languageService.getAll().then((languages) => {
            this.languages = languages;
        });
        <%_ } _%>
    }

    save () {
        this.account.save(this.settingsAccount).subscribe(() => {
            this.error = null;
            this.success = 'OK';
            this.principal.identity(true).then((account) => {
                this.settingsAccount = this.copyAccount(account);
            });
            <%_ if (enableTranslation){ _%>
            this.languageService.getCurrent().then((current) => {
                if (this.settingsAccount.langKey !== current) {
                    this.languageService.changeLanguage(this.settingsAccount.langKey);
                }
            });
            <%_ } _%>
        }, () => {
            this.success = null;
            this.error = 'ERROR';
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
