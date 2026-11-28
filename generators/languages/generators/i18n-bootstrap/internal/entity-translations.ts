/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** The names of an entity in a translation. */
type EntityNames = {
  /** The humanized name of the entity. */
  entity: string;
  /** The humanized plural name of the entity. */
  entities: string;
  /** The variant of the translation, like 'female' for a language whose words agree with the gender of the name. */
  variant?: string;
};

/** The texts of the translation of an entity, the ones that are not the names of its fields. */
export type EntityTranslations = {
  /** The title of the list, the plural name by default. */
  title?: string;
  refreshListLabel: string;
  createLabel: string;
  createOrEditLabel: string;
  search: string;
  notFound: string;
  created: string;
  updated: string;
  deleted: string;
  deleteQuestion: string;
};

/**
 * The texts of a language, as its entity/i18n/<language>.json file has them: {entity} and {entities} stand for the names
 * of the entity, and a variant replaces some of the texts.
 */
export type EntityTranslationTexts = EntityTranslations & {
  variants?: Record<string, Partial<EntityTranslations>>;
};

/**
 * The texts of the translation of an entity, with its names.
 */
export const getEntityTranslations = (
  { variants, ...texts }: EntityTranslationTexts,
  { entity, entities, variant }: EntityNames,
): EntityTranslations =>
  Object.fromEntries(
    Object.entries({ ...texts, ...(variant ? variants?.[variant] : undefined) }).map(([key, text]) => [
      key,
      text.replaceAll('{entities}', entities).replaceAll('{entity}', entity),
    ]),
  ) as EntityTranslations;

/** The entity whose translation file is built. */
type TranslatedEntity = {
  frontendAppName: string;
  microserviceAppName?: string;
  entityTranslationKey: string;
  entityNameHumanized: string;
  entityNamePluralHumanized: string;
  entityI18nVariant?: string;
  readOnly?: boolean;
  searchEngineAny?: boolean;
  fields: { fieldName: string; fieldNameHumanized: string; documentation?: string }[];
  relationships: { relationshipName: string; relationshipNameHumanized: string }[];
};

/**
 * The content of the translation file of an entity in a language, from the texts of the language.
 */
export const buildEntityTranslation = (entity: TranslatedEntity, texts: EntityTranslationTexts): Record<string, any> => {
  const { frontendAppName, microserviceAppName, entityTranslationKey, readOnly, searchEngineAny, fields, relationships } = entity;
  const translations = getEntityTranslations(texts, {
    entity: entity.entityNameHumanized,
    entities: entity.entityNamePluralHumanized,
    variant: entity.entityI18nVariant,
  });
  const { created, updated, deleted } = translations;
  const fieldsWithDocumentation = fields.filter(field => field.documentation);
  return {
    [frontendAppName]: {
      [entityTranslationKey]: {
        home: {
          title: translations.title ?? entity.entityNamePluralHumanized,
          refreshListLabel: translations.refreshListLabel,
          ...(readOnly ? {} : { createLabel: translations.createLabel, createOrEditLabel: translations.createOrEditLabel }),
          ...(searchEngineAny ? { search: translations.search } : {}),
          notFound: translations.notFound,
        },
        ...(microserviceAppName || readOnly ? {} : { created, updated, deleted }),
        ...(readOnly ? {} : { delete: { question: translations.deleteQuestion } }),
        detail: { title: entity.entityNameHumanized },
        ...Object.fromEntries(fields.map(field => [field.fieldName, field.fieldNameHumanized])),
        ...Object.fromEntries(relationships.map(relationship => [relationship.relationshipName, relationship.relationshipNameHumanized])),
        ...(fieldsWithDocumentation.length > 0 ?
          { help: Object.fromEntries(fieldsWithDocumentation.map(field => [field.fieldName, field.documentation])) }
        : {}),
      },
    },
    ...(microserviceAppName && !readOnly ? { [microserviceAppName]: { [entityTranslationKey]: { created, updated, deleted } } } : {}),
  };
};
