import { PageRibbonComponent } from './profiles/page-ribbon.component';
import { upgradeAdapter } from '../upgrade_adapter';

import { Auth } from './auth/auth.service';
import { AuthServerProvider } from './auth/auth-session.service';
import { Account } from './auth/account.service';
import { LoginService } from './login/login.service';
import { Principal } from './auth/principal.service';
import { <%=jhiPrefixCapitalized%>LanguageService } from './language/language.service';
import { AlertService } from './alert/alert.service';

angular
    .module('<%=angularAppName%>.common', [
        'ngStorage', <% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate', <% } %>
        'ngResource',
        'ui.bootstrap',
        'ui.router'
    ])
    .factory('Auth', Auth)
    .factory('AuthServerProvider', AuthServerProvider)
    .factory('Account', Account)
    .factory('LoginService', LoginService)
    .factory('Principal', Principal)
    .factory('AlertService', AlertService)
    .factory('<%=jhiPrefixCapitalized%>LanguageService', <%=jhiPrefixCapitalized%>LanguageService)
    .directive('pageRibbon', upgradeAdapter.downgradeNg2Component(PageRibbonComponent));
