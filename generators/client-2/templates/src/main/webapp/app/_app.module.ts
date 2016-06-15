import './components/common.module';
import './account/account.module';
import './admin/admin.module';
import './entities/entity.module';

import { StateHandler } from './blocks/handlers/state.handler';
import { TranslationHandler } from './blocks/handlers/translation.handler';

import { AlertServiceConfig } from './blocks/config/alert.config';
import { CompileServiceConfig } from './blocks/config/compile.config';
import { HttpConfig } from './blocks/config/http.config';
import { LocalStorageConfig } from './blocks/config/localstorage.config';
import { TranslationConfig } from './blocks/config/translation.config';
import { PagerConfig } from './blocks/config/uib-pager.config';
import { PaginationConfig } from './blocks/config/uib-pagination.config';
import { AppStateConfig } from './app.state';

import { TranslationStorageProvider } from './blocks/config/translation-storage.provider';

import { AuthExpiredInterceptor } from './blocks/interceptor/auth-expired.interceptor';
<%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
import { AuthInterceptor } from './blocks/interceptor/auth.interceptor';
<%_ } _%>
import { ErrorHandlerInterceptor } from './blocks/interceptor/errorhandler.interceptor';
import { NotificationInterceptor } from './blocks/interceptor/notification.interceptor';

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
    .config(AlertServiceConfig)
    .config(CompileServiceConfig)
    .config(HttpConfig)
    .config(LocalStorageConfig)
    .config(TranslationConfig)
    .config(PagerConfig)
    .config(PaginationConfig)
    .config(AppStateConfig)
    .factory('TranslationStorageProvider', TranslationStorageProvider)
    .factory('AuthExpiredInterceptor', AuthExpiredInterceptor)
    <%_ if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { _%>
    .factory('AuthInterceptor', AuthInterceptor)
    <%_ } _%>
    .factory('ErrorHandlerInterceptor', ErrorHandlerInterceptor)
    .factory('NotificationInterceptor', NotificationInterceptor)
    .run(run);

run.$inject = ['StateHandler'<% if (enableTranslation) { %>, 'TranslationHandler'<% } %>];

function run(StateHandler<% if (enableTranslation) { %>, TranslationHandler<% } %>) {
    StateHandler.initialize();<% if (enableTranslation) { %>
    TranslationHandler.initialize();<% } %>
}
