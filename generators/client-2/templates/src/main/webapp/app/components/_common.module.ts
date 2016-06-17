import { upgradeAdapter } from '../upgrade_adapter';

import { AlertServiceConfig } from '../blocks/config/alert.config';

import { Auth } from './auth/auth.service';
import { AuthServerProvider } from './auth/auth-session.service';
import { Account } from './auth/account.service';
import { LoginService } from './login/login.service';
import { Principal } from './auth/principal.service';<% if (enableTranslation) { %>
import { <%=jhiPrefixCapitalized%>LanguageService } from './language/language.service';<% } %>
import { AlertService } from './alert/alert.service';

import { PageRibbonComponent } from './profiles/page-ribbon.component';

angular
    .module('<%=angularAppName%>.common', [
        'ngStorage', <% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate',<% } %>
        'ngResource',
        'ui.bootstrap',
        'ui.router'
    ])
    .config(AlertServiceConfig)
    .factory('Auth', Auth)
    .factory('AuthServerProvider', AuthServerProvider)
    .factory('Account', Account)
    .factory('LoginService', LoginService)
    .factory('Principal', Principal)
    .factory('AlertService', AlertService)<% if (enableTranslation) { %>
    .factory('<%=jhiPrefixCapitalized%>LanguageService', <%=jhiPrefixCapitalized%>LanguageService)<% } %>
    .directive('pageRibbon', upgradeAdapter.downgradeNg2Component(PageRibbonComponent));
