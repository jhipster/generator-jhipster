'use strict';

angular.module('<%=angularAppName%>')
    .factory('Language', function ($q, $http, $translate, LANGUAGES) {
        var self = this;
        return {
            getCurrent: function () {
                var deferred = $q.defer();
                var language = $translate.storage().get('NG_TRANSLATE_LANG_KEY');

                if (language == undefined) {
                    language = 'en';
                }

                deferred.resolve(language);
                return deferred.promise;
            },
            getBy: function (language) {
                var deferred = $q.defer();
                deferred.resolve(LANGUAGES);
                return deferred.promise;
            }
        };
    })

/*
 Languages codes are ISO_639-1 codes, see http://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
 They are written in English to avoid character encoding issues (not a perfect solution)
 */
    .constant('LANGUAGES', [
        'en', 'fr'
        //JHipster will add new languages here
    ]
);




