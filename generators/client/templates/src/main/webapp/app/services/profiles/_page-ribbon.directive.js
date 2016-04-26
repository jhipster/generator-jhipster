(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .directive('pageRibbon', pageRibbon);

    function pageRibbon(ActiveProfiles,$rootScope<% if (enableTranslation) { %>, $translate<% } %>) {
        var directive = {
    		replace: true,
            restrict: 'AE',
            template: '<div class="ribbon hidden"><a href="#">{{ribbonTitle}}</a></div>',
            link: linkFunc
        };

        return directive;

        function linkFunc(scope, element, attrs) {
            ActiveProfiles.fetch().then(function(response) {
                if (response.ribbonEnv) {
                	<% if (enableTranslation) { %>
                	$rootScope.$on('$translateChangeSuccess', function () {
                	    scope.ribbonTitle = $translate.instant("ribbon." + response.ribbonEnv);
                	});
					<% } else { %>                		
                	scope.ribbonTitle = response.ribbonEnv;
                	<% } %>                		
                	element.addClass(response.ribbonEnv);
                	element.removeClass('hidden');
                }
            });
        }
    }
})();
