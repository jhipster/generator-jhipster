import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class PasswordResetFinish {

    constructor (private http: Http) {}

    save(keyAndPassword: any): Observable<any> {
        return this.http.post(<% if (authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account/reset_password/finish'<%} else { %>'api/account/reset_password/finish'<% } %>, keyAndPassword);
    }
}
