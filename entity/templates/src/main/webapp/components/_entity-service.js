'use strict';

angular.module('<%=angularAppName%>')
    .factory('<%= entityClass %>', function ($resource, DateUtils) {
        return $resource('api/<%= entityInstance %>s/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);<% for (fieldId in fields) { if (fields[fieldId].fieldType == 'LocalDate') { %>
                    data.<%=fields[fieldId].fieldName%> = DateUtils.convertLocaleDateFromServer(data.<%=fields[fieldId].fieldName%>);<% }if (fields[fieldId].fieldType == 'ZonedDateTime' || fields[fieldId].fieldType == 'Date') { %>
                    data.<%=fields[fieldId].fieldName%> = DateUtils.convertDateTimeFromServer(data.<%=fields[fieldId].fieldName%>);<% } }%>
                    return data;
                }
            },<% if (fieldsContainLocalDate == true) { %>
            'update': {
                method: 'PUT',
                transformRequest: function (data) {<% for (fieldId in fields) { if (fields[fieldId].fieldType == 'LocalDate') { %>
                    data.<%=fields[fieldId].fieldName%> = DateUtils.convertLocaleDateToServer(data.<%=fields[fieldId].fieldName%>);<% } }%>
                    return angular.toJson(data);
                }
            },
            'save': {
                method: 'POST',
                transformRequest: function (data) {<% for (fieldId in fields) { if (fields[fieldId].fieldType == 'LocalDate') { %>
                    data.<%=fields[fieldId].fieldName%> = DateUtils.convertLocaleDateToServer(data.<%=fields[fieldId].fieldName%>);<% } }%>
                    return angular.toJson(data);
                }
            }<% } else { %>
            'update': { method:'PUT' }<% } %>
        });
    });
