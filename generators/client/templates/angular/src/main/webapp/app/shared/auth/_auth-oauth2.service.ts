import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { LocalStorageService } from 'ng2-webstorage';

import { Base64 } from 'ng-jhipster';

@Injectable()
export class AuthServerProvider {

    constructor(
        private http: Http,
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
        return new Observable(observer => {
            this.http.post('api/logout', {});
            this.$localStorage.clear('authenticationToken');
            observer.complete();
        });
    }
}
