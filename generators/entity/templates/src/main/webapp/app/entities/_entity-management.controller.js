(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%= entityAngularJSName %>Controller', <%= entityAngularJSName %>Controller);

    <%= entityAngularJSName %>Controller.$inject = ['$scope', '$state'<% if (fieldsContainBlob) { %>, 'DataUtils'<% } %>, '<%= entityClass %>'<% if (searchEngine == 'elasticsearch') { %>, '<%= entityClass %>Search'<% } %><% if (pagination != 'no') { %>, 'ParseLinks', 'AlertService', 'paginationConstants'<% } %> <%_ if (pagination == 'pager' || pagination == 'pagination'){ %>, 'pagingParams'<% } %>];

    function <%= entityAngularJSName %>Controller ($scope, $state<% if (fieldsContainBlob) { %>, DataUtils<% } %>, <%= entityClass %><% if (searchEngine == 'elasticsearch') { %>, <%= entityClass %>Search<% } %><% if (pagination != 'no') { %>, ParseLinks, AlertService, paginationConstants<% } %> <%_ if (pagination == 'pager' || pagination == 'pagination'){ %>, pagingParams<% } %>) {
        var vm = this;

        <%_ if (pagination == 'pagination' || pagination == 'pager') { _%>
<%- include('pagination-template'); -%>
        <%_ } else if (pagination == 'infinite-scroll') { _%>
<%- include('infinite-scroll-template'); -%>
        <%_ } else { _%>
<%- include('no-pagination-template'); -%>
        <%_ } _%>
    }
})();
