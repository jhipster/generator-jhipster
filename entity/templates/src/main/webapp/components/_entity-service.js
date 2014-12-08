'use strict';

angular.module('<%=angularAppName%>')
    .factory('<%= entityClass %>', function ($resource) {
        return $resource('api/<%= entityInstance %>s/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    <% for (fieldId in fields) {
                    if ((fields[fieldId].fieldType == 'LocalDate') ||  (fields[fieldId].fieldType == 'DateTime')) { %>
                    data.<%=fields[fieldId].fieldName%> = new Date(data.<%=fields[fieldId].fieldName%>);
                    <% } }%>
                    return data;
                }
            }
        });
    });
