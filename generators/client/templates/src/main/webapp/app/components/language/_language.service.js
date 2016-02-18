(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('Language', Language);

    Language.$inject = ['$q', '$http', '$translate', 'LANGUAGES'];

    function Language ($q, $http, $translate, LANGUAGES) {
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
                language = '<%= nativeLanguage.split("-")[0] %>';
            }

            deferred.resolve(language);

            return deferred.promise;
        }
    }
})();
