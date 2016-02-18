(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(translationConfig);

    translationConfig.$inject = ['$translateProvider', 'tmhDynamicLocaleProvider'];

    function translationConfig($translateProvider, tmhDynamicLocaleProvider) {
        // Initialize angular-translate
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: 'i18n/{lang}/{part}.json'
        });

        $translateProvider.preferredLanguage('<%= nativeLanguage.split("-")[0] %>');
        $translateProvider.useCookieStorage();
        $translateProvider.useSanitizeValueStrategy('escaped');
        $translateProvider.addInterpolation('$translateMessageFormatInterpolation');

        tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js');
        tmhDynamicLocaleProvider.useCookieStorage();
        tmhDynamicLocaleProvider.storageKey('NG_TRANSLATE_LANG_KEY');
    }
})();
