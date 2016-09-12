PasswordStateConfig.$inject = ['$stateProvider'];

 export function PasswordStateConfig($stateProvider) {
     $stateProvider.state('password', {
         parent: 'account',
         url: '/password',
         data: {
             authorities: ['ROLE_USER'],
             pageTitle: 'global.menu.account.password'
         },
         views: {
             'content@': {
                 template: '<password></password>'
             }
         },
         resolve: {
             translatePartialLoader: ['$translate', '$translatePartialLoader', function ($translate, $translatePartialLoader) {
                 $translatePartialLoader.addPart('password');
                 return $translate.refresh();
             }]
         }
    });
}
