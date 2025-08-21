import type { Application as JavascriptApplication, Entity as JavascriptEntity, Field as JavascriptField } from '../javascript/entity.ts';
import type { Field as LanguagesField } from '../languages/entity.ts';
export type { Relationship } from '../javascript/entity.ts';

export type Field = LanguagesField & JavascriptField;

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
