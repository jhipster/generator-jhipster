import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { User } from './user.model';

@Injectable()
export class UserService {
    constructor(private http: Http) { }

    update(user:User): Observable<Response> {
        return this.http.put(<% if(authenticationType === 'uaa') { %>`<%= uaaBaseName.toLowerCase() %>/api/users`<%} else { %>`api/users`<% } %>, user);
    }

    find(login:string): Observable<User> {
        return this.http.get(<% if(authenticationType === 'uaa') { %>`<%= uaaBaseName.toLowerCase() %>/api/users/${login}`<%} else { %>`api/users/${login}`<% } %>).map((res: Response) => res.json());
    }

    findAll(): Observable<Response> {
        return this.http.get(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/users'<%} else { %>'api/users'<% } %>);
    }

    delete(login:string): Observable<Response> {
        return this.http.delete(<% if(authenticationType === 'uaa') { %>`<%= uaaBaseName.toLowerCase() %>/api/users/${login}`<%} else { %>`api/users/${login}`<% } %>);
    }
}

