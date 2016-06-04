(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .directive('jhSocial', jhSocial);

    jhSocial.$inject = [<% if (enableTranslation){ %>'$translatePartialLoader', '$translate', <% } %>'$filter', 'SocialService'];

    function jhSocial(<% if (enableTranslation){ %>$translatePartialLoader, $translate, <% } %>$filter, SocialService) {
        var directive = {
            restrict: 'E',
            scope: {
                provider: '@ngProvider'
            },
            templateUrl: 'app/account/social/directive/social.html',
            link: linkFunc
        };

        return directive;

        /* private helper methods */

        function linkFunc(scope) {
            <% if (enableTranslation){ %>
            $translatePartialLoader.addPart('social');
            $translate.refresh();
            <% } %>
            scope.label = $filter('capitalize')(scope.provider);
            scope.providerSetting = SocialService.getProviderSetting(scope.provider);
            scope.providerURL = SocialService.getProviderURL(scope.provider);
            scope.csrf = SocialService.getCSRF();
        }

    }
})();
