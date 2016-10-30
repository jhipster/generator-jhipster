import { Inject, Component, Input, OnInit } from '@angular/core';
import { SocialService } from './social.service';
import { CSRFService } from '../auth/csrf.service';
<%_ if (enableTranslation){ _%>
import { <%=jhiPrefixCapitalized%>LanguageService } from '../language/language.service';
<%_ } _%>

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
        private languageService: <%=jhiPrefixCapitalized%>LanguageService,
        <% } %>
        private CSRFService: CSRFService,
        private SocialService: SocialService
    ) {}

    ngOnInit() {
        <%_ if (enableTranslation){ _%>
        this.languageService.addLocation('social');
        <%_ } _%>
        this.label = this.provider.charAt(0).toUpperCase() + this.provider.slice(1);
        this.providerSetting = this.SocialService.getProviderSetting(this.provider);
        this.providerURL = this.SocialService.getProviderURL(this.provider);
        this.csrf = this.CSRFService.getCSRF();
    }

}
