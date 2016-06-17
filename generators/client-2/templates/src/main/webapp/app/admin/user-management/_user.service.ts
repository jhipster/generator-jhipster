import {Injectable} from '@angular/core';

User.$inject = ['$resource'];

@Injectable()
export function User ($resource) {
    var service = $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/users/:login'<%} else { %>'api/users/:login'<% } %>, {}, {
        'query': {method: 'GET', isArray: true},
        'get': {
            method: 'GET', isArray: false,
            interceptor: {
                response: function(response) {
                    // expose response
                    return response;
                }
            }
        },
        'save': { method:'POST' },
        'update': { method:'PUT' },
        'delete':{ method:'DELETE'}
    });

    return service;
}

