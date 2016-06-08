(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>.common', [
            'ngStorage', <% if (enableTranslation) { %>
            'tmh.dynamicLocale',
            'pascalprecht.translate', <% } %>
            'ngResource',
            'ui.bootstrap',
            'ui.router'
        ]);
})();
