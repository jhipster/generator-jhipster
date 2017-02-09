import { Component, OnInit, Input, Inject } from '@angular/core';
<%_ if (enableTranslation) { _%>
import { JhiLanguageService } from 'ng-jhipster';
<%_ } _%>
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: '<%=jhiPrefix%>-register',
    templateUrl: './social-register.component.html'
})
export class SocialRegisterComponent implements OnInit  {
    success: boolean;
    error: boolean;
    provider: string;
    providerLabel: string;

    constructor (
        private route: ActivatedRoute,
<%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
<%_ } _%>
    ) {
<%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(['social']);
<%_ } _%>
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
}
