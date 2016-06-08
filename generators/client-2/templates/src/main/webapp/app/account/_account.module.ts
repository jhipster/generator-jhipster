(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>.account', [
            'ngStorage', <% if (enableTranslation) { %>
            'tmh.dynamicLocale',
            'pascalprecht.translate', <% } %>
            'ngResource',
            'ui.bootstrap',
            'ui.router'
        ]);
})();
