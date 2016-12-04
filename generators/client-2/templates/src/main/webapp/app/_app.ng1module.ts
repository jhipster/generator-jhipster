import * as angular from 'angular';

import { upgradeAdapter } from './upgrade_adapter';

import { <%=jhiPrefixCapitalized%>MainComponent } from './layouts';

angular
    .module('<%=angularAppName%>.app', [<% if (enableTranslation) { %>
        'tmh.dynamicLocale',<% } %>
        'ngResource',
        'ngCookies',
        'ngAria',
        'ngCacheBuster',
        'ngFileUpload',
        'ui.bootstrap',
        'infinite-scroll',
        'angular-loading-bar'
    ])
    .directive('<%=jhiPrefix%>Main', <angular.IDirectiveFactory> upgradeAdapter.downgradeNg2Component(<%=jhiPrefixCapitalized%>MainComponent));
