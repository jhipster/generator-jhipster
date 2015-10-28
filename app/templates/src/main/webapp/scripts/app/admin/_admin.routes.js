(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(configure);

    configure.$inject = ['$stateProvider'];
    /* @ngInject */
    function configure($stateProvider){
        $stateProvider
            .state('admin', {
                abstract: true,
                parent: 'site'
            });
    }
})();
