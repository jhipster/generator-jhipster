(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('JhiLanguageService', JhiLanguageService);

    JhiLanguageService.$inject = ['$q', '$http', '$translate', 'LANGUAGES'];

    function JhiLanguageService ($q, $http, $translate, LANGUAGES) {
        var service = {
            getAll: getAll,
            getCurrent: getCurrent
        };

        return service;

        function getAll () {
            var deferred = $q.defer();
            deferred.resolve(LANGUAGES);
            return deferred.promise;
        }

        function getCurrent () {
            var deferred = $q.defer();
            var language = $translate.storage().get('NG_TRANSLATE_LANG_KEY');

            if (angular.isUndefined(language)) {
                language = '<%= nativeLanguageShortName %>';
            }

            deferred.resolve(language);

            return deferred.promise;
        }
    }
})();
