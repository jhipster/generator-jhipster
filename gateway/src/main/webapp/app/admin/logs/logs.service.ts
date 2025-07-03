import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { Level, LoggersResponse } from './log.model';

@Injectable({ providedIn: 'root' })
export class LogsService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  changeLevel(name: string, configuredLevel: Level, service?: string): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`management/loggers/${name}`, service), { configuredLevel });
  }

  findAll(service?: string): Observable<LoggersResponse> {
    return this.http.get<LoggersResponse>(this.applicationConfigService.getEndpointFor('management/loggers', service));
  }
}
