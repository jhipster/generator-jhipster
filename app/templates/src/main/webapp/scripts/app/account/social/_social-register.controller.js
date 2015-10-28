(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('RegisterController', controller);

    controller.$inject = [
        '$filter',
        '$stateParams'];
    /* @ngInject */
    function controller($filter, $stateParams){

        var vm = this;
        vm.provider = $stateParams.provider;
        vm.providerLabel = $filter('capitalize')(vm.provider);
        vm.success = $stateParams.success;
        vm.error = !vm.success;

        activate();
        function activate(){

        }

    }
})();
