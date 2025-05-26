export type CypressProperties = {
  cypressTests: boolean;
  cypressAudit: boolean;
  cypressCoverage: boolean;
  cypressDir: string;
  cypressTemporaryDir: string;
  cypressBootstrapEntities: boolean;
};

export type CypressApplication = CypressProperties;
