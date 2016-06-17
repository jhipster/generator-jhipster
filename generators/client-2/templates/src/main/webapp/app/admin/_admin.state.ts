AdminStateConfig.$inject = ['$stateProvider'];

export function AdminStateConfig ($stateProvider) {
    $stateProvider.state('admin', {
        abstract: true,
        parent: 'app'
    });
}
