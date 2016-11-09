import * as angular from 'angular';

import './account/account.module';
import './admin/admin.module';
import './entities/entity.module';

import { upgradeAdapter } from './upgrade_adapter';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { VERSION } from "./app.constants";<% if (enableTranslation) { %>

import { TranslationConfig } from './blocks/config/translation.config';
import { TranslationStorageProvider } from './blocks/config/translation-storage.provider';<% } %>

import { CompileServiceConfig } from './blocks/config/compile.config';
import { HttpConfig } from './blocks/config/http.config';
import { PagerConfig } from './blocks/config/uib-pager.config';
import { PaginationConfig } from './blocks/config/uib-pagination.config';

import { HomeComponent } from './home';
import { <%=jhiPrefixCapitalized%>MainComponent, NavbarComponent, FooterComponent, PageRibbonComponent } from './layouts';

import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';

import { <%=jhiPrefixCapitalized%>LoginModalComponent<% if (websocket === 'spring-websocket') { %>, <%=jhiPrefixCapitalized%>TrackerService<% } %> } from "./shared";

angular
    .module('<%=angularAppName%>.app', [<% if (enableTranslation) { %>
        'tmh.dynamicLocale',<% } %>
        'ngResource',
        'ngCookies',
        'ngAria',
        'ngCacheBuster',
        'ngFileUpload',
        'ui.bootstrap',
        'infinite-scroll',
        'angular-loading-bar',
        // jhipster-needle-angularjs-add-module JHipster will add new module here
        '<%=angularAppName%>.account',
        '<%=angularAppName%>.admin',
        '<%=angularAppName%>.entity'
    ])
    .config(CompileServiceConfig)
    .config(HttpConfig)
    .config(PagerConfig)
    .config(PaginationConfig)
    .directive('<%=jhiPrefix%>LoginModal', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>LoginModalComponent))
    .directive('home', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(HomeComponent))
    .directive('navbar', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(NavbarComponent))
    .directive('footer', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(FooterComponent))
    .directive('<%=jhiPrefix%>Main', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>MainComponent))
    .factory('AuthExpiredInterceptor', AuthExpiredInterceptor)
    .factory('ErrorHandlerInterceptor', ErrorHandlerInterceptor)
    .factory('NotificationInterceptor', NotificationInterceptor)<% if (enableTranslation) { %>
    .factory('TranslationStorageProvider', TranslationStorageProvider)
    .config(TranslationConfig)<% } %>
    .directive('pageRibbon',  <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(PageRibbonComponent))
    .run(run);

run.$inject = ['$rootScope'];

function run($rootScope) {
    $rootScope.VERSION = VERSION;
}
