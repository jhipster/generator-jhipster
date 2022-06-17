import { Injectable, SecurityContext, NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import { translationNotFoundMessage } from 'app/config/translation.config';

export type AlertType = 'success' | 'danger' | 'warning' | 'info';

export interface Alert {
  id?: number;
  type: AlertType;
  message?: string;
  translationKey?: string;
  translationParams?: { [key: string]: unknown };
  timeout?: number;
  toast?: boolean;
  position?: string;
  close?: (alerts: Alert[]) => void;
}

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  timeout = 5000;
  toast = false;
  position = 'top right';

  // unique id for each alert. Starts from 0.
  private alertId = 0;
  private alerts: Alert[] = [];

  constructor(private sanitizer: DomSanitizer, private ngZone: NgZone, private translateService: TranslateService) {}

  clear(): void {
    this.alerts = [];
  }

  get(): Alert[] {
    return this.alerts;
  }

  /**
   * Adds alert to alerts array and returns added alert.
   * @param alert      Alert to add. If `timeout`, `toast` or `position` is missing then applying default value.
   *                   If `translateKey` is available then it's translation else `message` is used for showing.
   * @param extAlerts  If missing then adding `alert` to `AlertService` internal array and alerts can be retrieved by `get()`.
   *                   Else adding `alert` to `extAlerts`.
   * @returns  Added alert
   */
  addAlert(alert: Alert, extAlerts?: Alert[]): Alert {
    alert.id = this.alertId++;

    if (alert.translationKey) {
      const translatedMessage = this.translateService.instant(alert.translationKey, alert.translationParams);
      // if translation key exists
      if (translatedMessage !== `${translationNotFoundMessage}[${alert.translationKey}]`) {
        alert.message = translatedMessage;
      } else if (!alert.message) {
        alert.message = alert.translationKey;
      }
    }

    alert.message = this.sanitizer.sanitize(SecurityContext.HTML, alert.message ?? '') ?? '';
    alert.timeout = alert.timeout ?? this.timeout;
    alert.toast = alert.toast ?? this.toast;
    alert.position = alert.position ?? this.position;
    alert.close = (alertsArray: Alert[]) => this.closeAlert(alert.id!, alertsArray);

    (extAlerts ?? this.alerts).push(alert);

    if (alert.timeout > 0) {
      // Workaround protractor waiting for setTimeout.
      // Reference https://www.protractortest.org/#/timeouts
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.ngZone.run(() => {
            this.closeAlert(alert.id!, extAlerts ?? this.alerts);
          });
        }, alert.timeout);
      });
    }

    return alert;
  }

  private closeAlert(alertId: number, extAlerts?: Alert[]): void {
    const alerts = extAlerts ?? this.alerts;
    const alertIndex = alerts.map(alert => alert.id).indexOf(alertId);
    // if found alert then remove
    if (alertIndex >= 0) {
      alerts.splice(alertIndex, 1);
    }
  }
}
