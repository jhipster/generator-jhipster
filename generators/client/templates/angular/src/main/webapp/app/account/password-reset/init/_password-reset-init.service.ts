import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class PasswordResetInit {

    constructor (private http: Http) {}

    save(mail: string): Observable<any> {
        return this.http.post(<% if (authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account/reset_password/init'<%} else { %>'api/account/reset_password/init'<% } %>, mail);
    }
}
