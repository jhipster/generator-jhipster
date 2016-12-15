(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .directive('activeMenu', activeMenu);

    activeMenu.$inject = ['$translate', '$locale', 'tmhDynamicLocale'];

    function activeMenu($translate, $locale, tmhDynamicLocale) {
        var directive = {
            restrict: 'A',
            link: linkFunc
        };

        return directive;

        function linkFunc(scope, element, attrs) {
            var language = attrs.activeMenu;

            scope.$watch(function() {
                return $translate.use();
            }, function(selectedLanguage) {
                if (language === selectedLanguage) {
                    tmhDynamicLocale.set(language);
                    element.addClass('active');
                } else {
                    element.removeClass('active');
                }
            });
        }
    }
})();
