angular
    .module('<%=angularAppName%>.entity', [<% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate', <% } %>
        'ngResource',
        'ngFileUpload',
        'ui.bootstrap',
        'ui.router',
        'infinite-scroll'
    ]);
