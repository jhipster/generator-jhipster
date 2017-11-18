<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
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

    angular
        .module('<%=angularAppName%>')
        .controller('<%= entityAngularName %>Controller', <%= entityAngularName %>Controller);

    <%= entityAngularName %>Controller.$inject = [<% if (pagination === 'pagination' || pagination === 'pager') { %>'$state', <% } %><% if (fieldsContainBlob) { %>'DataUtils', <% } %>'<%= entityClass %>'<% if (searchEngine === 'elasticsearch') { %>, '<%= entityClass %>Search'<% } %><% if (pagination !== 'no') { %>, 'ParseLinks', 'AlertService', 'paginationConstants'<% } %> <%_ if (pagination === 'pager' || pagination === 'pagination'){ %>, 'pagingParams'<% } %>];

    function <%= entityAngularName %>Controller(<% if (pagination === 'pagination' || pagination === 'pager') { %>$state, <% } %><% if (fieldsContainBlob) { %>DataUtils, <% } %><%= entityClass %><% if (searchEngine === 'elasticsearch') { %>, <%= entityClass %>Search<% } %><% if (pagination !== 'no') { %>, ParseLinks, AlertService, paginationConstants<% } %> <%_ if (pagination === 'pager' || pagination === 'pagination'){ %>, pagingParams<% } %>) {

        var vm = this;

        <%_ if (pagination === 'pagination' || pagination === 'pager') { _%>
<%- include('pagination-template'); -%>
        <%_ } else if (pagination === 'infinite-scroll') { _%>
<%- include('infinite-scroll-template'); -%>
        <%_ } else { _%>
<%- include('no-pagination-template'); -%>
        <%_ } _%>
    }
})();
