/*
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
import { Inject, Injectable, Sanitizer, SecurityContext } from '@angular/core';
import { TranslateService } from 'ng2-translate';

export type AlertType =  'success' | 'danger' | 'warning' | 'info';

export interface Alert {
    id?: number;
    type: AlertType;
    msg: string;
    params?: any;
    timeout?: number;
    toast?: boolean;
    position?: string;
    scoped?: boolean;
    close?: (alerts: Alert[]) => void;
}

@Injectable()
export class AlertService {

    private alertId: number;
    private alerts: Alert[];
    private timeout: number;

    constructor(
        private sanitizer: Sanitizer,
        @Inject('toast') private toast: boolean, // see the issue generator-jhipster#4794
        private translateService?: TranslateService
    ) {
        this.alertId = 0; // unique id for each alert. Starts from 0.
        this.alerts = [];
        this.timeout = 5000; // default timeout in milliseconds
    }

    clear() {
       this.alerts.splice(0, this.alerts.length);
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
            toast: this.isToast(),
            position: position
        }, []);
    }

    error(msg: string, params?: any, position?: string): Alert {
        return this.addAlert({
            type: 'danger',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.isToast(),
            position: position
        }, []);
    }

    warning(msg: string, params?: any, position?: string): Alert {
        return this.addAlert({
            type: 'warning',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.isToast(),
            position: position
        }, []);
    }

    info(msg: string, params?: any, position?: string): Alert {
        return this.addAlert({
            type: 'info',
            msg: msg,
            params: params,
            timeout: this.timeout,
            toast: this.isToast(),
            position: position
        }, []);
    }

    private factory(alertOptions: Alert): Alert {
        let alert: Alert = {
            type: alertOptions.type,
            msg: this.sanitizer.sanitize(SecurityContext.HTML, alertOptions.msg),
            id: alertOptions.id,
            timeout: alertOptions.timeout,
            toast: alertOptions.toast,
            position: alertOptions.position ? alertOptions.position : 'top right',
            scoped: alertOptions.scoped,
            close: (alerts: Alert[]) => {
                return this.closeAlert(alertOptions.id, alerts);
            }
        };
        if (!alert.scoped) {
            this.alerts.push(alert);
        }
        return alert;
    }

    addAlert(alertOptions: Alert, extAlerts: Alert[]): Alert {
        alertOptions.id = this.alertId++;
        if (this.translateService && alertOptions.msg) {
            alertOptions.msg = this.translateService.instant(alertOptions.msg, alertOptions.params);
        }
        let alert = this.factory(alertOptions);
        if (alertOptions.timeout && alertOptions.timeout > 0) {
            setTimeout(() => {
                this.closeAlert(alertOptions.id, extAlerts);
            }, alertOptions.timeout);
        }
        return alert;
    }

    closeAlert(id: number, extAlerts?: Alert[]): any {
        let thisAlerts: Alert[] = (extAlerts && extAlerts.length > 0) ? extAlerts : this.alerts;
        return this.closeAlertByIndex(thisAlerts.map(e => e.id).indexOf(id), thisAlerts);
    }

    closeAlertByIndex(index: number, thisAlerts: Alert[]): Alert[] {
        return thisAlerts.splice(index, 1);
    }

    isToast(): boolean {
        return this.toast;
    }
}
