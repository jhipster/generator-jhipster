(function() {
    'use strict';
<%_ let hasDate = false;
    if (fieldsContainZonedDateTime || fieldsContainLocalDate) {
        hasDate = true;
    }
_%>
    angular
        .module('<%=angularAppName%>')
        .factory('<%= entityClass %>', <%= entityClass %>);

    <%= entityClass %>.$inject = ['$resource'<% if (hasDate) { %>, 'DateUtils'<% } %>];

    function <%= entityClass %> ($resource<% if (hasDate) { %>, DateUtils<% } %>) {
        var resourceUrl = <% if (applicationType == 'gateway' && locals.microserviceName) {%> '<%= microserviceName.toLowerCase() %>/' +<% } %> 'api/<%= entityApiUrl %>/:id';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);<% for (idx in fields) { if (fields[idx].fieldType == 'LocalDate') { %>
                        data.<%=fields[idx].fieldName%> = DateUtils.convertLocalDateFromServer(data.<%=fields[idx].fieldName%>);<% }if (fields[idx].fieldType == 'ZonedDateTime') { %>
                        data.<%=fields[idx].fieldName%> = DateUtils.convertDateTimeFromServer(data.<%=fields[idx].fieldName%>);<% } }%>
                    }
                    return data;
                }
            },<% if (fieldsContainLocalDate) { %>
            'update': {
                method: 'PUT',
                transformRequest: function (data) {
                    var copy = angular.copy(data);<% for (idx in fields) { if (fields[idx].fieldType == 'LocalDate') { %>
                    copy.<%=fields[idx].fieldName%> = DateUtils.convertLocalDateToServer(copy.<%=fields[idx].fieldName%>);<% } }%>
                    return angular.toJson(copy);
                }
            },
            'save': {
                method: 'POST',
                transformRequest: function (data) {
                    var copy = angular.copy(data);<% for (idx in fields) { if (fields[idx].fieldType == 'LocalDate') { %>
                    copy.<%=fields[idx].fieldName%> = DateUtils.convertLocalDateToServer(copy.<%=fields[idx].fieldName%>);<% } }%>
                    return angular.toJson(copy);
                }
            }<% } else { %>
            'update': { method:'PUT' }<% } %>
        });
    }
})();
