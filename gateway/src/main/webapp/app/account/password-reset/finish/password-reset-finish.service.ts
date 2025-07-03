import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

@Injectable({ providedIn: 'root' })
export class PasswordResetFinishService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  save(key: string, newPassword: string): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/account/reset-password/finish'), { key, newPassword });
  }
}
