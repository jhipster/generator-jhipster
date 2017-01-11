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
        <%_ if (enableTranslation) { _%>
        private jhiLanguageService: JhiLanguageService,
        <%_ } _%>
        private gatewayRoutesService: GatewayRoutesService) {
        <%_ if (enableTranslation) { _%>
        this.jhiLanguageService.setLocations(['gateway']);
        <%_ } _%>
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
