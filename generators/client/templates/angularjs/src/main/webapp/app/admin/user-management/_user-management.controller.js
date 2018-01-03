<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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
        .controller('UserManagementController', UserManagementController);

    UserManagementController.$inject = ['Principal', 'User', 'ParseLinks', 'AlertService'<% if (databaseType !== 'cassandra') { %>, '$state', 'pagingParams', 'paginationConstants'<% } %><% if (enableTranslation) { %>, '<%=jhiPrefixCapitalized%>LanguageService'<% } %>];

    function UserManagementController(Principal, User, ParseLinks, AlertService<% if (databaseType !== 'cassandra') { %>, $state, pagingParams, paginationConstants<% } %><% if (enableTranslation) { %>, <%=jhiPrefixCapitalized%>LanguageService<% } %>) {
        var vm = this;

        vm.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        vm.currentAccount = null;
        vm.languages = null;
        vm.loadAll = loadAll;
        vm.setActive = setActive;
        vm.users = [];
        <% if (databaseType !== 'cassandra') { %>vm.page = 1;
        vm.totalItems = null;
        vm.clear = clear;
        vm.links = null;
        vm.loadPage = loadPage;
        vm.predicate = pagingParams.predicate;
        vm.reverse = pagingParams.ascending;
        vm.itemsPerPage = paginationConstants.itemsPerPage;
        vm.transition = transition;<% } %>

        vm.loadAll();
        <%_ if (enableTranslation) { _%>
        <%=jhiPrefixCapitalized%>LanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });
        <%_ } _%>
        Principal.identity().then(function(account) {
            vm.currentAccount = account;
        });

        function setActive (user, isActivated) {
            user.activated = isActivated;
            User.update(user, function () {
                vm.loadAll();
                vm.clear();
            });
        }

        function loadAll () {
            User.query(<% if (databaseType !== 'cassandra') { %>{
                page: pagingParams.page - 1,
                size: vm.itemsPerPage,
                sort: sort()
            }, <% } %>onSuccess, onError);
        }

        function onSuccess(data, headers) {
            <% if (databaseType !== 'cassandra') { %>vm.links = ParseLinks.parse(headers('link'));
            vm.totalItems = headers('X-Total-Count');
            vm.queryCount = vm.totalItems;
            vm.page = pagingParams.page;<% } %>
            vm.users = data;
        }

        function onError(error) {
            AlertService.error(error.data.message);
        }

<%_ if (databaseType !== 'cassandra') { _%>
        function clear () {
            vm.user = {
                id: null, login: null, firstName: null, lastName: null, email: null,
                activated: null, langKey: null, createdBy: null, createdDate: null,
                lastModifiedBy: null, lastModifiedDate: null, resetDate: null,
                resetKey: null, authorities: null
            };
        }

        function sort () {
            var result = [vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc')];
            if (vm.predicate !== 'id') {
                result.push('id');
            }
            return result;
        }

        function loadPage (page) {
            vm.page = page;
            vm.transition();
        }

        function transition () {
            $state.transitionTo($state.$current, {
                page: vm.page,
                sort: vm.predicate + ',' + (vm.reverse ? 'asc' : 'desc'),
                search: vm.currentSearch
            });
        }
<%_ } _%>
    }
})();
