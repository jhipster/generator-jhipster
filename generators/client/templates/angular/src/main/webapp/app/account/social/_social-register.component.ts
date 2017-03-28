import { Component, OnInit } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';
import { ActivatedRoute } from '@angular/router';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

import { LoginModalService } from '../../shared';

@Component({
    selector: '<%=jhiPrefix%>-register',
    templateUrl: './social-register.component.html'
})
export class SocialRegisterComponent implements OnInit  {
    success: boolean;
    error: boolean;
    provider: string;
    providerLabel: string;
    modalRef: NgbModalRef;

    constructor (
        private route: ActivatedRoute,
        private jhiLanguageService: JhiLanguageService,
        private loginModalService: LoginModalService
    ) {
        this.jhiLanguageService.setLocations(['social']);
    }

    ngOnInit() {
        this.route.queryParams.subscribe(queryParams => {
            this.success = queryParams['success'];
        });
        this.route.params.subscribe(params => {
            this.provider = params['provider?{success:boolean}'];
        });
        this.error = !this.success;
        this.providerLabel = this.provider.charAt(0).toUpperCase() + this.provider.slice(1);
    }

    login() {
        this.modalRef = this.loginModalService.open();
    }
}
