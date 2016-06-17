HttpConfig.$inject = ['$urlRouterProvider', '$httpProvider', 'httpRequestInterceptorCacheBusterProvider', '$urlMatcherFactoryProvider'];

export function HttpConfig($urlRouterProvider, $httpProvider, httpRequestInterceptorCacheBusterProvider, $urlMatcherFactoryProvider) {
    <% if (authenticationType == 'session') { %>
    //enable CSRF
    $httpProvider.defaults.xsrfCookieName = 'CSRF-TOKEN';
    $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-TOKEN';
    <% } %>
    //Cache everything except rest api requests
    httpRequestInterceptorCacheBusterProvider.setMatchlist([/.*api.*/, /.*protected.*/], true);

    $urlRouterProvider.otherwise('/');

    $httpProvider.interceptors.push('ErrorHandlerInterceptor');
    $httpProvider.interceptors.push('AuthExpiredInterceptor');<% if (authenticationType === 'oauth2' || authenticationType === 'jwt' || authenticationType === 'uaa') { %>
    $httpProvider.interceptors.push('AuthInterceptor');<% } %>
    $httpProvider.interceptors.push('NotificationInterceptor');
    // jhipster-needle-angularjs-add-interceptor JHipster will add new application http interceptor here

    $urlMatcherFactoryProvider.type('boolean', {
        name : 'boolean',
        decode: function(val) { return val === true || val === 'true'; },
        encode: function(val) { return val ? 1 : 0; },
        equals: function(a, b) { return this.is(a) && a === b; },
        is: function(val) { return [true,false,0,1].indexOf(val) >= 0; },
        pattern: /bool|true|0|1/
    });
}
