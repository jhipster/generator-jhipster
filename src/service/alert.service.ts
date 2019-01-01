/*
 Copyright 2013-2019 the original author or authors from the JHipster project.

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
import { Injectable, Sanitizer, SecurityContext } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { JhiConfigService } from '../config.service';

export type JhiAlertType =  'success' | 'danger' | 'warning' | 'info';

export interface JhiAlert {
    id?: number;
    type: JhiAlertType;
    msg: string;
    params?: any;
    timeout?: number;
    toast?: boolean;
    position?: string;
    scoped?: boolean;
    close?: (alerts: JhiAlert[]) => void;
}

@Injectable({
    providedIn: 'root'
})
export class JhiAlertService {

    private alertId: number;
    private alerts: JhiAlert[];
    private timeout: number;
    private toast: boolean;
    private i18nEnabled: boolean;

    constructor(
        private sanitizer: Sanitizer,
        private configService: JhiConfigService,
        private translateService: TranslateService
    ) {
        const config = this.configService.getConfig();
        this.toast = config.alertAsToast;
        this.i18nEnabled = config.i18nEnabled;
        this.alertId = 0; // unique id for each alert. Starts from 0.
        this.alerts = [];
        this.timeout = config.alertTimeout;
    }

    clear() {
       this.alerts.splice(0, this.alerts.length);
    }

    get(): JhiAlert[] {
        return this.alerts;
    }

    success(msg: string, params?: any, position?: string): JhiAlert {
        return this.addAlert({
            type: 'success',
            msg,
            params,
            timeout: this.timeout,
            toast: this.isToast(),
            position
        }, []);
    }

    error(msg: string, params?: any, position?: string): JhiAlert {
        return this.addAlert({
            type: 'danger',
            msg,
            params,
            timeout: this.timeout,
            toast: this.isToast(),
            position
        }, []);
    }

    warning(msg: string, params?: any, position?: string): JhiAlert {
        return this.addAlert({
            type: 'warning',
            msg,
            params,
            timeout: this.timeout,
            toast: this.isToast(),
            position
        }, []);
    }

    info(msg: string, params?: any, position?: string): JhiAlert {
        return this.addAlert({
            type: 'info',
            msg,
            params,
            timeout: this.timeout,
            toast: this.isToast(),
            position
        }, []);
    }

    private factory(alertOptions: JhiAlert): JhiAlert {
        const alert: JhiAlert = {
            type: alertOptions.type,
            msg: this.sanitizer.sanitize(SecurityContext.HTML, alertOptions.msg),
            id: alertOptions.id,
            timeout: alertOptions.timeout,
            toast: alertOptions.toast,
            position: alertOptions.position ? alertOptions.position : 'top right',
            scoped: alertOptions.scoped,
            close: (alerts: JhiAlert[]) => {
                return this.closeAlert(alertOptions.id, alerts);
            }
        };
        if (!alert.scoped) {
            this.alerts.push(alert);
        }
        return alert;
    }

    addAlert(alertOptions: JhiAlert, extAlerts: JhiAlert[]): JhiAlert {
        alertOptions.id = this.alertId++;
        if (this.i18nEnabled && alertOptions.msg) {
            alertOptions.msg = this.translateService.instant(alertOptions.msg, alertOptions.params);
        }
        const alert = this.factory(alertOptions);
        if (alertOptions.timeout && alertOptions.timeout > 0) {
            setTimeout(() => {
                this.closeAlert(alertOptions.id, extAlerts);
            }, alertOptions.timeout);
        }
        return alert;
    }

    closeAlert(id: number, extAlerts?: JhiAlert[]): any {
        const thisAlerts: JhiAlert[] = (extAlerts && extAlerts.length > 0) ? extAlerts : this.alerts;
        return this.closeAlertByIndex(thisAlerts.map((e) => e.id).indexOf(id), thisAlerts);
    }

    closeAlertByIndex(index: number, thisAlerts: JhiAlert[]): JhiAlert[] {
        return thisAlerts.splice(index, 1);
    }

    isToast(): boolean {
        return this.toast;
    }
}
