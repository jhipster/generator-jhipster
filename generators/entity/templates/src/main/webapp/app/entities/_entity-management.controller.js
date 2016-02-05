'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>ManagementController', function ($scope, $state<% if (fieldsContainBlob) { %>, DataUtils<% } %>, <%= entityClass %><% if (searchEngine == 'elasticsearch') { %>, <%= entityClass %>Search<% } %><% if (pagination != 'no') { %>, ParseLinks<% } %> <%_ if (pagination == 'pager' || pagination == 'pagination'){ %>, paginationConstants<% } %>) {

    <%_ if (pagination == 'pagination' || pagination == 'pager') { _%>
<%- include('pagination-template'); -%>
    <%_ } else if (pagination == 'infinite-scroll') { _%>
<%- include('infinite-scroll-template'); -%>
    <%_ } else { _%>
<%- include('no-pagination-template'); -%>
    <%_ } _%>
    });
