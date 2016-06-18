import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';

<%=jhiPrefixCapitalized%>MetricsService.$inject = ['$rootScope'];
@Injectable()
export function <%=jhiPrefixCapitalized%>MetricsService ($rootScope) {
    var service = {
        getMetrics: getMetrics,
        threadDump: threadDump
    };

    return service;    

    function getMetrics () {
        return this.http.get('management/jhipster/metrics').toPromise().
            then( (response) => {
                return response.data;
        });
    }

    function threadDump () {
        return this.http.get('management/dump').toPromise().
            then(response => {
                return response.data;
        });
    }
}