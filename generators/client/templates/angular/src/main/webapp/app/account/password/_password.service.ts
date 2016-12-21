import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class Password {

    constructor (private http: Http) {}

    save(newPassword: string): Observable<any> {
        return this.http.post(<% if (authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account/change_password'<%} else { %>'api/account/change_password'<% } %>, newPassword);
    }
}
