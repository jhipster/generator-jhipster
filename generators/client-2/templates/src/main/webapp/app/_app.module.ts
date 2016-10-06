import * as angular from 'angular';

import './account/account.module';
import './admin/admin.module';
import './entities/entity.module';

import { upgradeAdapter } from './upgrade_adapter';

import { StateHandler } from './blocks/handlers/state.handler';<% if (enableTranslation) { %>
import { TranslationHandler } from './blocks/handlers/translation.handler';

import { TranslationConfig } from './blocks/config/translation.config';
import { TranslationStorageProvider } from './blocks/config/translation-storage.provider';<% } %>
import { UIRouterDeferInterceptConfig } from './blocks/config/ui-router-defer-intercept.config';

import { CompileServiceConfig } from './blocks/config/compile.config';
import { HttpConfig } from './blocks/config/http.config';
import { LocalStorageConfig } from './blocks/config/localstorage.config';
import { PagerConfig } from './blocks/config/uib-pager.config';
import { PaginationConfig } from './blocks/config/uib-pagination.config';

import { HomeComponent } from './home';
import { NavbarComponent, FooterComponent, PageRibbonComponent } from './layouts';

import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
<%_ } _%>
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';

import { <%=jhiPrefixCapitalized%>LoginModalComponent, AuthService } from "./shared";

upgradeAdapter.upgradeNg1Provider('$state');
upgradeAdapter.upgradeNg1Provider('$rootScope');
upgradeAdapter.upgradeNg1Provider('$sessionStorage');
upgradeAdapter.upgradeNg1Provider('$localStorage');
upgradeAdapter.upgradeNg1Provider('$translate');
upgradeAdapter.upgradeNg1Provider('tmhDynamicLocale');

angular
    .module('<%=angularAppName%>.app', [
        'ngStorage',<% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate',<% } %>
        'ngResource',
        'ngCookies',
        'ngAria',
        'ngCacheBuster',
        'ngFileUpload',
        'ui.bootstrap',
        'ui.router.upgrade',
        'infinite-scroll',
        'angular-loading-bar',
        // jhipster-needle-angularjs-add-module JHipster will add new module here
        '<%=angularAppName%>.account',
        '<%=angularAppName%>.admin',
        '<%=angularAppName%>.entity'
    ])
    .config(CompileServiceConfig)
    .config(HttpConfig)
    .config(LocalStorageConfig)
    .config(PagerConfig)
    .config(PaginationConfig)
    .config(UIRouterDeferInterceptConfig)
    .directive('<%=jhiPrefix%>LoginModal', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>LoginModalComponent))
    .directive('home', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(HomeComponent))
    .directive('navbar', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(NavbarComponent))
    .directive('footer', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(FooterComponent))
    .factory('AuthExpiredInterceptor', AuthExpiredInterceptor)
    <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    .factory('AuthInterceptor', AuthInterceptor)
    <%_ } _%>
    .factory('ErrorHandlerInterceptor', ErrorHandlerInterceptor)
    .factory('NotificationInterceptor', NotificationInterceptor)
    .factory('StateHandler',StateHandler)<% if (enableTranslation) { %>
    .factory('TranslationStorageProvider', TranslationStorageProvider)
    .config(TranslationConfig)
    .factory('TranslationHandler',TranslationHandler)<% } %>
    .factory('Auth', upgradeAdapter.downgradeNg2Provider(AuthService))
    .directive('pageRibbon',  <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PageRibbonComponent))
    .run(run);

run.$inject = ['StateHandler'<% if (enableTranslation) { %>, 'TranslationHandler'<% } %>];

function run(StateHandler<% if (enableTranslation) { %>, TranslationHandler<% } %>) {
    StateHandler.initialize();<% if (enableTranslation) { %>
    TranslationHandler.initialize();<% } %>
}
