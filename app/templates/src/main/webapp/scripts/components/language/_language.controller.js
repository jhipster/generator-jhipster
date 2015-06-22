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
                "en": "English",
                "fr": "Français",
                "de": "Deutsch",
                "it": "Italiano",
                "ru": "Русский",
                "tr": "Türkçe",
                "ca": "Català",
                "da": "Dansk",
                "es": "Español",
                "hu": "Magyar",
                "ja": "日本語",
                "kr": "한국어",
                "pl": "Polski",
                "pt-br": "Português (Brasil)",
                "ro": "Română",
                "sv": "Svenska",
                "zh-cn": "中文（简体）",
                "zh-tw": "繁體中文",
            }[lang];
        }
    });
