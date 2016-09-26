UIRouterDeferInterceptConfig.$inject = ['$urlRouterProvider'];

export function UIRouterDeferInterceptConfig($urlRouterProvider) {
    // Wait until ng-upgrade is ready, in app.main.ts
    $urlRouterProvider.deferIntercept();
}
