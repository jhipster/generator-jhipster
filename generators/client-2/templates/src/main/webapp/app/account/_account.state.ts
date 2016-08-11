AccountStateConfig.$inject = ['$stateProvider'];

export function AccountStateConfig($stateProvider) {
    $stateProvider.state('account', {
        abstract: true,
        parent: 'app'
    });
}
