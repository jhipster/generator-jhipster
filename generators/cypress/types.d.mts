import { BaseGeneratorApplicationType } from '../base-application/tasks.mjs';
import { ClientApplication, ClientConfig, ClientEntity, ClientField, ClientRelationship } from '../client/types.mjs';

export type CypressEntity = ClientEntity;

export type CypressProperties = {
  cypressAudit: boolean;
  cypressCoverage: boolean;
  cypressDir: string;
  cypressTemporaryDir: string;
  cypressBootstrapEntities: boolean;
};

export type CypressApplication = ClientApplication & CypressProperties;

export type CypressApplicationConfig = ClientConfig & Partial<CypressProperties>;

export type GeneratorCypressApplication = BaseGeneratorApplicationType<
  CypressApplication,
  CypressApplicationConfig,
  ClientEntity,
  ClientField,
  ClientRelationship
>;
