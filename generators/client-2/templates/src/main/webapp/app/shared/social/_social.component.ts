import { Inject, Component, Input, OnInit } from '@angular/core';
import { SocialService } from './social.service';
import { CSRFService } from '../';
import { JhiLanguageService } from "../";

@Component({
    selector: 'jh-social',
    templateUrl: 'app/account/social/social.html'
})
export class <%=jhiPrefixCapitalized%>SocialComponent implements OnInit {
    @Input() provider: string;
    label: string;
    providerSetting: string;
    providerURL: string;
    csrf: string;

        constructor (
                        <% if (enableTranslation){ %>
                        private languageService: JhiLanguageService,
                        <% } %>
                        private CSRFService: CSRFService,
                        private SocialService: SocialService
        ) {}

        ngOnInit() {
            <% if (enableTranslation){ %> this.languageService.addLocation('social'); <% } %>
            this.label = this.provider.charAt(0).toUpperCase() + this.provider.slice(1);
            this.providerSetting = this.SocialService.getProviderSetting(this.provider);
            this.providerURL = this.SocialService.getProviderURL(this.provider);
            this.csrf = this.CSRFService.getCSRF();
        }

}
