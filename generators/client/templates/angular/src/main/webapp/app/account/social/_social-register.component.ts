import { Component, OnInit, Input, Inject } from '@angular/core';

@Component({
    selector: '<%=jhiPrefix%>-register',
    templateUrl: './social-register.component.html'
})
export class SocialRegisterComponent implements OnInit  {
    success: boolean;
    error: boolean;
    @Input() provider: string;
    providerLabel: string;

    constructor (
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        @Inject('$stateParams') private $stateParams) {
        <%_ if (enableTranslation) { _%>
        this.languageService.setLocations(['social']);
        <%_ } _%>
    }

    ngOnInit() {
        this.success = this.$stateParams.success;
        this.error = !this.success;
        this.provider = this.$stateParams.provider;
        this.providerLabel = this.provider.charAt(0).toUpperCase() + this.provider.slice(1);
    }
}
