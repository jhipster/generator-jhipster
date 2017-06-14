<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
(function() {
    'use strict';
<%_ let hasDate = false;
    if (fieldsContainInstant || fieldsContainZonedDateTime || fieldsContainLocalDate) {
        hasDate = true;
    }
_%>
    angular
        .module('<%=angularAppName%>')
        .factory('<%= entityClass %>', <%= entityClass %>);

    <%= entityClass %>.$inject = ['$resource'<% if (hasDate) { %>, 'DateUtils'<% } %>];

    function <%= entityClass %> ($resource<% if (hasDate) { %>, DateUtils<% } %>) {
        var resourceUrl = <% if (applicationType === 'gateway' && locals.microserviceName) {%> '<%= microserviceName.toLowerCase() %>/' +<% } %> 'api/<%= entityApiUrl %>/:id';

        return $resource(resourceUrl, {}, {
            'query': { method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    if (data) {
                        data = angular.fromJson(data);<% for (idx in fields) { if (fields[idx].fieldType === 'LocalDate') { %>
                        data.<%=fields[idx].fieldName%> = DateUtils.convertLocalDateFromServer(data.<%=fields[idx].fieldName%>);<% }if (['Instant', 'ZonedDateTime'].includes(fields[idx].fieldType)) { %>
                        data.<%=fields[idx].fieldName%> = DateUtils.convertDateTimeFromServer(data.<%=fields[idx].fieldName%>);<% } }%>
                    }
                    return data;
                }
            },<% if (fieldsContainLocalDate) { %>
            'update': {
                method: 'PUT',
                transformRequest: function (data) {
                    var copy = angular.copy(data);<% for (idx in fields) { if (fields[idx].fieldType === 'LocalDate') { %>
                    copy.<%=fields[idx].fieldName%> = DateUtils.convertLocalDateToServer(copy.<%=fields[idx].fieldName%>);<% } }%>
                    return angular.toJson(copy);
                }
            },
            'save': {
                method: 'POST',
                transformRequest: function (data) {
                    var copy = angular.copy(data);<% for (idx in fields) { if (fields[idx].fieldType === 'LocalDate') { %>
                    copy.<%=fields[idx].fieldName%> = DateUtils.convertLocalDateToServer(copy.<%=fields[idx].fieldName%>);<% } }%>
                    return angular.toJson(copy);
                }
            }<% } else { %>
            'update': { method:'PUT' }<% } %>
        });
    }
})();
