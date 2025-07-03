import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';

@Injectable({ providedIn: 'root' })
export class PasswordResetInitService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  save(mail: string): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/account/reset-password/init'), mail);
  }
}
