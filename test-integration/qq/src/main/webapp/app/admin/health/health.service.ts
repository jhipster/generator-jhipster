import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { Health } from './health.model';

@Injectable({ providedIn: 'root' })
export class HealthService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  checkHealth(): Observable<Health> {
    return this.http.get<Health>(this.applicationConfigService.getEndpointFor('management/health'));
  }
}
