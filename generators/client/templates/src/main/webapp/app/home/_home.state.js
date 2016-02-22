(function() {
  'use strict';

  angular.module('<%=angularAppName%>')
      .config(function ($stateProvider) {
          $stateProvider
              .state('home', {
                  parent: 'app',
                  url: '/',
                  data: {
                      authorities: []
                  },
                  views: {
                      'content@': {
                          templateUrl: 'app/home/home.html',
                          controller: 'HomeController'
                      }
                  },
                  resolve: {
                      mainTranslatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate,$translatePartialLoader) {
                          $translatePartialLoader.addPart('home');
                          return $translate.refresh();
                      }]
                  }
              });
      });
})();
