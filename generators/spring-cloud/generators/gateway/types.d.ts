export type GatewayApplication = {
  gatewayRoutes?: Array<{ route: string; host: string; serverPort: string }>;
  routes?: string[];
};
