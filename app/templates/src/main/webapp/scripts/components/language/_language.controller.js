'use strict';

angular.module('<%=angularAppName%>')
    .controller('LanguageController', function ($scope, $translate, Language, tmhDynamicLocale) {
        $scope.changeLanguage = function (languageKey) {
            $translate.use(languageKey);
            tmhDynamicLocale.set(languageKey);
        };

        Language.getAll().then(function (languages) {
            $scope.languages = languages;
        });
    })
    .filter('findLanguageFromKey', function () {
        return function (lang) {
            return {
                "ca": "Català",
                "da": "Dansk",
                "de": "Deutsch",
                "en": "English",
                "es": "Español",
                "fr": "Français",
                "gl": "Galego",
                "hu": "Magyar",
                "it": "Italiano",
                "ja": "日本語",
                "ko": "한국어",
                "nl": "Nederlands",
                "pl": "Polski",
                "pt-br": "Português (Brasil)",
                "pt-pt": "Português",
                "ro": "Română",
                "ru": "Русский",
                "sv": "Svenska",
                "ta": "தமிழ்",
                "tr": "Türkçe",
                "zh-cn": "中文（简体）",
                "zh-tw": "繁體中文"
            }[lang];
        }
    });
