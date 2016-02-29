(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('LanguageController', LanguageController);

    LanguageController.$inject = ['$translate', 'Language', 'tmhDynamicLocale'];

    function LanguageController ($translate, Language, tmhDynamicLocale) {
        var vm = this;

        vm.changeLanguage = changeLanguage;
        vm.languages = null;

        Language.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function changeLanguage (languageKey) {
            $translate.use(languageKey);
            tmhDynamicLocale.set(languageKey);
        }
    }
})();
