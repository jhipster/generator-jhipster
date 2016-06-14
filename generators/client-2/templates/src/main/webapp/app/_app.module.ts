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
    .run(run);

run.$inject = ['stateHandler'<% if (enableTranslation) { %>, 'translationHandler'<% } %>];

function run(stateHandler<% if (enableTranslation) { %>, translationHandler<% } %>) {
    stateHandler.initialize();<% if (enableTranslation) { %>
    translationHandler.initialize();<% } %>
}
