import { Component } from "@angular/core";
import { GatewayRoutesService } from "./gateway-routes.service";

@Component({
  selector: '<%=jhiPrefix%>-gateway',
  templateUrl: './gateway.html',
  providers: [ GatewayRoutesService ]
})
export class GatewayController{

    constructor(private gatewayRoutesService: GatewayRoutesService){ }

    gatewayRoutes: any = null;
    updatingRoutes: any = null;

    refresh () {
        this.updatingRoutes = true;
        this.gatewayRoutesService.query( (result) => {
            this.gatewayRoutes = result;
            this.updatingRoutes = false;
        });
    }

}