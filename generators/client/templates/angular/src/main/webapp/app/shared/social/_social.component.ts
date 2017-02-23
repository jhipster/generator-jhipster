import { Component, Input, OnInit } from '@angular/core';
import { SocialService } from './social.service';
import { CSRFService } from '../auth/csrf.service';
import { JhiLanguageService } from 'ng-jhipster';

@Component({
    selector: '<%=jhiPrefix%>-social',
    templateUrl: './social.component.html'
})
export class <%=jhiPrefixCapitalized%>SocialComponent implements OnInit {
    @Input() provider: string;
    label: string;
    providerSetting: string;
    providerURL: string;
    csrf: string;

    constructor (
        private languageService: JhiLanguageService,
        private csrfService: CSRFService,
        private socialService: SocialService
    ) {}

    ngOnInit() {
        this.languageService.setLocations(['social', 'register', 'login', 'home']);
        this.label = this.provider.charAt(0).toUpperCase() + this.provider.slice(1);
        this.providerSetting = this.socialService.getProviderSetting(this.provider);
        this.providerURL = this.socialService.getProviderURL(this.provider);
        this.csrf = this.csrfService.getCSRF();
    }
}
