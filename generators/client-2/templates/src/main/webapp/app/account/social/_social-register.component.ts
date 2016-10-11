import { Component, OnInit, Inject } from '@angular/core';

@Component({
    selector: '<%=jhiPrefix%>-register',
    templateUrl: 'app/account/social/social-register.html'
})
export class SocialRegisterComponent implements OnInit  {
    success: boolean;
    error: boolean;
    provider: string;
    providerLabel: string;

    constructor (@Inject('$stateParams') private $stateParams)
    {}

    ngOnInit() {
        //let success = this.$stateParams.success;
        this.success = this.$stateParams.success;
        this.error = !this.success;
        this.provider = this.$stateParams.provider;
        //this.providerLabel = $filter('capitalize')(this.provider);
        this.providerLabel = this.provider.charAt(0).toUpperCase() + this.provider.slice(1);
        //this.success = this.$stateParams.success;
    }
}
