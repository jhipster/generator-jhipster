import { upgradeAdapter } from '../upgrade_adapter';

import { XSRFStrategy, CookieXSRFStrategy } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AlertServiceConfig } from '../blocks/config/alert.config';

import { LoginController } from './login/login.controller';

import { Auth } from './auth/auth.service';
import { AuthServerProvider } from './auth/auth-session.service';
import { Account } from './auth/account.service';
import { LoginService } from './login/login.service';
import { Principal } from './auth/principal.service';
import { ProfileService } from './profiles/profile.service';<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from './language/language.service';<% } %>
import { AlertService } from './alert/alert.service';

import { PageRibbonComponent } from './profiles/page-ribbon.component';

upgradeAdapter.upgradeNg1Provider('$state');
upgradeAdapter.upgradeNg1Provider('Auth');<% if (enableTranslation) { %>
upgradeAdapter.upgradeNg1Provider('<%=jhiPrefixCapitalized%>LanguageService');<% } %>
upgradeAdapter.upgradeNg1Provider('LoginService');
upgradeAdapter.upgradeNg1Provider('Principal');

angular
    .module('<%=angularAppName%>.common', [
        'ngStorage', <% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate',<% } %>
        'ngResource',
        'ui.bootstrap',
        'ui.router'
    ])
    // bug 'showAsToast is not a function to fix'
    .config(AlertServiceConfig)
    .controller('LoginController', LoginController)
    .factory('Auth', Auth)
    .factory('AuthServerProvider', AuthServerProvider)
    .factory('Account', Account)
    .factory('LoginService', LoginService)
    .factory('Principal', Principal)
    .factory('ProfileService',upgradeAdapter.downgradeNg2Provider(ProfileService))
    .provider('AlertService', AlertService) <% if (enableTranslation) { %>
    .factory('<%=jhiPrefixCapitalized%>LanguageService', <%=jhiPrefixCapitalized%>LanguageService)<% } %>
    .directive('pageRibbon',  <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PageRibbonComponent));

@NgModule({
    imports: [BrowserModule, FormsModule],
    providers: [
        ProfileService,
        {
            provide: XSRFStrategy,
            useValue:  new CookieXSRFStrategy('CSRF-TOKEN', 'X-CSRF-TOKEN')
        }
    ],
    pipes: []
})
export class <%=angularAppName%>CommonModule {}
