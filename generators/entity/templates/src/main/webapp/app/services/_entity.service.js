(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('<%= entityClass %>', <%= entityClass %>);

    <%= entityClass %>.$inject = ['$resource', 'DateUtils'];

    function <%= entityClass %> ($resource, DateUtils) {
        return $resource('api/<%= entityApiUrl %>/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);<% for (idx in fields) { if (fields[idx].fieldType == 'LocalDate') { %>
                    data.<%=fields[idx].fieldName%> = DateUtils.convertLocaleDateFromServer(data.<%=fields[idx].fieldName%>);<% }if (fields[idx].fieldType == 'ZonedDateTime' || fields[idx].fieldType == 'Date') { %>
                    data.<%=fields[idx].fieldName%> = DateUtils.convertDateTimeFromServer(data.<%=fields[idx].fieldName%>);<% } }%>
                    return data;
                }
            },<% if (fieldsContainLocalDate == true) { %>
            'update': {
                method: 'PUT',
                transformRequest: function (data) {<% for (idx in fields) { if (fields[idx].fieldType == 'LocalDate') { %>
                    data.<%=fields[idx].fieldName%> = DateUtils.convertLocaleDateToServer(data.<%=fields[idx].fieldName%>);<% } }%>
                    return angular.toJson(data);
                }
            },
            'save': {
                method: 'POST',
                transformRequest: function (data) {<% for (idx in fields) { if (fields[idx].fieldType == 'LocalDate') { %>
                    data.<%=fields[idx].fieldName%> = DateUtils.convertLocaleDateToServer(data.<%=fields[idx].fieldName%>);<% } }%>
                    return angular.toJson(data);
                }
            }<% } else { %>
            'update': { method:'PUT' }<% } %>
        });
    }
})();
