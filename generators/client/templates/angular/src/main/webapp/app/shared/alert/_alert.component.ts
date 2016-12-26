import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertService } from './alert.service';

@Component({
    selector: '<%=jhiPrefix%>-alert',
    template: `
        <div class="alerts" role="alert">
            <div *ngFor="let alert of alerts" [ngClass]="{\'alert.position\': true, \'toast\': alert.toast}">
                <ngb-alert [type]="alert.type" (close)="alert.close(alerts)"><pre [innerHTML]="alert.msg"></pre></ngb-alert>
            </div>
        </div>`
})
export class <%=jhiPrefixCapitalized%>AlertComponent implements OnInit, OnDestroy {
    alerts: any[];

    constructor(private alertService: AlertService) { }

    ngOnInit() {
        this.alerts = this.alertService.get();
    }

    ngOnDestroy() {
        this.alerts = [];
    }

}
