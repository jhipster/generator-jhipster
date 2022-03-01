import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { LoggersResponse, Level } from './log.model';

@Injectable({ providedIn: 'root' })
export class LogsService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  changeLevel(name: string, configuredLevel: Level): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`management/loggers/${name}`), { configuredLevel });
  }

  findAll(): Observable<LoggersResponse> {
    return this.http.get<LoggersResponse>(this.applicationConfigService.getEndpointFor('management/loggers'));
  }
}
