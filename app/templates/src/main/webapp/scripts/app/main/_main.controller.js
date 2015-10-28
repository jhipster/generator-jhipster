(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('MainController', controller);

    controller.$inject = [
        'Principal'
    ];
    /* @ngInject */
    function controller(Principal){

        var vm = this;

        activate();
        function activate(){
            Principal.identity().then(function(account) {
                vm.account = account;
                vm.isAuthenticated = Principal.isAuthenticated;
            });
        }

    }
})();
