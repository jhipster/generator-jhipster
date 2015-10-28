(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('SessionsController', controller);

    controller.$inject = [
        'Sessions',
        'Principal'
    ];
    /* @ngInject */
    function controller(Sessions, Principal){

        vm.success = null;
        vm.error = null;
        vm.sessions = Sessions.getAll();


        activate();
        function activate(){
            Principal.identity().then(function(account) {
                vm.account = account;
            });
        }

        vm.invalidate = function (series) {
            Sessions.delete({series: encodeURIComponent(series)},
                function () {
                    vm.error = null;
                    vm.success = 'OK';
                    vm.sessions = Sessions.getAll();
                },
                function () {
                    vm.success = null;
                    vm.error = 'ERROR';
                });
        }

    }
})();
