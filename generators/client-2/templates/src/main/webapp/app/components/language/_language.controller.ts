<%=jhiPrefixCapitalized%>LanguageController.$inject = ['$translate', '<%=jhiPrefixCapitalized%>LanguageService', 'tmhDynamicLocale'];

export function <%=jhiPrefixCapitalized%>LanguageController ($translate, <%=jhiPrefixCapitalized%>LanguageService, tmhDynamicLocale) {
    var vm = this;

    vm.changeLanguage = changeLanguage;
    vm.languages = null;

    <%=jhiPrefixCapitalized%>LanguageService.getAll().then(function (languages) {
        vm.languages = languages;
    });

    function changeLanguage (languageKey) {
        $translate.use(languageKey);
        tmhDynamicLocale.set(languageKey);
    }
}
