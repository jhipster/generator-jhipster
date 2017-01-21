import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { JhiLanguageService } from 'ng-jhipster';

import { <%=jhiPrefixCapitalized%>HealthService } from './health.service';
import { <%=jhiPrefixCapitalized%>HealthModalComponent } from './health-modal.component';

@Component({
    selector: '<%=jhiPrefix%>-health',
    templateUrl: './health.component.html',
})
export class <%=jhiPrefixCapitalized%>HealthCheckComponent implements OnInit {
    healthData: any;
    updatingHealth: boolean;

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private modalService: NgbModal,
        private healthService: <%=jhiPrefixCapitalized%>HealthService
    ) {
        this.jhiLanguageService.setLocations(['health']);

    }

    ngOnInit() {
        this.refresh();
    }

    baseName(name: string) {
        return this.healthService.getBaseName(name);
    }

    getTagClass(statusState) {
        if (statusState === 'UP') {
            return 'tag-success';
        } else {
            return 'tag-danger';
        }
    }

    refresh() {
        this.updatingHealth = true;

        this.healthService.checkHealth().subscribe(health => {
            this.healthData = this.healthService.transformHealthData(health);
            this.updatingHealth = false;
        });
    }

    showHealth(health: any) {
        const modalRef  = this.modalService.open(<%=jhiPrefixCapitalized%>HealthModalComponent);
        modalRef.componentInstance.currentHealth = health;
        modalRef.result.then((result) => {
            console.log(`Closed with: ${result}`);
        }, (reason) => {
            console.log(`Dismissed ${reason}`);
        });
    }

    subSystemName(name: string) {
        return this.healthService.getSubSystemName(name);
    }

}
