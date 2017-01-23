import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { GatewayRoute } from './gateway-route.model';

@Injectable()
export class GatewayRoutesService {
    constructor(private http: Http) { }

    findAll(): Observable<GatewayRoute[]> {
        return this.http.get('api/gateway/routes/').map((res: Response) => res.json());
    }
}
