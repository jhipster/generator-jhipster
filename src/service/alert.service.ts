import { Injectable, Sanitizer, SecurityContext } from '@angular/core';
import { TranslateService } from 'ng2-translate';
import { ConfigHelper } from '../helper';

export type AlertType =  'success' | 'danger' | 'warning' | 'info';

export class Alert {
    id: number;
    type: AlertType;
    msg: string;
    params?: any;
    timeout: number;
    toast: boolean;
    position: string;
    scoped: boolean;
    close: (alerts: Alert[]) => void;
}

export class AlertOptions {
    alertId?: number;
    type: AlertType;
    msg: string;
    params: any;
    timeout: number;
    toast: boolean;
    position?: string;
    scoped?: boolean;
    close?: (alerts: Alert[]) => void;
}

@Injectable()
export class AlertService {

    private alertId: number;
    private alerts: Alert[];
    private timeout: number;
    private i18nEnabled: boolean;
    private translateService: TranslateService;

    constructor(private sanitizer: Sanitizer, private toast?: boolean, translateService?: TranslateService) {
        this.i18nEnabled = ConfigHelper.getConfig().i18nEnabled;
        this.alertId = 0; // unique id for each alert. Starts from 0.
        this.alerts = [];
        this.timeout = 5000; // default timeout in milliseconds
        if (this.i18nEnabled) {
            this.translateService = translateService;
        }
    }

    clear() {
        this.alerts = [];
    }

    get(): Alert[] {
        return this.alerts;
    }

    success(msg: string, params?: any, position?: string): Alert {
        return this.addAlert({
            type: 'success',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.toast,
            position: position
        }, []);
    }

    error(msg: string, params?: any, position?: string): Alert {
        return this.addAlert({
            type: 'danger',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.toast,
            position: position
        }, []);
    }

    warning(msg: string, params?: any, position?: string): Alert {
        return this.addAlert({
            type: 'warning',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.toast,
            position: position
        }, []);
    }

    info(msg: string, params?: any, position?: string): Alert {
        return this.addAlert({
            type: 'info',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.toast,
            position: position
        }, []);
    }

    private factory(alertOptions: AlertOptions): Alert {
        let alert: Alert = {
            type: alertOptions.type,
            msg: this.sanitizer.sanitize(SecurityContext.HTML, alertOptions.msg),
            id: alertOptions.alertId,
            timeout: alertOptions.timeout,
            toast: alertOptions.toast,
            position: alertOptions.position ? alertOptions.position : 'top right',
            scoped: alertOptions.scoped,
            close: (alerts: Alert[]) => {
                return this.closeAlert(alertOptions.alertId, alerts);
            }
        };
        if (!alert.scoped) {
            this.alerts.push(alert);
        }
        return alert;
    }

    addAlert(alertOptions: AlertOptions, extAlerts: Alert[]): Alert {
        alertOptions.alertId = this.alertId++;
        if (this.i18nEnabled && alertOptions.msg) {
            alertOptions.msg = this.translateService.instant(alertOptions.msg, alertOptions.params);
        }
        let alert = this.factory(alertOptions);
        if (alertOptions.timeout && alertOptions.timeout > 0) {
            setTimeout(() => {
                this.closeAlert(alertOptions.alertId, extAlerts);
            }, alertOptions.timeout);
        }
        return alert;
    }

    closeAlert(id: number, extAlerts?: Alert[]): any {
        let thisAlerts: Alert[] = extAlerts ? extAlerts : this.alerts;
        return this.closeAlertByIndex(thisAlerts.map(function (e) {
            return e.id;
        }).indexOf(id), thisAlerts);
    }

    closeAlertByIndex(index: number, thisAlerts: Alert[]): Alert[] {
        return thisAlerts.splice(index, 1);
    }

    isToast(): boolean {
        return this.toast;
    }
}
