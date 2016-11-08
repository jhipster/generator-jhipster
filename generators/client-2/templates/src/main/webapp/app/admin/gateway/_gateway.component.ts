import { Component, OnInit } from '@angular/core';

import { GatewayRoutesService } from './gateway-routes.service';
import { GatewayRoute } from './gateway-route.model';

@Component({
    selector: '<%=jhiPrefix%>-gateway',
    templateUrl: './gateway.html',
    providers: [ GatewayRoutesService ]
})
export class <%=jhiPrefixCapitalized%>GatewayComponent implements OnInit {

    gatewayRoutes: GatewayRoute[];
    updatingRoutes: Boolean;

    constructor(private gatewayRoutesService: GatewayRoutesService){ }

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
