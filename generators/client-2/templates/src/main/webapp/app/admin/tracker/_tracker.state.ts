(function() {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .config(stateConfig);

    stateConfig.$inject = ['$stateProvider'];

    function stateConfig($stateProvider) {
        $stateProvider.state('<%=jhiPrefix%>-tracker', {
            parent: 'admin',
            url: '/tracker',
            data: {
                authorities: ['ROLE_ADMIN'],
                pageTitle: 'tracker.title'
            },
            views: {
                'content@': {
                    templateUrl: 'app/admin/tracker/tracker.html',
                    controller: '<%=jhiPrefixCapitalized%>TrackerController',
                    controllerAs: 'vm'
                }
            },
            resolve: {
                mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                    $translatePartialLoader.addPart('tracker');
                    return $translate.refresh();
                }]
            },
            onEnter: ['<%=jhiPrefixCapitalized%>TrackerService', function(<%=jhiPrefixCapitalized%>TrackerService) {
                <%=jhiPrefixCapitalized%>TrackerService.subscribe();
            }],
            onExit: ['<%=jhiPrefixCapitalized%>TrackerService', function(<%=jhiPrefixCapitalized%>TrackerService) {
                <%=jhiPrefixCapitalized%>TrackerService.unsubscribe();
            }]
        });
    }
})();
