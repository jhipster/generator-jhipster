(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('SettingsController', controller);

    controller.$inject = [
        'Principal',
        'Auth'<% if (enableTranslation){ %>,
        'Language',
        '$translate'<% } %>
    ];
    /* @ngInject */
    function controller(Principal, Auth<% if (enableTranslation){ %>, Language, $translate<% } %>){

        var vm = this;
        vm.success = null;
        vm.error = null;
        vm.save = save;

        activate();
        function activate(){
            Principal.identity(true).then(function(account) {
                vm.settingsAccount = account;
            });
        }

        function save() {
            Auth.updateAccount(vm.settingsAccount).then(function() {
                vm.error = null;
                vm.success = 'OK';
                Principal.identity().then(function(account) {
                    vm.settingsAccount = account;
                });<% if (enableTranslation){ %>
                Language.getCurrent().then(function(current) {
                    if (vm.settingsAccount.langKey !== current) {
                        $translate.use(vm.settingsAccount.langKey);
                    }
                });<% } %>
            }).catch(function() {
                vm.success = null;
                vm.error = 'ERROR';
            });
        };

    }
})();
