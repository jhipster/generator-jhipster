import { ClientApplication } from '../client/types.mjs';

export type CypressProperties = {
  cypressAudit: boolean;
  cypressCoverage: boolean;
  cypressDir: string;
  cypressTemporaryDir: string;
  cypressBootstrapEntities: boolean;
};

export type CypressApplication = ClientApplication & CypressProperties;
