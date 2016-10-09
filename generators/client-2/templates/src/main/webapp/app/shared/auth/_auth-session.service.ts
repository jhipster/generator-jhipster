import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { LocalStorageService } from 'ng2-webstorage';

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
        private $localStorage: LocalStorageService

    ){}

    getToken () {
        return this.$localStorage.retrieve('authenticationToken');
    }

    hasValidToken () {
        return !!this.getToken();
    }

    login (credentials): Observable<any> {
        let data = 'j_username=' + encodeURIComponent(credentials.username) +
            '&j_password=' + encodeURIComponent(credentials.password) +
            '&remember-me=' + credentials.rememberMe + '&submit=Login';
        let headers = new Headers ({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        return this.http.post('api/authentication', data, {
            headers: headers
        });
    }

    logout (): Observable<any> {
        <%_ if (websocket === 'spring-websocket') { _%>
        this.trackerService.disconnect();
        <%_ } _%>
        <%_ if(authenticationType === 'uaa') { _%>
        this.$localStorage.clear('authenticationToken');
        <%_ } else { _%>
        // logout from the server
        return this.http.post('api/logout', {}).map((response: Response) => {

            this.$localStorage.clear('authenticationToken');
            // to get a new csrf token call the api
            this.http.get('api/account').subscribe(() => {}, () => {});
            return response;
        });
        <%_ } _%>
    }
}
