import { upgradeAdapter } from '../upgrade_adapter';

import { AlertServiceConfig } from '../blocks/config/alert.config';

import { Auth } from './auth/auth.service';
import { AuthServerProvider } from './auth/auth-session.service';
import { Account } from './auth/account.service';
import { LoginService } from './login/login.service';
import { Principal } from './auth/principal.service';
import { ProfileService } from './profiles/profile.service';<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from './language/language.service';<% } %>
import { AlertService } from './alert/alert.service';

import { PageRibbonComponent } from './profiles/page-ribbon.component';<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageController } from './language/language.controller';<% } %>

upgradeAdapter.addProvider(ProfileService);

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
    .factory('Auth', Auth)
    .factory('AuthServerProvider', AuthServerProvider)
    .factory('Account', Account)
    .factory('LoginService', LoginService)
    .factory('Principal', Principal)
    .factory('ProfileService',upgradeAdapter.downgradeNg2Provider(ProfileService))
    .provider('AlertService', AlertService)<% if (enableTranslation) { %>
    .factory('<%=jhiPrefixCapitalized%>LanguageService', <%=jhiPrefixCapitalized%>LanguageService)<% } %>
    .directive('pageRibbon', upgradeAdapter.downgradeNg2Component(PageRibbonComponent))<% if (enableTranslation) { %>
    .controller('<%=jhiPrefixCapitalized%>LanguageController', <%=jhiPrefixCapitalized%>LanguageController);<% } %>
