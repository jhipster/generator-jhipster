(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('SettingsController', SettingsController);

    SettingsController.$inject = ['Principal', 'Auth'<% if (enableTranslation){ %>, '<%=jhiPrefixCapitalized%>LanguageService', '$translate'<% } %>];

    function SettingsController (Principal, Auth<% if (enableTranslation){ %>, <%=jhiPrefixCapitalized%>LanguageService, $translate<% } %>) {
        var vm = this;

        vm.error = null;
        vm.save = save;
        vm.settingsAccount = null;
        vm.success = null;

        /**
         * Store the "settings account" in a separate variable, and not in the shared "account" variable.
         */
        var copyAccount = function (account) {
            return {
                activated: account.activated,
                email: account.email,
                firstName: account.firstName,
                langKey: account.langKey,
                lastName: account.lastName,
                login: account.login
            };
        };

        Principal.identity().then(function(account) {
            vm.settingsAccount = copyAccount(account);
        });

        function save () {
            Auth.updateAccount(vm.settingsAccount).then(function() {
                vm.error = null;
                vm.success = 'OK';
                Principal.identity(true).then(function(account) {
                    vm.settingsAccount = copyAccount(account);
                });<% if (enableTranslation){ %>
                <%=jhiPrefixCapitalized%>LanguageService.getCurrent().then(function(current) {
                    if (vm.settingsAccount.langKey !== current) {
                        $translate.use(vm.settingsAccount.langKey);
                    }
                });<% } %>
            }).catch(function() {
                vm.success = null;
                vm.error = 'ERROR';
            });
        }
    }
})();
