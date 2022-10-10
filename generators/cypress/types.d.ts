import { ClientApplication } from '../bootstrap-application-client/types';

export type CypressApplication = ClientApplication & {
  cypressAudit: boolean;
  cypressCoverage: boolean;
  cypressDir: string;
  cypressTemporaryDir: string;
  cypressBootstrapEntities: boolean;
};
