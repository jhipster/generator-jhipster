(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('UserManagementDetailController', controller);

    controller.$inject = [
        '$stateParams',
        'User'
    ];
    /* @ngInject */
    function controller($stateParams, User){

        var vm = this;
        vm.user = {};
        vm.load = load;

        activate();
        function activate(){
            vm.load($stateParams.login);
        }

        function load(login) {
            User.get({login: login}, function(result) {
                vm.user = result;
            });
        };

    }
})();
