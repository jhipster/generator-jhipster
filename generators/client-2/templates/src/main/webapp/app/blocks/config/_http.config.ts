HttpConfig.$inject = ['$httpProvider', 'httpRequestInterceptorCacheBusterProvider'];

export function HttpConfig($httpProvider, httpRequestInterceptorCacheBusterProvider) {
    //Cache everything except rest api requests
    httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*api.*/, /.*protected.*/], true);

    $httpProvider.interceptors.push('ErrorHandlerInterceptor');
    $httpProvider.interceptors.push('NotificationInterceptor');
    // jhipster-needle-angularjs-add-interceptor JHipster will add new application http interceptor here
}
