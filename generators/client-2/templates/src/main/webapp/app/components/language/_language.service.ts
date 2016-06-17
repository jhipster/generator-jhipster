import { LANGUAGES } from '../../components/language/language.constants';

<%=jhiPrefixCapitalized%>LanguageService.$inject = ['$q', '$http', '$translate'];

export function <%=jhiPrefixCapitalized%>LanguageService ($q, $http, $translate) {
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

        deferred.resolve(language);

        return deferred.promise;
    }
}
