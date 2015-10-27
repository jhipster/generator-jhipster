'use strict';

angular.module('<%=angularAppName%>')
    .directive('jhSocial', function(<% if (enableTranslation){ %>$translatePartialLoader, $translate, <% } %>$filter, SocialService) {
        return {
            restrict: 'E',
            scope: {
                provider: "@ngProvider"
            },
            templateUrl: 'scripts/app/account/social/directive/social.html',
            link: function(scope, element, attrs) {<% if (enableTranslation){ %>
                $translatePartialLoader.addPart('social');
                $translate.refresh();
<% } %>
                scope.label = $filter('capitalize')(scope.provider);
                scope.providerSetting = SocialService.getProviderSetting(scope.provider);
                scope.providerURL = SocialService.getProviderURL(scope.provider);
                scope.csrf = SocialService.getCSRF();
            }
        }
     });
