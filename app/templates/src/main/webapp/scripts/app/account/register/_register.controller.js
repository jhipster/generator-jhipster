(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('RegisterController', controller);

    controller.$inject = [<% if (enableTranslation){ %>
        '$translate', <% } %>
        '$timeout',
        'Auth'
    ];
    /* @ngInject */
    function controller(<% if (enableTranslation){ %>$translate, <% } %>$timeout, Auth){

        var vm = this;
        vm.success = null;
        vm.error = null;
        vm.doNotMatch = null;
        vm.errorUserExists = null;
        vm.registerAccount = {};
        vm.register = register;

        activate();
        function activate(){
            $timeout(function (){angular.element('[ng-model="registerAccount.login"]').focus();});
        }

        function register() {
            if (vm.registerAccount.password !== vm.confirmPassword) {
                vm.doNotMatch = 'ERROR';
            } else {
                vm.registerAccount.langKey = <% if (enableTranslation){ %>$translate.use()<% }else {%> 'en' <% } %>;
                vm.doNotMatch = null;
                vm.error = null;
                vm.errorUserExists = null;
                vm.errorEmailExists = null;

                Auth.createAccount(vm.registerAccount).then(function () {
                    vm.success = 'OK';
                }).catch(function (response) {
                    vm.success = null;
                    if (response.status === 400 && response.data === 'login already in use') {
                        vm.errorUserExists = 'ERROR';
                    } else if (response.status === 400 && response.data === 'e-mail address already in use') {
                        vm.errorEmailExists = 'ERROR';
                    } else {
                        vm.error = 'ERROR';
                    }
                });
            }
        };

    }
})();
