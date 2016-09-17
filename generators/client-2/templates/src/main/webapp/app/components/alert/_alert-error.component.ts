import { Component, Inject, OnDestroy } from '@angular/core';
import { AlertService } from "./alert.service";

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

    $rootScope: any;
    alerts: any[];
    cleanHttpErrorListener: Function;

    constructor(private alertService: AlertService, @Inject('$rootScope') $rootScope, @Inject('$translate') $translate) {
        this.alerts = [];

        this.cleanHttpErrorListener = $rootScope.$on('ng2TApp.httpError', function (event, httpResponse) {
            var i;
            event.stopPropagation();
            switch (httpResponse.status) {
                // connection refused, server not reachable
                case 0:
                    this.addErrorAlert('Server not reachable','error.server.not.reachable');
                    break;

                case 400:
                    var errorHeader = httpResponse.headers('X-ng2TApp-error');
                    var entityKey = httpResponse.headers('X-ng2TApp-params');
                    if (errorHeader) {
                        var entityName = $translate.instant('global.menu.entities.' + entityKey);
                        this.addErrorAlert(errorHeader, errorHeader, {entityName: entityName});
                    } else if (httpResponse.data && httpResponse.data.fieldErrors) {
                        for (i = 0; i < httpResponse.data.fieldErrors.length; i++) {
                            var fieldError = httpResponse.data.fieldErrors[i];
                            // convert 'something[14].other[4].id' to 'something[].other[].id' so translations can be written to it
                            var convertedField = fieldError.field.replace(/\[\d*\]/g, '[]');
                            var fieldName = $translate.instant('ng2TApp.' + fieldError.objectName + '.' + convertedField);
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
                        this.addErrorAlert(angular.toJson(httpResponse));
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
    }
}
