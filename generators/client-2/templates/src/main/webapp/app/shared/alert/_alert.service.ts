import { Injectable, Sanitizer, SecurityContext } from '@angular/core';
<%_ if (enableTranslation){ _%>
import { TranslateService } from 'ng2-translate/ng2-translate';
<%_ } _%>

@Injectable()
export class AlertService {

    private alertId: number;
    private alerts: any[];
    private timeout: number;

    constructor(private sanitizer: Sanitizer, <% if (enableTranslation){ %>private translateService: TranslateService, <% } %>private toast: boolean) {
        this.alertId = 0; // unique id for each alert. Starts from 0.
        this.alerts = [];
        this.timeout = 5000; // default timeout
    }

    clear() {
        this.alerts = [];
    }

    get(): any {
        return this.alerts;
    }

    success(msg, params, position): any {
        return this.addAlert({
            type: 'success',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.toast,
            position: position
        }, []);
    }

    error(msg, params, position): any {
        return this.addAlert({
            type: 'danger',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.toast,
            position: position
        }, []);
    }

    warning(msg, params, position): any {
        return this.addAlert({
            type: 'warning',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.toast,
            position: position
        }, []);
    }

    info(msg, params, position): any {
        return this.addAlert({
            type: 'info',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.toast,
            position: position
        }, []);
    }

    factory(alertOptions): any {
        var alert = {
            type: alertOptions.type,
            msg: this.sanitizer.sanitize(SecurityContext.HTML, alertOptions.msg),
            id: alertOptions.alertId,
            timeout: alertOptions.timeout,
            toast: alertOptions.toast,
            position: alertOptions.position ? alertOptions.position : 'top right',
            scoped: alertOptions.scoped,
            close: function (alerts) {
                return this.closeAlert(this.id, alerts);
            }
        };
        if (!alert.scoped) {
            this.alerts.push(alert);
        }
        return alert;
    }

    addAlert(alertOptions, extAlerts): any {
        alertOptions.alertId = this.alertId++;
        <%_ if (enableTranslation){ _%>
        alertOptions.msg = this.translateService.instant(alertOptions.msg, alertOptions.params);
        <%_ } _%>
        var alert = this.factory(alertOptions);
        if (alertOptions.timeout && alertOptions.timeout > 0) {
            setTimeout(() => {
                this.closeAlert(alertOptions.alertId, extAlerts);
            }, alertOptions.timeout);
        }
        return alert;
    }

    closeAlert(id, extAlerts): any {
        var thisAlerts = extAlerts ? extAlerts : this.alerts;
        return this.closeAlertByIndex(thisAlerts.map(function (e) {
            return e.id;
        }).indexOf(id), thisAlerts);
    }

    closeAlertByIndex(index, thisAlerts): any {
        return thisAlerts.splice(index, 1);
    }

    isToast(): boolean {
        return this.toast;
    }
}
