'use strict';

angular.module('<%=angularAppName%>')
    .factory('BootSwatchService', function ($http) {
    return {
        get: function() {
            return $http.get('http://api.bootswatch.com/3/').then(function (response) {
                return response.data.themes;
            });
        }
    };
});
