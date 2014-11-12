'use strict';

angular.module('<%=angularAppName%>')
    .controller('LanguageController', function ($scope, $translate, Language) {
        $scope.changeLanguage = function (languageKey) {
            $translate.use(languageKey);

            Language.getBy(languageKey).then(function (languages) {
                $scope.languages = languages;
            });
        };

        Language.getBy().then(function (languages) {
            $scope.languages = languages;
        });
    });
