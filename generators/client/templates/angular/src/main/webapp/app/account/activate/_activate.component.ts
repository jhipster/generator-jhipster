import { Component, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';

import { JhiLanguageService } from 'ng-jhipster';

import { Activate } from './activate.service';
import { LoginModalService } from '../../shared';

@Component({
    selector: '<%=jhiPrefix%>-activate',
    templateUrl: './activate.component.html'
})
export class ActivateComponent implements OnInit {
    error: string;
    success: string;
    modalRef: NgbModalRef;

    constructor(
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        private activate: Activate,
        private loginModalService: LoginModalService,
        private route: ActivatedRoute
    ) {
        <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(['activate']);
        <%_ } _%>
    }

    ngOnInit () {
        this.route.queryParams.subscribe(params => {
            this.activate.get(params['key']).subscribe(() => {
                this.error = null;
                this.success = 'OK';
            }, () => {
                this.success = null;
                this.error = 'ERROR';
            });
        });
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }
}
