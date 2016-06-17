TranslationConfig.$inject = ['$translateProvider', 'tmhDynamicLocaleProvider'];

export function TranslationConfig($translateProvider, tmhDynamicLocaleProvider) {
    // Initialize angular-translate
    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: 'i18n/{lang}/{part}.json'
    });

    $translateProvider.preferredLanguage('<%= nativeLanguage %>');
    $translateProvider.useStorage('TranslationStorageProvider');
    $translateProvider.useSanitizeValueStrategy('escaped');
    $translateProvider.addInterpolation('$translateMessageFormatInterpolation');

    tmhDynamicLocaleProvider.localeLocationPattern('i18n/angular-locale_{{locale}}.js');
    tmhDynamicLocaleProvider.useCookieStorage();
    tmhDynamicLocaleProvider.storageKey('NG_TRANSLATE_LANG_KEY');
}
