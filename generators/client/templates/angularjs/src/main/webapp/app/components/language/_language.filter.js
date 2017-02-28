(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .filter('findLanguageFromKey', findLanguageFromKey);

    function findLanguageFromKey() {
        return findLanguageFromKeyFilter;

        function findLanguageFromKeyFilter(lang) {
            return {
                'ca': 'Català',
                'cs': 'Český',
                'da': 'Dansk',
                'de': 'Deutsch',
                'el': 'Ελληνικά',
                'en': 'English',
                'es': 'Español',
                'et': 'Eesti',
                'fr': 'Français',
                'gl': 'Galego',
                'hu': 'Magyar',
                'hi': 'हिंदी',
                'hy': 'Հայերեն',
                'it': 'Italiano',
                'ja': '日本語',
                'ko': '한국어',
                'mr': 'मराठी',
                'nl': 'Nederlands',
                'pl': 'Polski',
                'pt-br': 'Português (Brasil)',
                'pt-pt': 'Português',
                'ro': 'Română',
                'ru': 'Русский',
                'sk': 'Slovenský',
                'sr': 'Srpski',
                'sv': 'Svenska',
                'ta': 'தமிழ்',
                'tr': 'Türkçe',
                'vi': 'Tiếng Việt',
                'zh-cn': '中文（简体）',
                'zh-tw': '繁體中文'
            }[lang];
        }
    }
})();
