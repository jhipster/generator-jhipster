(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('UserManagementController', controller);

    controller.$inject = [
        'User',
        'ParseLinks'<% if (enableTranslation) { %>,
        'Language'<% } %>
    ];
    /* @ngInject */
    function controller(User, ParseLinks<% if (enableTranslation) { %>, Language<% } %>){

        var vm = this;
        vm.users = [];
        vm.authorities = ["ROLE_USER", "ROLE_ADMIN"];
        vm.page = 0;
        vm.loadAll = loadAll;
        vm.loadPage = loadPage;
        vm.setActive = setActive;
        vm.showUpdate = showUpdate;
        vm.save = save;
        vm.refresh = refresh;
        vm.clear = clear;

            activate();
        function activate(){
        <% if (enableTranslation) { %>
            Language.getAll().then(function (languages) {
                vm.languages = languages;
            });
        <% } %>
        vm.loadAll();
        }

       function loadAll() {
        <% if (databaseType == 'sql' || databaseType == 'mongodb') { %>
            User.query({page: vm.page, per_page: 20}, function (result, headers) {
                vm.links = ParseLinks.parse(headers('link'));<% } else { %>
            User.query({}, function (result) {<% } %>
                vm.users = result;
            });
        };

        function loadPage(page) {
            vm.page = page;
            vm.loadAll();
        };
        function setActive(user, isActivated) {
            user.activated = isActivated;
            User.update(user, function () {
                vm.loadAll();
                vm.clear();
            });
        };

        function showUpdate(login) {
            User.get({login: login}, function (result) {
                vm.user = result;
                $('#saveUserModal').modal('show');
            });
        };

        function save() {
            User.update(vm.user,
                function () {
                    vm.refresh();
                });
        };

        function refresh() {
            vm.loadAll();
            $('#saveUserModal').modal('hide');
            vm.clear();
        };

        function clear() {
            vm.user = {
                id: null, login: null, firstName: null, lastName: null, email: null,
                activated: null, langKey: null, createdBy: null, createdDate: null,
                lastModifiedBy: null, lastModifiedDate: null, resetDate: null,
                resetKey: null, authorities: null
            };
            vm.editForm.$setPristine();
            vm.editForm.$setUntouched();
        };
    }
})();
