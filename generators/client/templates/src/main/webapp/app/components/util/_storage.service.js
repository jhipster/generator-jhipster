(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('StorageService', StorageService);

    StorageService.$inject = ['$window'];

    function StorageService($window) {
        var service = {
            clearAll: clearAll,
            get: get,
            remove: remove,
            save: save
        };

        return service;

        function clearAll () {
            $window.localStorage.clear();
        }

        function get (key) {
            return JSON.parse($window.localStorage.getItem(key));
        }

        function remove (key) {
            $window.localStorage.removeItem(key);
        }

        function save (key, data) {
            $window.localStorage.setItem(key, JSON.stringify(data));
        }
    }
})();
