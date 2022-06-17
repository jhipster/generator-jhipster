import { Component, OnInit } from '@angular/core';

import { GatewayRoutesService } from './gateway-routes.service';
import { GatewayRoute } from './gateway-route.model';

@Component({
  selector: 'jhi-gateway',
  templateUrl: './gateway.component.html',
  providers: [GatewayRoutesService],
})
export class GatewayComponent implements OnInit {
  gatewayRoutes: GatewayRoute[] = [];
  updatingRoutes = false;

  constructor(private gatewayRoutesService: GatewayRoutesService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.updatingRoutes = true;
    this.gatewayRoutesService.findAll().subscribe(gatewayRoutes => {
      this.gatewayRoutes = gatewayRoutes;
      this.updatingRoutes = false;
    });
  }
}
