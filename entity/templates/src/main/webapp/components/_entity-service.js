'use strict';

angular.module('<%=angularAppName%>')
    .factory('<%= entityClass %>', function ($resource) {
        return $resource('api/<%= entityInstance %>s/:id', {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);<% for (fieldId in fields) { if (fields[fieldId].fieldType == 'LocalDate') { %>
                    if (data.<%=fields[fieldId].fieldName%> != null){
                        var <%=fields[fieldId].fieldName%>From = data.<%=fields[fieldId].fieldName%>.split("-");
                        data.<%=fields[fieldId].fieldName%> = new Date(new Date(<%=fields[fieldId].fieldName%>From[0], <%=fields[fieldId].fieldName%>From[1] - 1, <%=fields[fieldId].fieldName%>From[2]));
                    }<% }if (fields[fieldId].fieldType == 'DateTime') { %>
                    if (data.<%=fields[fieldId].fieldName%> != null) data.<%=fields[fieldId].fieldName%> = new Date(data.<%=fields[fieldId].fieldName%>);<% } }%>
                    return data;
                }
            },<% if (fieldsContainLocalDate == true) { %>
            'update': {
                method: 'PUT',
                transformRequest: function (data) {<% for (fieldId in fields) { if (fields[fieldId].fieldType == 'LocalDate') { %>
                    var <%=fields[fieldId].fieldName%> = new Date();
                    <%=fields[fieldId].fieldName%>.setUTCDate(data.<%=fields[fieldId].fieldName%>.getDate());
                    <%=fields[fieldId].fieldName%>.setUTCMonth(data.<%=fields[fieldId].fieldName%>.getMonth());
                    <%=fields[fieldId].fieldName%>.setUTCFullYear(data.<%=fields[fieldId].fieldName%>.getFullYear());
                    data.<%=fields[fieldId].fieldName%> = <%=fields[fieldId].fieldName%>;<% } }%>
                    return angular.toJson(data);
                }
            },
            'save': {
                method: 'POST',
                transformRequest: function (data) {<% for (fieldId in fields) { if (fields[fieldId].fieldType == 'LocalDate') { %>
                    var <%=fields[fieldId].fieldName%> = new Date();
                    <%=fields[fieldId].fieldName%>.setUTCDate(data.<%=fields[fieldId].fieldName%>.getDate());
                    <%=fields[fieldId].fieldName%>.setUTCMonth(data.<%=fields[fieldId].fieldName%>.getMonth());
                    <%=fields[fieldId].fieldName%>.setUTCFullYear(data.<%=fields[fieldId].fieldName%>.getFullYear());
                    data.<%=fields[fieldId].fieldName%> = <%=fields[fieldId].fieldName%>;<% } }%>
                    return angular.toJson(data);
                }
            }<% } else { %>
            'update': { method:'PUT' }<% } %>
        });
    });
