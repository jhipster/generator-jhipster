import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { Base64 } from './base64.service';
import { <%=jhiPrefixCapitalized%>TrackerService } from '../';

@Injectable()
export function AuthServerProvider ($http, $localStorage, Base64) {

    constructor(
        private http: Http,
        <%_ if (websocket === 'spring-websocket') { _%>
        private trackerService: <%=jhiPrefixCapitalized%>TrackerService,
        <%_ } _%>
        private base64: Base64,
        @Inject('$localStorage') private $localStorage
    ){}

    getToken () {
        return this.$localStorage.authenticationToken;
    }

    login (credentials): Observable<any> {
        let data = 'username=' +  encodeURIComponent(credentials.username) + '&password=' +
            encodeURIComponent(credentials.password) + '&grant_type=password&scope=read%20write&' +
            'client_secret=my-secret-token-to-change-in-production&client_id=<%= baseName%>app';
        let headers = new Headers ({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
            'Authorization': 'Basic ' + base64.encode('<%= baseName%>app' + ':' + 'my-secret-token-to-change-in-production')
        });

        return this.http.post('oauth/token', data, {
            headers: headers
        }).map(authSucess.bind(this));

        function authSucess (response) {
            let expiredAt = new Date();
            expiredAt.setSeconds(expiredAt.getSeconds() + response.expires_in);
            response.expires_at = expiredAt.getTime();
            this.$localStorage.authenticationToken = response;
            return response;
        }
    }

    logout (): Observable<any> {
        <%_ if (websocket === 'spring-websocket') { _%>
        this.trackerService.disconnect();
        <%_ } _%>
        this.http.post('api/logout', {}).map(resp => {
            delete this.$localStorage.authenticationToken;
            return resp;
        });
    }
}
