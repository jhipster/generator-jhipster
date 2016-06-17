import {Injectable} from '@angular/core';

GatewayRoutes.$inject = ['$resource'];

@Injectable()
export function GatewayRoutes ($resource) {
    var service = $resource('api/gateway/routes/:id', {}, {
        'query': { method: 'GET', isArray: true},
        'get': {
            method: 'GET', isArray: false,
            interceptor: {
                response: function(response) {
                    // expose response
                    return response;
                }
            }
        },
        'update': { method:'PUT' }
    });

    return service;
}
