import './components/common.module';
import './account/account.module';
import './admin/admin.module';
import './entities/entity.module';

import { StateHandler } from './blocks/handlers/state.handler';<% if (enableTranslation) { %>
import { TranslationHandler } from './blocks/handlers/translation.handler';

import { TranslationConfig } from './blocks/config/translation.config';
import { TranslationStorageProvider } from './blocks/config/translation-storage.provider';<% } %>

import { CompileServiceConfig } from './blocks/config/compile.config';
import { HttpConfig } from './blocks/config/http.config';
import { LocalStorageConfig } from './blocks/config/localstorage.config';
import { PagerConfig } from './blocks/config/uib-pager.config';
import { PaginationConfig } from './blocks/config/uib-pagination.config';

import { HomeController } from './home/home.controller';
import { NavbarController } from './layouts/navbar/navbar.controller';

import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
<%_ } _%>
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';

import { AppStateConfig } from './app.state';
import { HomeStateConfig } from './home/home.state';
import { ErrorStateConfig } from './layouts/error/error.state';

angular
    .module('<%=angularAppName%>.app', [
        'ngStorage', <% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate', <% } %>
        'ngResource',
        'ngCookies',
        'ngAria',
        'ngCacheBuster',
        'ngFileUpload',
        'ui.bootstrap',
        'ui.bootstrap.datetimepicker',
        'ui.router',
        'infinite-scroll',
        'angular-loading-bar',
        // jhipster-needle-angularjs-add-module JHipster will add new module here
        '<%=angularAppName%>.common',
        '<%=angularAppName%>.account',
        '<%=angularAppName%>.admin',
        '<%=angularAppName%>.entity'
    ])
    .config(CompileServiceConfig)
    .config(HttpConfig)
    .config(LocalStorageConfig)
    .config(PagerConfig)
    .config(PaginationConfig)
    .config(AppStateConfig)
    .config(HomeStateConfig)
    .config(ErrorStateConfig)
    .controller('HomeController', HomeController)
    .controller('NavbarController', NavbarController)
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
    .run(run);

run.$inject = ['StateHandler'<% if (enableTranslation) { %>, 'TranslationHandler'<% } %>];

function run(StateHandler<% if (enableTranslation) { %>, TranslationHandler<% } %>) {
    StateHandler.initialize();<% if (enableTranslation) { %>
    TranslationHandler.initialize();<% } %>
}
