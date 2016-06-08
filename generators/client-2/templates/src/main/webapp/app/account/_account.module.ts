(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>.account', [
            'ngStorage', <% if (enableTranslation) { %>
            'tmh.dynamicLocale',
            'pascalprecht.translate', <% } %>
            'ngResource',
            'ngCookies',
            'ngAria',
            'ngCacheBuster',
            'ui.bootstrap',
            'ui.bootstrap.datetimepicker',
            'ui.router'
        ]);
})();
