(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>', [
            'ngStorage',<% if (enableTranslation) { %>
            'tmh.dynamicLocale',
            'pascalprecht.translate',<% } %>
            'ngResource',
            'ngCookies',
            'ngAria',
            'ngCacheBuster',
            'ngFileUpload',
            'ui.bootstrap',
            'ui.bootstrap.datetimepicker',
            'ui.router',
            'infinite-scroll',
            // jhipster-needle-angularjs-add-module JHipster will add new module here
            'angular-loading-bar'
        ])
        .run(run);

    run.$inject = ['stateHandler'<% if (enableTranslation) { %>, 'translationHandler'<% } %>];

    function run(stateHandler<% if (enableTranslation) { %>, translationHandler<% } %>) {
        stateHandler.initialize();<% if (enableTranslation) { %>
        translationHandler.initialize();<% } %>
    }
})();
