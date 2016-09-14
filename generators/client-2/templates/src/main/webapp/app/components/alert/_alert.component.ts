import { Component, Inject, OnDestroy, OnInit } from '@angular/core';

@Component({
    selector: 'jhi-alert',
    template: '<div class="alerts">' +
                    '<div *ngFor="let alert of alerts" [ngClass]="[alert.position, {\'toast\': alert.toast}]">' +
                        '<ngb-alert [type]="alert.type" (close)="alert.close(alerts)"><pre [innerHTML]="alert.msg"></pre></ngb-alert>' +
                    '</div>' +
                '</div>'
})
export class jhiAlertComponent implements OnInit, OnDestroy {
    alertService: any;
    alerts: any[];

    constructor(@Inject('AlertService') alertService) {
        this.alertService = alertService;
    }

    ngOnInit() {
        this.alerts = this.alertService.get();
    }

    ngOnDestroy() {
        this.alerts = [];
    }

}
