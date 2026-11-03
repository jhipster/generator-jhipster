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
import { existsSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';

import type BaseApplicationGenerator from '../../../index.ts';
import { CONTEXT_DATA_APPLICATION_ENTITIES_KEY } from '../../../support/constants.ts';
import { getEntitiesFromDir } from '../../../support/index.ts';
import type { ChangelogOperation, EntityChangelogObject } from '../types.ts';

/** The name of the custom object of the changelogs, the one a generator using them declares in its \`customObjects\` feature. */
export const CHANGELOGS_CUSTOM_OBJECT = 'changelogs';

/**
 * The custom object of the changelogs, the one a generator using them declares in its \`customObjects\` feature: loaded
 * before the default priority, once the entities are prepared, the changelogs keeping their final properties.
 */
export const changelogsCustomObject = { name: CHANGELOGS_CUSTOM_OBJECT, before: 'default' };

/** The changelogs of the application, shared by the generators using them. */
const CONTEXT_DATA_CHANGELOGS_KEY = 'jhipster:base-application:database-changelogs';
/** The names of the changelogs of the changes this generation brings, shared like the changelogs. */
const CONTEXT_DATA_NEW_CHANGELOGS_KEY = 'jhipster:base-application:database-new-changelogs';
/** The previous states of the entities the changelogs of this generation change, shared like the changelogs. */
const CONTEXT_DATA_PREVIOUS_ENTITIES_KEY = 'jhipster:base-application:database-previous-entities';
/** Whether the application had changelogs before this generation, shared like the changelogs. */
const CONTEXT_DATA_FORMER_CHANGELOGS_KEY = 'jhipster:base-application:database-former-changelogs';

type Generator = BaseApplicationGenerator<any, any, any, any, any, any, any>;

type EntityConfig = Record<string, any> & { fields?: Record<string, any>[]; relationships?: Record<string, any>[] };

/** The names added to, removed from and changed between two lists of items, by the key naming an item. */
const diffItems = (before: Record<string, any>[] = [], after: Record<string, any>[] = [], key: string) => {
  const beforeByName = new Map(before.map(item => [item[key] as string, item]));
  const afterByName = new Map(after.map(item => [item[key] as string, item]));
  return {
    added: [...afterByName.keys()].filter(name => !beforeByName.has(name)),
    removed: [...beforeByName.keys()].filter(name => !afterByName.has(name)),
    changed: [...afterByName.keys()].filter(
      name => beforeByName.has(name) && !isDeepStrictEqual(beforeByName.get(name), afterByName.get(name)),
    ),
  };
};

/**
 * The properties of a relationship whose change recreates it, its foreign key or its join table: the id one is part of the
 * primary key of its entity.
 */
const RECREATING_RELATIONSHIP_PROPERTIES = ['relationshipType', 'otherEntityName', 'ownerSide', 'columnName', 'joinTable', 'id'];

/** A property of a relationship, declared by itself or in its options, where the entities declare some of them. */
const relationshipProperty = (relationship: Record<string, any>, property: string) =>
  relationship[property] ?? relationship.options?.[property];

/**
 * The changed relationships split into the ones to recreate, changed in their type, their other entity or their side, and
 * the ones changed only in their other properties, like onDelete and onUpdate.
 */
const splitChangedRelationships = (before: Record<string, any>[] = [], after: Record<string, any>[] = [], changed: string[]) => {
  const beforeByName = new Map(before.map(relationship => [relationship.relationshipName as string, relationship]));
  const afterByName = new Map(after.map(relationship => [relationship.relationshipName as string, relationship]));
  const recreated = changed.filter(name =>
    RECREATING_RELATIONSHIP_PROPERTIES.some(
      property => relationshipProperty(beforeByName.get(name)!, property) !== relationshipProperty(afterByName.get(name)!, property),
    ),
  );
  return { recreated, optionsChanged: changed.filter(name => !recreated.includes(name)) };
};

/** The properties of an entity, its fields and its relationships aside, that record a changelog: its table. */
const ENTITY_CHANGELOG_PROPERTIES = ['entityTableName', 'embedded', 'skipServer', 'microserviceName'];
/**
 * The properties of a field that record a changelog, as the database bootstrap prepares them: its column, its type, its
 * constraints and its default value.
 */
const FIELD_CHANGELOG_PROPERTIES = [
  'fieldName',
  'columnName',
  'fieldType',
  'fieldValues',
  'fieldTypeBlobContent',
  'id',
  'columnRequired',
  'unique',
  'uniqueConstraintName',
  'defaultValue',
  'defaultValueComputed',
];
/**
 * The properties of a relationship that record a changelog, as the database bootstrap prepares them: its foreign key or
 * join table and their constraints.
 */
const RELATIONSHIP_CHANGELOG_PROPERTIES = [
  'relationshipName',
  'relationshipType',
  'otherEntityName',
  'otherEntityRelationshipName',
  'ownerSide',
  'columnName',
  'id',
  'columnRequired',
  'onDelete',
  'onUpdate',
];

/** The properties of an item that record a changelog, the ones given, undefined ones aside. */
const pickProperties = (item: Record<string, any>, properties: string[], get = (property: string) => item[property]) =>
  Object.fromEntries(properties.map(property => [property, get(property)]).filter(([, value]) => value !== undefined));

/** A join table as a changelog records it: its name and its columns, which the database bootstrap gives as getters. */
const joinTableProjection = (joinTable?: Record<string, any>) =>
  joinTable ?
    {
      joinTable: {
        name: joinTable.name,
        joinColumns: joinTable.joinColumns.map(({ name, referencedColumnName }: Record<string, string>) => ({
          name,
          referencedColumnName,
        })),
        inverseJoinColumns: joinTable.inverseJoinColumns.map(({ name, referencedColumnName }: Record<string, string>) => ({
          name,
          referencedColumnName,
        })),
      },
    }
  : {};

/**
 * An entity as a changelog records it: the final properties of the entity the database bootstrap prepares that record a
 * changelog only, the database schema of the entity, its transient fields aside, which have no column.
 */
const changelogProjection = (entity: EntityConfig): EntityConfig => ({
  ...pickProperties(entity, ENTITY_CHANGELOG_PROPERTIES),
  fields: (entity.fields ?? [])
    .filter(field => !field.transient)
    .map(field => ({
      ...pickProperties(field, FIELD_CHANGELOG_PROPERTIES),
      ...(field.fieldValidateRules?.includes('maxlength') ? { maxlength: field.fieldValidateRulesMaxlength } : {}),
    })),
  relationships: (entity.relationships ?? []).map(relationship => ({
    ...pickProperties(relationship, RELATIONSHIP_CHANGELOG_PROPERTIES, property => relationshipProperty(relationship, property)),
    ...joinTableProjection(relationship.joinTable),
  })),
});

/** The properties of an entity that record a changelog, its fields and its relationships aside, that differ between two of its states. */
const changedEntityProperties = (before: EntityConfig, after: EntityConfig): string[] =>
  ENTITY_CHANGELOG_PROPERTIES.filter(property => !isDeepStrictEqual(before[property], after[property]));

const findChangelogs = (generator: Generator): EntityChangelogObject[] =>
  (generator.findObjects('changelog') as unknown as EntityChangelogObject[]).toSorted((a, b) =>
    a.changelogDate.localeCompare(b.changelogDate),
  );

const changelogName = ({ changelogDate, entityName }: Pick<EntityChangelogObject, 'changelogDate' | 'entityName'>): string =>
  `${changelogDate}_${entityName}`;

const newChangelogNames = (generator: Generator): Set<string> =>
  generator.getContextData<Set<string>>(CONTEXT_DATA_NEW_CHANGELOGS_KEY, { factory: () => new Set() });

/**
 * Records a changelog, an object named after its date and its entity: a change of this generation, but a changelog of a
 * project without changelogs, which the project already has (existing).
 */
const record = (
  generator: Generator,
  changelog: Omit<EntityChangelogObject, 'type'> & { operation: ChangelogOperation },
  { existing = false }: { existing?: boolean } = {},
): void => {
  generator.setObjectConfig(changelogName(changelog), { type: 'changelog', ...changelog });
  if (!existing) {
    newChangelogNames(generator).add(changelogName(changelog));
  }
};

/** The previous states of the entities, by the name of the changelog of this generation changing them. */
const previousEntities = (generator: Generator): Map<string, EntityConfig> =>
  generator.getContextData<Map<string, EntityConfig>>(CONTEXT_DATA_PREVIOUS_ENTITIES_KEY, { factory: () => new Map() });

/**
 * Records a changelog changing an entity after its last one. The changelogs are written once, so only the last
 * changelog of an entity keeps the entity, the state the next changelog compares to: the last one gives its entity to
 * the new one, as its previous state, for this generation only.
 */
const recordAfter = (generator: Generator, last: EntityChangelogObject, changelog: Omit<EntityChangelogObject, 'type'>): void => {
  if (last.entity) {
    const { entity, ...lastWithoutEntity } = last;
    generator.setObjectConfig(changelogName(last), lastWithoutEntity);
    previousEntities(generator).set(changelogName(changelog), entity);
  }
  record(generator, changelog);
};

/** The date of a changelog after the last one of its entity, a changelog after the ones it changes. */
const nextChangelogDate = (generator: Generator, last: EntityChangelogObject): string => {
  let changelogDate = generator.nextTimestamp();
  while (changelogDate <= last.changelogDate) {
    changelogDate = generator.nextTimestamp();
  }
  return changelogDate;
};

/** The date of the changelog creating an entity: the one of its incremental changelog, else its changelog date. */
const changelogDateOf = (generator: Generator, entity: EntityConfig): string =>
  String(
    entity.annotations?.incrementalChangelogDate ?? entity.annotations?.changelogDate ?? entity.changelogDate ?? generator.nextTimestamp(),
  );

/** The names of the entities the \`.jhipster\` files on the disk declare, before this generation writes them. */
const formerEntityNames = (generator: Generator): string[] =>
  getEntitiesFromDir(generator.getEntitiesConfigPath()).filter(name => existsSync(generator.getEntityConfigPath(name)));

/** The entities of the application, prepared, the built-in ones aside. */
const preparedEntities = (generator: Generator): Map<string, EntityConfig> => {
  const entities = generator.getContextData<Map<string, EntityConfig>>(CONTEXT_DATA_APPLICATION_ENTITIES_KEY, { factory: () => new Map() });
  if (entities.size === 0 && generator.getExistingEntities().length > 0) {
    throw new Error(
      `The entity changelogs are read before the entities are prepared: declare the custom object with changelogsCustomObject`,
    );
  }
  return new Map([...entities].filter(([, entity]) => !entity.builtIn));
};

const formerChangelogs = (generator: Generator): boolean =>
  generator.getContextData<boolean>(CONTEXT_DATA_FORMER_CHANGELOGS_KEY, { factory: () => findChangelogs(generator).length > 0 });

const recordChangelogs = (generator: Generator): EntityChangelogObject[] => {
  const entities = new Map(
    [...preparedEntities(generator)].map(([name, prepared]) => [name, { prepared, entity: changelogProjection(prepared) }]),
  );
  if (!formerChangelogs(generator)) {
    // A project without changelogs: the ones creating the entities its files on the disk declare, at their current state.
    for (const name of formerEntityNames(generator)) {
      const current = entities.get(name);
      if (current) {
        record(
          generator,
          { operation: 'create', entityName: name, changelogDate: changelogDateOf(generator, current.prepared), entity: current.entity },
          { existing: true },
        );
      }
    }
  }

  const lastChangelogs = new Map<string, EntityChangelogObject>();
  for (const changelog of findChangelogs(generator)) {
    lastChangelogs.set(changelog.entityName, changelog);
  }

  for (const [name, { prepared, entity }] of entities) {
    const last = lastChangelogs.get(name);
    if (!last || last.operation === 'remove') {
      // An entity created again after its removal gets a date after its former changelogs.
      record(generator, {
        operation: 'create',
        entityName: name,
        changelogDate: last ? nextChangelogDate(generator, last) : changelogDateOf(generator, prepared),
        entity,
      });
    } else if (!isDeepStrictEqual(last.entity, entity)) {
      // Only a change of the database schema records a changelog.
      const before = last.entity!;
      const changedProperties = changedEntityProperties(before, entity);
      const fields = diffItems(before.fields, entity.fields, 'fieldName');
      const relationships = diffItems(before.relationships, entity.relationships, 'relationshipName');
      const changedRelationships = splitChangedRelationships(before.relationships, entity.relationships, relationships.changed);
      recordAfter(generator, last, {
        operation: 'update',
        entityName: name,
        changelogDate: nextChangelogDate(generator, last),
        entity,
        changedProperties,
        addedFields: fields.added,
        removedFields: fields.removed,
        changedFields: fields.changed,
        addedRelationships: relationships.added,
        removedRelationships: relationships.removed,
        recreatedRelationships: changedRelationships.recreated,
        optionsChangedRelationships: changedRelationships.optionsChanged,
      });
    }
  }

  for (const [name, last] of lastChangelogs) {
    if (last.operation !== 'remove' && !entities.has(name)) {
      recordAfter(generator, last, { operation: 'remove', entityName: name, changelogDate: nextChangelogDate(generator, last) });
    }
  }

  return findChangelogs(generator).map(changelog => {
    const previousEntity = previousEntities(generator).get(changelogName(changelog));
    return previousEntity ? { ...changelog, previousEntity } : changelog;
  });
};

/**
 * The changelogs of the entities of an application, sorted by date, as objects of type \`changelog\` (see
 * EntityChangelogObject): the ones of this generation recorded first, by the first generator asking for them, the others
 * getting the same ones. A changelog is recorded for each change of the database schema of an entity, never changed
 * once recorded, so a changelog written from them is the same whatever the files of the project. An entity, at the final
 * properties of the prepared one, is compared to the entity of its last changelog; a project without changelogs gets the
 * ones creating the entities its \`.jhipster\` files on the disk declare, at their current state, first. A generator using
 * them writes incremental changelogs.
 *
 * A generator using them declares the custom object (\`customObjects: [changelogsCustomObject]\`), loaded once the
 * entities are prepared, and gives them from its \`changelogs\` getter: \`get changelogs() { return getEntityChangelogs(this); }\`.
 */
export const getEntityChangelogs = (generator: Generator): EntityChangelogObject[] =>
  generator.getContextData<EntityChangelogObject[]>(CONTEXT_DATA_CHANGELOGS_KEY, { factory: () => recordChangelogs(generator) });

/**
 * Whether the application had changelogs before this generation: without them, the changelogs creating its entities are
 * recorded from its \`.jhipster\` files, entities a migration never created.
 */
export const hasFormerEntityChangelogs = (generator: Generator): boolean => {
  getEntityChangelogs(generator);
  return formerChangelogs(generator);
};

/**
 * Whether a changelog is one of a change this generation brings, recorded by it: the changelogs to write the migrations
 * of. The changelogs a project without changelogs gets for the entities it already has are not.
 */
export const isNewEntityChangelog = (
  generator: Generator,
  changelog: Pick<EntityChangelogObject, 'changelogDate' | 'entityName'>,
): boolean => {
  getEntityChangelogs(generator);
  return newChangelogNames(generator).has(changelogName(changelog));
};
