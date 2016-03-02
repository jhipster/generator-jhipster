(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%=jhiPrefix%>LanguageController', <%=jhiPrefix%>LanguageController);

    <%=jhiPrefix%>LanguageController.$inject = ['$translate', '<%=jhiPrefix%>LanguageService', 'tmhDynamicLocale'];

    function <%=jhiPrefix%>LanguageController ($translate, <%=jhiPrefix%>LanguageService, tmhDynamicLocale) {
        var vm = this;

        vm.changeLanguage = changeLanguage;
        vm.languages = null;

        <%=jhiPrefix%>LanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function changeLanguage (languageKey) {
            $translate.use(languageKey);
            tmhDynamicLocale.set(languageKey);
        }
    }
})();
