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
        <%_ if (enableTranslation){ _%>
        private languageService: <%=jhiPrefixCapitalized%>LanguageService,
        <%_ } _%>
        private csrfService: CSRFService,
        private socialService: SocialService
    ) {}

    ngOnInit() {
        <%_ if (enableTranslation){ _%>
        this.languageService.addLocation('social');
        <%_ } _%>
        this.label = this.provider.charAt(0).toUpperCase() + this.provider.slice(1);
        this.providerSetting = this.socialService.getProviderSetting(this.provider);
        this.providerURL = this.socialService.getProviderURL(this.provider);
        this.csrf = this.csrfService.getCSRF();
    }

}
