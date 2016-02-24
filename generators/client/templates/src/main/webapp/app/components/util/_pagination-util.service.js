(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .service('PaginationUtil', function () {
            // sort can be in the format `id,asc` or `id`
            this.parsePredicate = function (sort) {
                var sortArray = sort.split(',');
                if (sortArray.length > 1){
                    sortArray.pop();
                }
                return sortArray.join(',');
            };
            this.parseAscending = function (sort) {
                var sortArray = sort.split(',');
                if (sortArray.length > 1){
                    return sort.split(',').slice(-1)[0] == 'asc';
                } else {
                    // default to true if no sort defined
                    return true;
                }
            };
            // query params are strings, and need to be parsed
            this.parsePage = function (page) {
                return parseInt(page);
            };
        });
})();
