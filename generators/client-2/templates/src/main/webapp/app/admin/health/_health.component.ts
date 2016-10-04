import { Component, Inject, OnInit, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { <%=jhiPrefixCapitalized%>HealthService } from './health.service';

@Component({
    selector: '<%=jhiPrefix%>-health',
    templateUrl: 'app/admin/health/health.html',
})
export class <%=jhiPrefixCapitalized%>HealthCheckComponent implements OnInit {
    healthData:any;
    currentHealth:any;
    updatingHealth:boolean;

    constructor(private modalService: NgbModal, private healthService:<%=jhiPrefixCapitalized%>HealthService) {}

    ngOnInit() {
        this.refresh();
    }

    baseName(name: string) {
        return this.healthService.getBaseName(name);
    }

    getLabelClass(statusState) {
        if (statusState === 'UP') {
            return 'label-success';
        } else {
            return 'label-danger';
        }
    }

    refresh() {
        this.updatingHealth = true;

        this.healthService.checkHealth().subscribe(health => {
            this.healthData = this.healthService.transformHealthData(health);
            this.updatingHealth = false;
        });
    }

    showHealth(healthModal: TemplateRef<any>, health: any) {
        this.currentHealth = health;
        this.modalService.open(healthModal).result.then((result) => {
            console.log(`Closed with: ${result}`);
        }, (reason) => {
            console.log(`Dismissed ${reason}`);
        });
    }

    subSystemName(name: string) {
        return this.healthService.getSubSystemName(name);
    }

}
