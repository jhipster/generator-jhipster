import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { <%=jhiPrefixCapitalized%>HealthService } from './health.service';

@Component({
    selector: '<%=jhiPrefix%>-health-modal',
    templateUrl: './health-modal.html'
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
