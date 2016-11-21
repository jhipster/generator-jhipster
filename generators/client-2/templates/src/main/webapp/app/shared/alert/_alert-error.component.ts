import { Component, Inject, OnDestroy } from '@angular/core';
<%_ if (enableTranslation){ _%>
import { TranslateService } from 'ng2-translate/ng2-translate';
<%_ } _%>

import { AlertService } from './alert.service';

@Component({
    selector: 'jhi-alert-error',
    template: `
        <div class="alerts" ng-cloak="">
            <div *ngFor="let alert of alerts"  [ngClass]="{\'alert.position\': true, \'toast\': alert.toast}">
                <ngb-alert type="{{alert.type}}" close="alert.close(alerts)"><pre>{{ alert.msg }}</pre></ngb-alert>
            </div>
        </div>`
})
export class JhiAlertErrorComponent implements OnDestroy {

    alerts: any[];
    cleanHttpErrorListener: Function;

    constructor(private alertService: AlertService, @Inject('$rootScope') private $rootScope<% if (enableTranslation){ %>, private translateService: TranslateService<% } %>) {
        this.alerts = [];

        this.cleanHttpErrorListener = $rootScope.$on('<%=angularAppName%>.httpError', (event, httpResponse) => {
            var i;
            event.stopPropagation();
            switch (httpResponse.status) {
                // connection refused, server not reachable
                case 0:
                    this.addErrorAlert('Server not reachable','error.server.not.reachable');
                    break;

                case 400:
                    var headers = Object.keys(httpResponse.headers()).filter(function (header) {
                        return header.endsWith('app-error') || header.endsWith('app-params')
                    }).sort();
                    var errorHeader = httpResponse.headers(headers[0]);
                    var entityKey = httpResponse.headers(headers[1]);
                    if (errorHeader) {
                        var entityName = <% if (enableTranslation) { %>translateService.instant('global.menu.entities.' + entityKey)<% }else{ %>entityKey<% } %>;
                        this.addErrorAlert(errorHeader, errorHeader, {entityName: entityName});
                    } else if (httpResponse.data && httpResponse.data.fieldErrors) {
                        for (i = 0; i < httpResponse.data.fieldErrors.length; i++) {
                            var fieldError = httpResponse.data.fieldErrors[i];
                            // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
                            var convertedField = fieldError.field.replace(/\[\d*\]/g, '[]');
                            var fieldName = <% if (enableTranslation) { %>translateService.instant('<%=angularAppName%>.' + fieldError.objectName + '.' + convertedField)<% }else{ %>convertedField.charAt(0).toUpperCase() + convertedField.slice(1)<% } %>;
                            this.addErrorAlert('Field ' + fieldName + ' cannot be empty', 'error.' + fieldError.message, {fieldName: fieldName});
                        }
                    } else if (httpResponse.data && httpResponse.data.message) {
                        this.addErrorAlert(httpResponse.data.message, httpResponse.data.message, httpResponse.data);
                    } else {
                        this.addErrorAlert(httpResponse.data);
                    }
                    break;

                case 404:
                    this.addErrorAlert('Not found','error.url.not.found');
                    break;

                default:
                    if (httpResponse.data && httpResponse.data.message) {
                        this.addErrorAlert(httpResponse.data.message);
                    } else {
                        this.addErrorAlert(JSON.parse(httpResponse));
                    }
            }
        });
    }

    ngOnDestroy() {
        if(this.cleanHttpErrorListener != undefined && this.cleanHttpErrorListener !== null){
            this.cleanHttpErrorListener();
            this.alerts = [];
        }
    }

    addErrorAlert (message, key?, data?) {
        <%_ if (enableTranslation) { _%>
        key = key && key !== null ? key : message;
        this.alerts.push(
            this.alertService.addAlert(
                {
                    type: 'danger',
                    msg: key,
                    params: data,
                    timeout: 5000,
                    toast: this.alertService.isToast(),
                    scoped: true
                },
                this.alerts
            )
        );
        <%_ } else { _%>
        this.alerts.push(
            this.alertService.addAlert(
                {
                    type: 'danger',
                    msg: message,
                    timeout: 5000,
                    toast: this.alertService.isToast(),
                    scoped: true
                },
                this.alerts
            )
        );
        <%_ } _%>
    }
}
