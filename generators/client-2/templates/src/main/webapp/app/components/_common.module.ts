import * as angular from 'angular';

import { upgradeAdapter } from '../upgrade_adapter';

import { AlertServiceConfig } from '../blocks/config/alert.config';

import {
    AuthService,
    AuthServerProvider,
    Account,
    LoginService,
    Principal,
    ProfileService,
    <%_ if (enableTranslation) { _%>
    <%=jhiPrefixCapitalized%>LanguageService,
    <%_ } _%>
    AlertService,
    PageRibbonComponent
} from './';

upgradeAdapter.upgradeNg1Provider('$state');
upgradeAdapter.upgradeNg1Provider('$rootScope');
upgradeAdapter.upgradeNg1Provider('$sessionStorage');
upgradeAdapter.upgradeNg1Provider('$localStorage');<% if (enableTranslation) { %>
upgradeAdapter.upgradeNg1Provider('$translate');
upgradeAdapter.upgradeNg1Provider('tmhDynamicLocale');<% } %>

angular
    .module('<%=angularAppName%>.common', [
        'ngStorage',<% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate',<% } %>
        'ngResource',
        'ui.bootstrap',
        'ui.router'
    ])
    // bug 'showAsToast is not a function to fix'
    //.config(AlertServiceConfig)
    .controller('LoginController', LoginController)
    .factory('Auth', upgradeAdapter.downgradeNg2Provider(AuthService))
    .factory('AuthServerProvider', upgradeAdapter.downgradeNg2Provider(AuthServerProvider))
    .factory('Account', upgradeAdapter.downgradeNg2Provider(Account))
    .factory('Principal', upgradeAdapter.downgradeNg2Provider(Principal))
    .factory('LoginService', upgradeAdapter.downgradeNg2Provider(LoginService))
    .factory('ProfileService',upgradeAdapter.downgradeNg2Provider(ProfileService))
    .factory('Auth', Auth)
    .factory('AuthServerProvider', AuthServerProvider)
    .factory('Account', Account)
    .factory('AlertService', upgradeAdapter.downgradeNg2Provider(AlertService))<% if (enableTranslation) { %>
    .factory('<%=jhiPrefixCapitalized%>LanguageService', upgradeAdapter.downgradeNg2Provider(<%=jhiPrefixCapitalized%>LanguageService))<% } %>
    .directive('pageRibbon',  <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PageRibbonComponent));
