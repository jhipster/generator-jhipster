export type GatewayApplication = {
  gatewayServicesApiAvailable?: boolean;
  gatewayRoutes?: { route: string; host: string; serverPort: string }[];
  routes?: string[];
};
