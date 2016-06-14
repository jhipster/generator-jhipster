import { PageRibbonComponent } from './profiles/page-ribbon.component';
import { upgradeAdapter } from '../upgrade_adapter';

angular
    .module('<%=angularAppName%>.common', [
        'ngStorage', <% if (enableTranslation) { %>
        'tmh.dynamicLocale',
        'pascalprecht.translate', <% } %>
        'ngResource',
        'ui.bootstrap',
        'ui.router'
    ])
    .directive('pageRibbon', upgradeAdapter.downgradeNg2Component(PageRibbonComponent));
