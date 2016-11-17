angular
    .module('<%=angularAppName%>.entity', [<% if (enableTranslation) { %>
        'tmh.dynamicLocale',<% } %>
        'ngResource',
        'ngFileUpload',
        'ui.bootstrap',
        'infinite-scroll'
    ]);
