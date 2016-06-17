import {Injectable} from '@angular/core';

AuditsService.$inject = ['$resource'];

@Injectable()
export function AuditsService ($resource) {
    var service = $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/audits/:id'<%} else { %>'management/jhipster/audits/:id'<% } %>, {}, {
        'get': {
            method: 'GET',
            isArray: true
        },
        'query': {
            method: 'GET',
            isArray: true,
            params: {fromDate: null, toDate: null}
        }
    });

    return service;
}
