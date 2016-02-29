(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%= entityAngularJSName %>Controller', <%= entityAngularJSName %>Controller);

    <%= entityAngularJSName %>Controller.$inject = ['$scope', '$state'<% if (fieldsContainBlob) { %>, 'DataUtils'<% } %>, '<%= entityClass %>'<% if (searchEngine == 'elasticsearch') { %>, '<%= entityClass %>Search'<% } %><% if (pagination != 'no') { %>, 'ParseLinks'<% } %> <%_ if (pagination == 'pager' || pagination == 'pagination'){ %>, 'AlertService', 'pagingParams', 'paginationConstants'<% } %>];

    function <%= entityAngularJSName %>Controller ($scope, $state<% if (fieldsContainBlob) { %>, DataUtils<% } %>, <%= entityClass %><% if (searchEngine == 'elasticsearch') { %>, <%= entityClass %>Search<% } %><% if (pagination != 'no') { %>, ParseLinks<% } %> <%_ if (pagination == 'pager' || pagination == 'pagination'){ %>, AlertService, pagingParams, paginationConstants<% } %>) {
        var vm = this;
        <%_ if (pagination == 'pagination' || pagination == 'pager') { _%>
<%- include('pagination-template'); -%>
        <%_ } else if (pagination == 'infinite-scroll') { _%>
<%- include('infinite-scroll-template'); -%>
        <%_ } else { _%>
<%- include('no-pagination-template'); -%>
        <% } %>
    }
})();
