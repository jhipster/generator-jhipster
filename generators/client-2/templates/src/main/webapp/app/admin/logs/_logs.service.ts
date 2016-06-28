import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { Log } from './log.model';

@Injectable()
export class LogsService {
    constructor(private http: Http) { }

    changeLevel(log: Log): Observable<Log[]> {
        return this.http.put('management/jhipster/logs', log).map((res: Response) => res.json());
    }

    findAll(): Observable<Log[]> {
        return this.http.get('management/jhipster/logs').map((res: Response) => res.json());
    }
}
