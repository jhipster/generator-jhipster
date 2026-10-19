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
import { before, describe, exnode, expect, it } from 'expect-node';
import { basename } from 'node:path';

import EnvironmentBuilder from '../../cli/environment-builder.ts';

import Generator from './index.ts';

import { shouldSupportFeatures } from '#test-support';
import { defaultHelpers as helpers, result as runResult } from '#testing';

const generator = basename(import.meta.dirname);

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);

  describe('EnvironmentBuilder', () => {
    let envBuilder: EnvironmentBuilder;
    before(async () => {
      envBuilder = await EnvironmentBuilder.createDefaultBuilder();
    });
    it(`should be registered as jhipster:${generator} at yeoman-environment`, async () => {
      expect(await envBuilder.getEnvironment().get(`jhipster:${generator}`)).toBe(Generator);
    });
  });

  describe('entityDefaults, fieldDefaults and relationshipDefaults', () => {
    const prepared: Record<string, any> = {};
    const preparedFields: Record<string, any> = {};
    const preparedRelationships: Record<string, any> = {};

    class CustomGenerator extends Generator {
      async beforeQueue() {
        await this.dependsOnBootstrap('app');
      }

      get [Generator.PREPARING_EACH_ENTITY]() {
        return this.asPreparingEachEntityTaskGroup({
          setDefaults({ entityDefaults }) {
            // Properties a blueprint adds to the entity, unknown to the base entity type.
            const defaults: any[] = [
              { customLabel: ({ name }: any) => `label-${name}`, customFlag: true },
              { customLabel: 'not applied', customPage: ({ customLabel }: any) => `${customLabel}-page` },
              // Waits for a property a later task sets, applied once the entities are prepared.
              { customDelayed: ({ customLater }: any, { delayMarker }: any) => (customLater ? `${customLater}-delayed` : delayMarker) },
            ];
            entityDefaults(...defaults);
          },
          setLater({ entity }) {
            (entity as any).customLater = `later-${entity.name}`;
            prepared[entity.name] = entity;
          },
        });
      }

      get [Generator.PREPARING_EACH_ENTITY_FIELD]() {
        return this.asPreparingEachEntityFieldTaskGroup({
          setDefaults({ entity, field, fieldDefaults }) {
            const defaults: any[] = [
              { customFieldLabel: ({ fieldName }: any) => `label-${fieldName}` },
              {
                customFieldDelayed: ({ customLater }: any, { delayMarker }: any) => (customLater ? `${customLater}-delayed` : delayMarker),
              },
            ];
            fieldDefaults(...defaults);
            (field as any).customLater = `later-${field.fieldName}`;
            preparedFields[`${entity.name}.${field.fieldName}`] = field;
          },
        });
      }

      get [Generator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
        return this.asPreparingEachEntityRelationshipTaskGroup({
          setDefaults({ entity, relationship, relationshipDefaults }) {
            const defaults: any[] = [
              { customRelationshipLabel: ({ relationshipName }: any) => `label-${relationshipName}` },
              {
                customRelationshipDelayed: ({ customLater }: any, { delayMarker }: any) =>
                  customLater ? `${customLater}-delayed` : delayMarker,
              },
            ];
            relationshipDefaults(...defaults);
            (relationship as any).customLater = `later-${relationship.relationshipName}`;
            preparedRelationships[`${entity.name}.${relationship.relationshipName}`] = relationship;
          },
        });
      }
    }

    before(async () => {
      await helpers
        .run(CustomGenerator)
        .withJHipsterGenerators({ useDefaultMocks: true })
        .withJHipsterConfig({}, [
          {
            name: 'One',
            fields: [
              { fieldName: 'name', fieldType: 'String' },
              { fieldName: 'code', fieldType: 'String', options: { customFieldLabel: 'from annotation' } },
            ],
            relationships: [
              { relationshipName: 'two', otherEntityName: 'Two', relationshipType: 'many-to-one' },
              {
                relationshipName: 'other',
                otherEntityName: 'Two',
                relationshipType: 'many-to-one',
                options: { customRelationshipLabel: 'from annotation' },
              },
            ],
          },
          { name: 'Two', annotations: { customLabel: 'from annotation' } },
        ]);
    });

    it('should set the defaults the entity has no value for, in order', () => {
      expect(prepared.One).toMatchObject({ customLabel: 'label-One', customFlag: true, customPage: 'label-One-page' });
    });

    it('should keep the value an annotation gives', () => {
      expect(prepared.Two).toMatchObject({ customLabel: 'from annotation', customPage: 'from annotation-page' });
    });

    it('should apply the delayed defaults once the entities are prepared', () => {
      expect(prepared.One).toMatchObject({ customDelayed: 'later-One-delayed' });
      expect(preparedFields['One.name']).toMatchObject({ customFieldDelayed: 'later-name-delayed' });
      expect(preparedRelationships['One.two']).toMatchObject({ customRelationshipDelayed: 'later-two-delayed' });
    });

    it('should set the defaults of the fields, keeping the value an annotation gives', () => {
      expect(preparedFields['One.name']).toMatchObject({ customFieldLabel: 'label-name' });
      expect(preparedFields['One.code']).toMatchObject({ customFieldLabel: 'from annotation' });
    });

    it('should set the defaults of the relationships, keeping the value an annotation gives', () => {
      expect(preparedRelationships['One.two']).toMatchObject({ customRelationshipLabel: 'label-two' });
      expect(preparedRelationships['One.other']).toMatchObject({ customRelationshipLabel: 'from annotation' });
    });
  });

  describe('custom priorities tasks', () => {
    // no args
    const initializing = exnode.fn();
    const prompting = exnode.fn();
    const configuring = exnode.fn();
    const composing = exnode.fn();

    // application arg
    const loading = exnode.fn();
    const preparing = exnode.fn();
    const postPreparing = exnode.fn();
    const writing = exnode.fn();
    const postWriting = exnode.fn();
    const install = exnode.fn();
    const end = exnode.fn();

    // entities args
    const configuringEachEntity = exnode.fn();
    const preparingEachEntity = exnode.fn();
    const preparingEachEntityField = exnode.fn();
    const preparingEachEntityRelationship = exnode.fn();
    const postPreparingEachEntity = exnode.fn();
    const defaultTask = exnode.fn();
    const writingEntities = exnode.fn();
    const postWritingEntities = exnode.fn();

    class CustomGenerator extends Generator {
      async beforeQueue() {
        await this.dependsOnBootstrap('app');
      }

      get [Generator.INITIALIZING]() {
        return { initializing };
      }

      get [Generator.PROMPTING]() {
        return { prompting };
      }

      get [Generator.CONFIGURING]() {
        return { configuring };
      }

      get [Generator.COMPOSING]() {
        return { composing };
      }

      get [Generator.LOADING]() {
        return { loading };
      }

      get [Generator.PREPARING]() {
        return { preparing };
      }

      get [Generator.POST_PREPARING]() {
        return { postPreparing };
      }

      get [Generator.CONFIGURING_EACH_ENTITY]() {
        return { configuringEachEntity };
      }

      get [Generator.PREPARING_EACH_ENTITY]() {
        return { preparingEachEntity };
      }

      get [Generator.PREPARING_EACH_ENTITY_FIELD]() {
        return { preparingEachEntityField };
      }

      get [Generator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
        return { preparingEachEntityRelationship };
      }

      get [Generator.POST_PREPARING_EACH_ENTITY]() {
        return { postPreparingEachEntity };
      }

      get [Generator.DEFAULT]() {
        return { defaultTask };
      }

      get [Generator.WRITING]() {
        return { writing };
      }

      get [Generator.WRITING_ENTITIES]() {
        return { writingEntities };
      }

      get [Generator.POST_WRITING]() {
        return { postWriting };
      }

      get [Generator.POST_WRITING_ENTITIES]() {
        return { postWritingEntities };
      }

      get [Generator.INSTALL]() {
        return { install };
      }

      get [Generator.END]() {
        return { end };
      }
    }

    before(async () => {
      await helpers
        .run(CustomGenerator)
        .withJHipsterGenerators({ useDefaultMocks: true })
        .withJHipsterConfig({}, [
          {
            name: 'One',
            fields: [{ fieldName: 'id', fieldType: 'Long' }],
            relationships: [{ relationshipName: 'two', otherEntityName: 'Two', relationshipType: 'many-to-one' }],
          },
          {
            name: 'Two',
            fields: [
              { fieldName: 'id', fieldType: 'Long' },
              { fieldName: 'name', fieldType: 'String' },
            ],
            relationships: [
              { relationshipName: 'one', otherEntityName: 'One', relationshipType: 'many-to-one' },
              { relationshipName: 'three', otherEntityName: 'Three', relationshipType: 'many-to-one' },
            ],
          },
          {
            name: 'Three',
          },
        ]);
    });

    it('should call priorities with correct arguments', async () => {
      const controlArg = {
        control: expect.any(Object),
      };

      const applicationArg = {
        ...controlArg,
        application: expect.any(Object),
      };

      const applicationSourceArg = {
        ...applicationArg,
        source: expect.any(Object),
      };

      const applicationDefaultsArg = {
        ...applicationArg,
        applicationDefaults: expect.any(Function),
      };

      const entityConfiguringArg = {
        ...applicationArg,
        entityStorage: expect.any(Object),
        entityConfig: expect.any(Object),
      };

      const entityArg = {
        ...applicationArg,
        entity: expect.any(Object),
        entityName: expect.any(String),
        description: expect.any(String),
      };

      const entityDefaultsArg = {
        ...entityArg,
        entityDefaults: expect.any(Function),
      };

      const fieldArg = {
        ...entityArg,
        fieldName: expect.any(String),
        field: expect.any(Object),
        fieldDefaults: expect.any(Function),
      };

      const relationshipArg = {
        ...entityArg,
        entityName: expect.any(String),
        relationshipName: expect.any(String),
        relationship: expect.any(Object),
        relationshipDefaults: expect.any(Function),
      };

      const entitiesArg = {
        ...controlArg,
        ...applicationArg,
        entities: [expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object)],
      };

      expect(initializing).toHaveBeenCalledWith(controlArg);
      expect(prompting).toHaveBeenCalledWith(controlArg);
      expect(configuring).toHaveBeenCalledWith(controlArg);
      expect(composing).toHaveBeenCalledWith(controlArg);
      expect(loading).toHaveBeenCalledWith(applicationDefaultsArg);
      expect(postPreparing).toHaveBeenCalledWith(applicationSourceArg);

      expect(configuringEachEntity).toHaveBeenCalledTimes(3);
      expect(configuringEachEntity).toHaveBeenNthCalledWith(1, { ...entityConfiguringArg, entityName: 'One' });
      expect(configuringEachEntity).toHaveBeenNthCalledWith(2, { ...entityConfiguringArg, entityName: 'Two' });
      expect(configuringEachEntity).toHaveBeenNthCalledWith(3, { ...entityConfiguringArg, entityName: 'Three' });

      expect(preparingEachEntity).toHaveBeenCalledTimes(6);
      expect(preparingEachEntity).toHaveBeenNthCalledWith(1, { ...entityDefaultsArg, entityName: 'User' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(2, { ...entityDefaultsArg, entityName: 'UserManagement' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(3, { ...entityDefaultsArg, entityName: 'Authority' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(4, { ...entityDefaultsArg, entityName: 'One' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(5, { ...entityDefaultsArg, entityName: 'Two' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(6, { ...entityDefaultsArg, entityName: 'Three' });

      expect(preparingEachEntityField).toHaveBeenCalledTimes(25);
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(1, { ...fieldArg, description: 'User#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(2, { ...fieldArg, description: 'User#login' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(3, { ...fieldArg, description: 'User#firstName' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(4, { ...fieldArg, description: 'User#lastName' });
      // Omit UserManagement fields
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(25 - 4, { ...fieldArg, description: 'Authority#name' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(25 - 3, { ...fieldArg, description: 'One#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(25 - 2, { ...fieldArg, description: 'Two#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(25 - 1, { ...fieldArg, description: 'Two#name' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(25, { ...fieldArg, description: 'Three#id' });

      expect(preparingEachEntityRelationship).toHaveBeenCalledTimes(4);
      // Omit UserManagement relationships
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(2, { ...relationshipArg, description: 'One#two' });
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(3, { ...relationshipArg, description: 'Two#one' });
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(4, { ...relationshipArg, description: 'Two#three' });

      expect(postPreparingEachEntity).toHaveBeenCalledTimes(6);
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(1, { ...entityArg, entityName: 'User' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(2, { ...entityArg, entityName: 'UserManagement' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(3, { ...entityArg, entityName: 'Authority' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(4, { ...entityArg, entityName: 'One' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(5, { ...entityArg, entityName: 'Two' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(6, { ...entityArg, entityName: 'Three' });

      expect(defaultTask).toHaveBeenCalledWith(entitiesArg);
      expect(writingEntities).toHaveBeenCalledWith(entitiesArg);
      expect(postWritingEntities).toHaveBeenCalledWith({ ...entitiesArg, source: expect.any(Object) });

      expect(writing).toHaveBeenCalledWith(applicationArg);
      expect(install).toHaveBeenCalledWith(applicationArg);
      expect(end).toHaveBeenCalledWith(applicationArg);

      expect(preparing).toHaveBeenCalledWith({ ...applicationSourceArg, ...applicationDefaultsArg });
      expect(postWriting).toHaveBeenCalledWith(applicationSourceArg);
    });
  });

  describe('entities order', () => {
    class OrderGenerator extends Generator {
      async beforeQueue() {
        await this.dependsOnBootstrap('app');
      }

      get [Generator.END]() {
        return { end() {} };
      }
    }

    before(async () => {
      await helpers
        .run(OrderGenerator)
        .withJHipsterGenerators({ useDefaultMocks: true })
        // UserManagement gets the changelog date of the creation timestamp plus one minute: 20200804035352.
        .withJHipsterConfig({ creationTimestamp: 1596513172471 }, [
          { name: 'Bar' },
          { name: 'Foo', annotations: { changelogDate: '20200804035352' } },
          { name: 'UserManagement' },
        ]);
    });

    it('orders an entity without changelog date by the date it gets, so that a regeneration keeps the order', () => {
      const yoRc = runResult.fs.readJSON(`${runResult.cwd}/.yo-rc.json`) as { 'generator-jhipster': { entities: string[] } };
      expect(yoRc['generator-jhipster'].entities).toEqual(['Foo', 'UserManagement', 'Bar']);
    });
  });

  describe('entities option', () => {
    // no args
    const initializing = exnode.fn();
    const prompting = exnode.fn();
    const configuring = exnode.fn();
    const composing = exnode.fn();

    // application arg
    const loading = exnode.fn();
    const preparing = exnode.fn();
    const writing = exnode.fn();
    const postWriting = exnode.fn();
    const install = exnode.fn();
    const end = exnode.fn();

    // entities args
    const configuringEachEntity = exnode.fn();
    const preparingEachEntity = exnode.fn();
    const preparingEachEntityField = exnode.fn();
    const preparingEachEntityRelationship = exnode.fn();
    const postPreparingEachEntity = exnode.fn();
    const defaultTask = exnode.fn();
    const writingEntities = exnode.fn();
    const postWritingEntities = exnode.fn();

    class CustomGenerator extends Generator {
      async beforeQueue() {
        await this.dependsOnBootstrap('app');
      }

      get [Generator.INITIALIZING]() {
        return { initializing };
      }

      get [Generator.PROMPTING]() {
        return { prompting };
      }

      get [Generator.CONFIGURING]() {
        return { configuring };
      }

      get [Generator.COMPOSING]() {
        return { composing };
      }

      get [Generator.LOADING]() {
        return { loading };
      }

      get [Generator.PREPARING]() {
        return { preparing };
      }

      get [Generator.CONFIGURING_EACH_ENTITY]() {
        return { configuringEachEntity };
      }

      get [Generator.PREPARING_EACH_ENTITY]() {
        return { preparingEachEntity };
      }

      get [Generator.PREPARING_EACH_ENTITY_FIELD]() {
        return { preparingEachEntityField };
      }

      get [Generator.PREPARING_EACH_ENTITY_RELATIONSHIP]() {
        return { preparingEachEntityRelationship };
      }

      get [Generator.POST_PREPARING_EACH_ENTITY]() {
        return { postPreparingEachEntity };
      }

      get [Generator.DEFAULT]() {
        return { defaultTask };
      }

      get [Generator.WRITING]() {
        return { writing };
      }

      get [Generator.WRITING_ENTITIES]() {
        return { writingEntities };
      }

      get [Generator.POST_WRITING]() {
        return { postWriting };
      }

      get [Generator.POST_WRITING_ENTITIES]() {
        return { postWritingEntities };
      }

      get [Generator.INSTALL]() {
        return { install };
      }

      get [Generator.END]() {
        return { end };
      }
    }

    before(async () => {
      await helpers
        .run(CustomGenerator)
        .withJHipsterGenerators({ useDefaultMocks: true })
        .withJHipsterConfig({}, [
          {
            name: 'One',
            fields: [{ fieldName: 'id', fieldType: 'Long' }],
            relationships: [{ relationshipName: 'two', otherEntityName: 'Two', relationshipType: 'many-to-one' }],
          },
          {
            name: 'Two',
            fields: [
              { fieldName: 'id', fieldType: 'Long' },
              { fieldName: 'name', fieldType: 'String' },
            ],
            relationships: [
              { relationshipName: 'one', otherEntityName: 'One', relationshipType: 'many-to-one' },
              { relationshipName: 'three', otherEntityName: 'Three', relationshipType: 'many-to-one' },
            ],
          },
          {
            name: 'Three',
          },
        ])
        .withOptions({
          entities: ['One', 'Two'],
        });
    });

    it('should call writingEntities and postWriting priorities with filtered entities', async () => {
      const controlArg = {
        control: expect.any(Object),
      };

      const applicationArg = {
        ...controlArg,
        application: expect.any(Object),
      };

      const applicationSourceArg = {
        ...applicationArg,
        source: expect.any(Object),
      };

      const applicationDefaultsArg = {
        ...applicationArg,
        applicationDefaults: expect.any(Function),
      };

      const entityConfiguringArg = {
        ...applicationArg,
        entityStorage: expect.any(Object),
        entityConfig: expect.any(Object),
      };

      const entityArg = {
        ...applicationArg,
        entity: expect.any(Object),
        entityName: expect.any(String),
        description: expect.any(String),
      };

      const entityDefaultsArg = {
        ...entityArg,
        entityDefaults: expect.any(Function),
      };

      const fieldArg = {
        ...entityArg,
        fieldName: expect.any(String),
        field: expect.any(Object),
        fieldDefaults: expect.any(Function),
      };

      const relationshipArg = {
        ...entityArg,
        entityName: expect.any(String),
        relationshipName: expect.any(String),
        relationship: expect.any(Object),
        relationshipDefaults: expect.any(Function),
      };

      const entitiesArg = {
        ...applicationArg,
        entities: [expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object)],
      };

      const writingEntitiesArg = {
        ...applicationArg,
        entities: [expect.any(Object), expect.any(Object)],
      };

      const postWritingEntitiesArg = {
        ...writingEntitiesArg,
        source: expect.any(Object),
      };

      expect(initializing).toHaveBeenCalledWith(controlArg);
      expect(prompting).toHaveBeenCalledWith(controlArg);
      expect(configuring).toHaveBeenCalledWith(controlArg);
      expect(composing).toHaveBeenCalledWith(controlArg);
      expect(loading).toHaveBeenCalledWith(applicationDefaultsArg);

      expect(configuringEachEntity).toHaveBeenCalledTimes(3);
      expect(configuringEachEntity).toHaveBeenNthCalledWith(1, { ...entityConfiguringArg, entityName: 'One' });
      expect(configuringEachEntity).toHaveBeenNthCalledWith(2, { ...entityConfiguringArg, entityName: 'Two' });
      expect(configuringEachEntity).toHaveBeenNthCalledWith(3, { ...entityConfiguringArg, entityName: 'Three' });

      expect(preparingEachEntity).toHaveBeenCalledTimes(6);
      expect(preparingEachEntity).toHaveBeenNthCalledWith(1, { ...entityDefaultsArg, entityName: 'User' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(2, { ...entityDefaultsArg, entityName: 'UserManagement' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(3, { ...entityDefaultsArg, entityName: 'Authority' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(4, { ...entityDefaultsArg, entityName: 'One' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(5, { ...entityDefaultsArg, entityName: 'Two' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(6, { ...entityDefaultsArg, entityName: 'Three' });

      expect(preparingEachEntityField).toHaveBeenCalledTimes(25);
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(1, { ...fieldArg, description: 'User#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(2, { ...fieldArg, description: 'User#login' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(3, { ...fieldArg, description: 'User#firstName' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(4, { ...fieldArg, description: 'User#lastName' });
      // Omit UserManagement fields
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(25 - 4, { ...fieldArg, description: 'Authority#name' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(25 - 3, { ...fieldArg, description: 'One#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(25 - 2, { ...fieldArg, description: 'Two#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(25 - 1, { ...fieldArg, description: 'Two#name' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(25, { ...fieldArg, description: 'Three#id' });

      expect(preparingEachEntityRelationship).toHaveBeenCalledTimes(4);
      // Omit UserManagement relationships
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(2, { ...relationshipArg, description: 'One#two' });
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(3, { ...relationshipArg, description: 'Two#one' });
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(4, { ...relationshipArg, description: 'Two#three' });

      expect(postPreparingEachEntity).toHaveBeenCalledTimes(6);
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(1, { ...entityArg, entityName: 'User' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(2, { ...entityArg, entityName: 'UserManagement' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(3, { ...entityArg, entityName: 'Authority' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(4, { ...entityArg, entityName: 'One' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(5, { ...entityArg, entityName: 'Two' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(6, { ...entityArg, entityName: 'Three' });

      expect(defaultTask).toHaveBeenCalledWith(entitiesArg);

      expect(writingEntities).toHaveBeenCalledWith(writingEntitiesArg);
      expect(postWritingEntities).toHaveBeenCalledWith(postWritingEntitiesArg);

      expect(writing).toHaveBeenCalledWith(applicationArg);
      expect(install).toHaveBeenCalledWith(applicationArg);
      expect(end).toHaveBeenCalledWith(applicationArg);

      expect(preparing).toHaveBeenCalledWith({ ...applicationSourceArg, ...applicationDefaultsArg });
      expect(postWriting).toHaveBeenCalledWith(applicationSourceArg);
    });
  });
});
