import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { GatewayRoute } from './gateway-route.model';

@Injectable()
export class GatewayRoutesService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  findAll(): Observable<GatewayRoute[]> {
    return this.http.get<GatewayRoute[]>(this.applicationConfigService.getEndpointFor('api/gateway/routes/'));
  }
}
