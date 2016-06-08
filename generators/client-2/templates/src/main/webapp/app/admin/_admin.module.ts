(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>.admin', [
            'ngStorage', <% if (enableTranslation) { %>
            'tmh.dynamicLocale',
            'pascalprecht.translate', <% } %>
            'ngResource',
            'ui.bootstrap',
            'ui.router'
        ]);
})();
