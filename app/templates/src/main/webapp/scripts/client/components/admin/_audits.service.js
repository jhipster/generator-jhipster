'use strict';

angular.module('<%=angularAppName%>')
    .factory('AuditsService', function ($http) {
        return {
            findAll: function () {
                var promise = $http.get('app/rest/audits/all').then(function (response) {
                    return response.data;
                });
                return promise;
            },
            findByDates: function (fromDate, toDate) {

                var formatDate =  function (dateToFormat) {
                    if (dateToFormat !== undefined && !angular.isString(dateToFormat)) {
                        return dateToFormat.getYear() + "-" + dateToFormat.getMonth() + "-" + dateToFormat.getDay();
                    }
                    return dateToFormat;
                };

                var promise = $http.get('app/rest/audits/byDates', {params: {fromDate: formatDate(fromDate), toDate: formatDate(toDate)}}).then(function (response) {
                    return response.data;
                });
                return promise;
            }
        }
    });
