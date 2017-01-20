import { Component, OnInit } from '@angular/core';
import { JhiLanguageService } from 'ng-jhipster';

import { GatewayRoutesService } from './gateway-routes.service';
import { GatewayRoute } from './gateway-route.model';

@Component({
    selector: '<%=jhiPrefix%>-gateway',
    templateUrl: './gateway.component.html',
    providers: [ GatewayRoutesService ]
})
export class <%=jhiPrefixCapitalized%>GatewayComponent implements OnInit {

    gatewayRoutes: GatewayRoute[];
    updatingRoutes: Boolean;

    constructor(
        private jhiLanguageService: JhiLanguageService,
        private gatewayRoutesService: GatewayRoutesService
    ) {
        this.jhiLanguageService.setLocations(['gateway']);
    }

    ngOnInit () {
        this.refresh();
    }

    refresh () {
        this.updatingRoutes = true;
        this.gatewayRoutesService.findAll().subscribe(gatewayRoutes => {
            this.gatewayRoutes = gatewayRoutes;
            this.updatingRoutes = false;
        });
    }

}
