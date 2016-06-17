import {Injectable} from '@angular/core';

LogsService.$inject = ['$resource'];

@Injectable()
export function LogsService ($resource) {
    var service = $resource('management/jhipster/logs', {}, {
        'findAll': { method: 'GET', isArray: true},
        'changeLevel': { method: 'PUT'}
    });

    return service;
}

