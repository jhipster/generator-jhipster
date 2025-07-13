import type { Application as JavascriptApplication, Entity as JavascriptEntity } from '../javascript/types.js';
export type { Field, Relationship } from '../javascript/types.js';

export type CypressProperties = {
  cypressTests: boolean;
  cypressAudit: boolean;
  cypressCoverage: boolean;
  cypressDir: string;
  cypressTemporaryDir: string;
  cypressBootstrapEntities: boolean;
};

export type Entity = JavascriptEntity;

export type Application<E extends Entity = Entity> = JavascriptApplication<E> & CypressProperties;
