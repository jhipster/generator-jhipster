(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .directive('pageRibbon', pageRibbon);

    function pageRibbon(ProfileService, $rootScope<% if (enableTranslation) { %>, $translate<% } %>) {
        var directive = {
            replace : true,
            restrict : 'AE',
            template : '<div class="ribbon hidden"><a href="#" <% if (enableTranslation) { %>translate="{{ribbonTitle}}"<% } %>>{{ribbonTitle}}</a></div>',
            link : linkFunc
        };

        return directive;

        function linkFunc(scope, element, attrs) {
            ProfileService.profileInfo().then(function(response) {
                if (response.ribbonEnv) {
                    scope.ribbonTitle = "ribbon." + response.ribbonEnv;
                    element.addClass(response.ribbonEnv);
                    element.removeClass('hidden');
                }
            });
        }
    }
})();
