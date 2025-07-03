import { Injectable, Signal, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, ReplaySubject, of } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';

import { StateStorageService } from 'app/core/auth/state-storage.service';
import { Account } from 'app/core/auth/account.model';
import { ApplicationConfigService } from '../config/application-config.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly userIdentity = signal<Account | null>(null);
  private readonly authenticationState = new ReplaySubject<Account | null>(1);
  private accountCache$?: Observable<Account> | null;

  private readonly translateService = inject(TranslateService);
  private readonly http = inject(HttpClient);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly router = inject(Router);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  save(account: Account): Observable<{}> {
    return this.http.post(this.applicationConfigService.getEndpointFor('api/account'), account);
  }

  authenticate(identity: Account | null): void {
    this.userIdentity.set(identity);
    this.authenticationState.next(this.userIdentity());
    if (!identity) {
      this.accountCache$ = null;
    }
  }

  trackCurrentAccount(): Signal<Account | null> {
    return this.userIdentity.asReadonly();
  }

  hasAnyAuthority(authorities: string[] | string): boolean {
    const userIdentity = this.userIdentity();
    if (!userIdentity) {
      return false;
    }
    if (!Array.isArray(authorities)) {
      authorities = [authorities];
    }
    return userIdentity.authorities.some((authority: string) => authorities.includes(authority));
  }

  identity(force?: boolean): Observable<Account | null> {
    if (!this.accountCache$ || force) {
      this.accountCache$ = this.fetch().pipe(
        tap((account: Account) => {
          this.authenticate(account);

          // After retrieve the account info, the language will be changed to
          // the user's preferred language configured in the account setting
          // unless user have chosen another language in the current session
          if (!this.stateStorageService.getLocale()) {
            this.translateService.use(account.langKey);
          }

          this.navigateToStoredUrl();
        }),
        shareReplay(),
      );
    }
    return this.accountCache$.pipe(catchError(() => of(null)));
  }

  isAuthenticated(): boolean {
    return this.userIdentity() !== null;
  }

  getAuthenticationState(): Observable<Account | null> {
    return this.authenticationState.asObservable();
  }

  private fetch(): Observable<Account> {
    return this.http.get<Account>(this.applicationConfigService.getEndpointFor('api/account'));
  }

  private navigateToStoredUrl(): void {
    // previousState can be set in the authExpiredInterceptor and in the userRouteAccessService
    // if login is successful, go to stored previousState and clear previousState
    const previousUrl = this.stateStorageService.getUrl();
    if (previousUrl) {
      this.stateStorageService.clearUrl();
      this.router.navigateByUrl(previousUrl);
    }
  }
}
