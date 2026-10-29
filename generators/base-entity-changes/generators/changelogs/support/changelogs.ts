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
import { existsSync, readFileSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';

import type BaseApplicationGenerator from '../../../../base-application/index.ts';
import { getEntitiesFromDir } from '../../../../base-application/support/index.ts';
import type { ChangelogOperation, EntityChangelogObject } from '../types.ts';

/** The name of the custom object of the changelogs, the one a generator using them declares in its \`customObjects\` feature. */
export const CHANGELOGS_CUSTOM_OBJECT = 'changelogs';

/** The changelogs of the application, shared by the generators using them. */
const CONTEXT_DATA_CHANGELOGS_KEY = 'jhipster:base-entity-changes:changelogs';
/** The names of the changelogs of the changes this generation brings, shared like the changelogs. */
const CONTEXT_DATA_NEW_CHANGELOGS_KEY = 'jhipster:base-entity-changes:new-changelogs';
/** The previous states of the entities the changelogs of this generation change, shared like the changelogs. */
const CONTEXT_DATA_PREVIOUS_ENTITIES_KEY = 'jhipster:base-entity-changes:previous-entities';
/** Whether the application had changelogs before this generation, shared like the changelogs. */
const CONTEXT_DATA_FORMER_CHANGELOGS_KEY = 'jhipster:base-entity-changes:former-changelogs';

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
const RECREATING_RELATIONSHIP_PROPERTIES = ['relationshipType', 'otherEntityName', 'relationshipSide', 'id'];

/** A property of a relationship, declared by itself or in its options, where the `.jhipster` files declare most of them. */
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
/** The properties of a field that record a changelog: its column, its type, its constraints and its default value. */
const FIELD_CHANGELOG_PROPERTIES = [
  'fieldName',
  'fieldType',
  'fieldValues',
  'fieldTypeBlobContent',
  'id',
  'fieldValidateRulesMaxlength',
  'defaultValue',
  'defaultValueComputed',
];
/** The validations of a field that record a changelog, the ones its column declares. */
const FIELD_CHANGELOG_VALIDATIONS = ['required', 'unique', 'maxlength'];
/** The properties of a relationship that record a changelog: its foreign key or join table and their constraints. */
const RELATIONSHIP_CHANGELOG_PROPERTIES = [
  'relationshipName',
  'relationshipType',
  'otherEntityName',
  'otherEntityRelationshipName',
  'relationshipSide',
  'id',
  'onDelete',
  'onUpdate',
];

/** The properties of an item that record a changelog, the ones given, undefined ones aside. */
const pickProperties = (item: Record<string, any>, properties: string[], get = (property: string) => item[property]) =>
  Object.fromEntries(properties.map(property => [property, get(property)]).filter(([, value]) => value !== undefined));

/**
 * An entity as the changelogs compare it: the properties that record a changelog only, the database schema of the
 * entity, its transient fields aside, which have no column.
 */
const changelogProjection = (entity: EntityConfig): EntityConfig => ({
  ...pickProperties(entity, ENTITY_CHANGELOG_PROPERTIES),
  fields: (entity.fields ?? [])
    .filter(field => !field.transient)
    .map(field => {
      const validations = (field.fieldValidateRules ?? []).filter((rule: string) => FIELD_CHANGELOG_VALIDATIONS.includes(rule));
      return {
        ...pickProperties(field, FIELD_CHANGELOG_PROPERTIES),
        ...(validations.length > 0 ? { fieldValidateRules: validations.toSorted() } : {}),
      };
    }),
  relationships: (entity.relationships ?? []).map(relationship => {
    const validations = (relationship.relationshipValidateRules ?? []).includes('required') ? { required: true } : {};
    return {
      ...pickProperties(relationship, RELATIONSHIP_CHANGELOG_PROPERTIES, property => relationshipProperty(relationship, property)),
      ...validations,
    };
  }),
});

/** The properties of an entity that record a changelog, its fields and its relationships aside, that differ between two of its states. */
const changedEntityProperties = (before: EntityConfig, after: EntityConfig): string[] =>
  ENTITY_CHANGELOG_PROPERTIES.filter(property => !isDeepStrictEqual(before[property], after[property]));

/**
 * An entity as its \`.jhipster\` file declares it, its changelog date in its annotations, where the bootstrap of the
 * application moves it: an entity compares the same before and after the bootstrap writes it.
 */
const normalizeEntity = (definition: EntityConfig): EntityConfig => {
  const { changelogDate, ...entity } = structuredClone(definition);
  if (changelogDate !== undefined) {
    entity.annotations = { changelogDate: String(changelogDate), ...entity.annotations };
  }
  return entity;
};

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

/** The entities as the \`.jhipster\` files on the disk declare them, before this generation writes them. */
const formerEntities = (generator: Generator): { name: string; definition: EntityConfig }[] =>
  getEntitiesFromDir(generator.getEntitiesConfigPath())
    .map(name => ({ name, path: generator.getEntityConfigPath(name) }))
    .filter(({ path }) => existsSync(path))
    .map(({ name, path }) => ({ name, definition: JSON.parse(readFileSync(path, 'utf8')) as EntityConfig }))
    .filter(({ definition }) => !definition.builtIn);

const formerChangelogs = (generator: Generator): boolean =>
  generator.getContextData<boolean>(CONTEXT_DATA_FORMER_CHANGELOGS_KEY, { factory: () => findChangelogs(generator).length > 0 });

const recordChangelogs = (generator: Generator): EntityChangelogObject[] => {
  if (!formerChangelogs(generator)) {
    // A project without changelogs: the ones creating its entities, as its files on the disk declare them.
    for (const { name, definition } of formerEntities(generator)) {
      record(
        generator,
        {
          operation: 'create',
          entityName: name,
          changelogDate: changelogDateOf(generator, definition),
          entity: normalizeEntity(definition),
        },
        { existing: true },
      );
    }
  }

  const lastChangelogs = new Map<string, EntityChangelogObject>();
  for (const changelog of findChangelogs(generator)) {
    lastChangelogs.set(changelog.entityName, changelog);
  }

  const entities = generator.getExistingEntities().filter(({ definition }: { definition: EntityConfig }) => !definition.builtIn);
  for (const { name, definition } of entities as { name: string; definition: EntityConfig }[]) {
    const entity = normalizeEntity(definition);
    const last = lastChangelogs.get(name);
    if (!last || last.operation === 'remove') {
      // An entity created again after its removal gets a date after its former changelogs.
      record(generator, {
        operation: 'create',
        entityName: name,
        changelogDate: last ? nextChangelogDate(generator, last) : changelogDateOf(generator, entity),
        entity,
      });
    } else if (!isDeepStrictEqual(changelogProjection(last.entity!), changelogProjection(entity))) {
      // Only a change of the database schema records a changelog; the changelog keeps the whole entity.
      const before = changelogProjection(last.entity!);
      const after = changelogProjection(entity);
      const changedProperties = changedEntityProperties(before, after);
      const fields = diffItems(before.fields, after.fields, 'fieldName');
      const relationships = diffItems(before.relationships, after.relationships, 'relationshipName');
      const changedRelationships = splitChangedRelationships(before.relationships, after.relationships, relationships.changed);
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

  const entityNames = new Set(entities.map(({ name }: { name: string }) => name));
  for (const [name, last] of lastChangelogs) {
    if (last.operation !== 'remove' && !entityNames.has(name)) {
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
 * getting the same ones. A changelog is recorded for each change of an entity, never changed once recorded, so a
 * changelog written from them is the same whatever the files of the project. An entity is compared to the entity of its
 * last changelog; a project without changelogs gets the ones creating its entities, as its \`.jhipster\` files on the
 * disk declare them, first. A generator using them writes incremental changelogs.
 *
 * A generator using them declares the custom object (\`customObjects: [{ name: CHANGELOGS_CUSTOM_OBJECT }]\`) and gives
 * them from its \`changelogs\` getter: \`get changelogs() { return getEntityChangelogs(this); }\`.
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
