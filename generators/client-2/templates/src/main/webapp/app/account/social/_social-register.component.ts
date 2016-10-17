import { Component, OnInit, Input, Inject } from '@angular/core';

@Component({
    selector: '<%=jhiPrefix%>-register',
    templateUrl: 'app/account/social/social-register.html'
})
export class SocialRegisterComponent implements OnInit  {
    success: boolean;
    error: boolean;
    @Input() provider: string;
    providerLabel: string;

    constructor (@Inject('$stateParams') private $stateParams)
    {}

    ngOnInit() {
        this.success = this.$stateParams.success;
        this.error = !this.success;
        this.provider = this.$stateParams.provider;
        this.providerLabel = this.provider.charAt(0).toUpperCase() + this.provider.slice(1);
    }
}
