import { PageRibbonComponent } from './profiles/page-ribbon.component';
import { upgradeAdapter } from '../upgrade_adapter';

import { Auth } from './auth/auth.service';
import { AuthServerProvider } from './auth/auth-session.service';
import { Account } from './auth/account.service';
import { LoginService } from './login/login.service';
import { Principal } from './auth/principal.service';

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
    .directive('pageRibbon', upgradeAdapter.downgradeNg2Component(PageRibbonComponent));
