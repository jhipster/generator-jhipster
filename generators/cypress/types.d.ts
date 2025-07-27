import type { Application as JavascriptApplication, Entity as JavascriptEntity } from '../javascript/types.js';
export type { Field, Relationship } from '../javascript/types.js';

export type CypressProperties = {
  cypressAudit: boolean;
  cypressCoverage: boolean;
  cypressDir: string;
  cypressTemporaryDir: string;
  cypressBootstrapEntities: boolean;
};

export interface Entity extends JavascriptEntity {
  workaroundEntityCannotBeEmpty?: boolean;
  workaroundInstantReactiveMariaDB?: boolean;
}

export type Application<E extends Entity = Entity> = JavascriptApplication<E> & CypressProperties;
