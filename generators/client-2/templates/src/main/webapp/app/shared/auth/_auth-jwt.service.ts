import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { LocalStorageService, SessionStorageService } from 'ng2-webstorage';

@Injectable()
export class AuthServerProvider {
    constructor(
        private http: Http,
        private $localStorage: LocalStorageService,
        private $sessionStorage: SessionStorageService
    ){}

    getToken () {
        return this.$localStorage.retrieve('authenticationToken') || this.$sessionStorage.retrieve('authenticationToken');
    }

    login (credentials): Observable<any> {
<%_ if(authenticationType === 'uaa') { _%>
        let data = {
            username: credentials.username,
            password: credentials.password,
            grant_type: "password"
        };
        let headers = new Headers ({
            'Content-Type': 'application/x-www-form-urlencoded',
            "Authorization" : "Basic d2ViX2FwcDo="
        });

        return this.http.post('<%= uaaBaseName.toLowerCase() %>/oauth/token', data, {
            headers: headers
            //TODO this needs to be handled
            /*transformRequest: function(obj) {
                var str = [];
                for (var p in obj) {
                    str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                }
                return str.join('&');
            }*/
        }).map((resp) => {
            let accessToken = resp.json().data["access_token"];
            if (accessToken) {
                this.storeAuthenticationToken(accessToken, credentials.rememberMe);
            }
        });
<% } else { %>
        var data = {
            username: credentials.username,
            password: credentials.password,
            rememberMe: credentials.rememberMe
        };
        return this.http.post('api/authenticate', data).map(authenticateSuccess.bind(this));

        function authenticateSuccess (resp) {
            var bearerToken = resp.headers('Authorization');
            if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
                var jwt = bearerToken.slice(7, bearerToken.length);
                this.storeAuthenticationToken(jwt, credentials.rememberMe);
                return jwt;
            }
        }
<%_ } _%>
    }

    loginWithToken(jwt, rememberMe) {
        if (jwt) {
            this.storeAuthenticationToken(jwt, rememberMe);
            return Promise.resolve(jwt);
        } else {
            return Promise.reject("auth-jwt-service Promise reject"); //Put appropriate error message here
        }
    }

    storeAuthenticationToken(jwt, rememberMe) {
        if(rememberMe){
            this.$localStorage.store('authenticationToken', jwt);
        } else {
            this.$sessionStorage.store('authenticationToken', jwt);
        }
    }

    logout (): Observable<any> {
        return new Observable(observer => {
            this.$localStorage.clear('authenticationToken');
            this.$sessionStorage.clear('authenticationToken');
            observer.complete();
        });
    }
}
