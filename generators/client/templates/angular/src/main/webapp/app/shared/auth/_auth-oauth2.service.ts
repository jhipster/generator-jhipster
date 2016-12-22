import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { LocalStorageService } from 'ng2-webstorage';

import { Base64 } from './base64.service';
<%_ if (websocket === 'spring-websocket') { _%>
import { <%=jhiPrefixCapitalized%>TrackerService } from '../tracker/tracker.service';
<%_ } _%>

@Injectable()
export class AuthServerProvider {

    constructor(
        private http: Http,
        <%_ if (websocket === 'spring-websocket') { _%>
        private trackerService: <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
        private base64: Base64,
        private $localStorage: LocalStorageService
    ) {}

    getToken () {
        return this.$localStorage.retrieve('authenticationToken');
    }

    login (credentials): Observable<any> {
        let data = 'username=' +  encodeURIComponent(credentials.username) + '&password=' +
            encodeURIComponent(credentials.password) + '&grant_type=password&scope=read%20write&' +
            'client_secret=my-secret-token-to-change-in-production&client_id=<%= baseName%>app';
        let headers = new Headers ({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + this.base64.encode('<%= baseName%>app' + ':' + 'my-secret-token-to-change-in-production')
        });

        return this.http.post('oauth/token', data, {
            headers: headers
        }).map(authSuccess.bind(this));

        function authSuccess (resp) {
            let response = resp.json();
            let expiredAt = new Date();
            expiredAt.setSeconds(expiredAt.getSeconds() + response.expires_in);
            response.expires_at = expiredAt.getTime();
            this.$localStorage.store('authenticationToken', response);
            return response;
        }
    }

    logout (): Observable<any> {
        <%_ if (websocket === 'spring-websocket') { _%>
        this.trackerService.disconnect();
        <%_ } _%>
        return this.http.post('api/logout', {}).map((response: Response) => {
            this.$localStorage.clear('authenticationToken');
            return response;
        });
    }
}
