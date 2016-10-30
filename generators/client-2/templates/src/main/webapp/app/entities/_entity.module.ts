angular
    .module('<%=angularAppName%>.entity', [<% if (enableTranslation) { %>
        'tmh.dynamicLocale',<% } %>
        'ngResource',
        'ngFileUpload',
        'ui.bootstrap',
        'ui.router',
        'infinite-scroll'
    ]);
