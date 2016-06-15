import './components/common.module';
import './account/account.module';
import './admin/admin.module';
import './entities/entity.module';
import { AppStateConfig } from './app.state';
import { StateHandler } from './blocks/handlers/state.handler';
import { TranslationHandler } from './blocks/handlers/translation.handler';

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
    .config(AppStateConfig)
    .run(run);

run.$inject = ['StateHandler'<% if (enableTranslation) { %>, 'TranslationHandler'<% } %>];

function run(StateHandler<% if (enableTranslation) { %>, TranslationHandler<% } %>) {
    StateHandler.initialize();<% if (enableTranslation) { %>
    TranslationHandler.initialize();<% } %>
}
