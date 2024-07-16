export type GatewayApplication = {
  gatewayServicesApiAvailable?: boolean;
  gatewayRoutes?: Array<{ route: string; host: string; serverPort: string }>;
  routes?: string[];
};
