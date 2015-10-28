(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('LogsController', controller);

    controller.$inject = ['LogsService'];
    /* @ngInject */
    function controller(LogsService){

        var vm = this;
        vm.loggers = LogsService.findAll();
        vm.changeLevel = changeLevel;

        activate();
        function activate(){

        }

        function changeLevel(name, level) {
            LogsService.changeLevel({name: name, level: level}, function () {
                vm.loggers = LogsService.findAll();
            });
        }

    }
})();
