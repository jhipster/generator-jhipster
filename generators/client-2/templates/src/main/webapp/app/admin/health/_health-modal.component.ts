import { Component } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { <%=jhiPrefixCapitalized%>HealthService } from './health.service';

@Component({
    selector: '<%=jhiPrefix%>-health-modal',
    templateUrl: 'app/admin/health/health-modal.html',
    inputs: ['currentHealth', 'dismiss']
})
export class <%=jhiPrefixCapitalized%>HealthModalComponent {

    currentHealth: any;

    constructor(private healthService:JhiHealthService, public activeModal: NgbActiveModal) {}

    baseName(name) {
        return this.healthService.getBaseName(name);
    }

    subSystemName(name) {
        return this.healthService.getSubSystemName(name);
    }

}
