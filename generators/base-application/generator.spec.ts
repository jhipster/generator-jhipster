/* eslint-disable max-classes-per-file */
/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, it, describe, expect, esmocha } from 'esmocha';
import lodash from 'lodash';

import EnvironmentBuilder from '../../cli/environment-builder.mjs';
import Generator from './index.js';
import type { BaseApplication } from '../base-application/types.js';
import { defaultHelpers as helpers } from '../../test/support/index.js';
import { shouldSupportFeatures } from '../../test/support/tests.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);

  // TODO test is broken due to @esbuild-kit/esm-loader
  describe.skip('EnvironmentBuilder', () => {
    let envBuilder;
    before(() => {
      envBuilder = EnvironmentBuilder.createDefaultBuilder();
    });
    it(`should be registered as jhipster:${generator} at yeoman-environment`, async () => {
      expect(await envBuilder.getEnvironment().get(`jhipster:${generator}`)).toBe(Generator);
    });
  });

  describe('custom priorities tasks', () => {
    // no args
    const initializing = esmocha.fn();
    const prompting = esmocha.fn();
    const configuring = esmocha.fn();
    const composing = esmocha.fn();

    // application arg
    const loading = esmocha.fn();
    const preparing = esmocha.fn();
    const postPreparing = esmocha.fn();
    const writing = esmocha.fn();
    const postWriting = esmocha.fn();
    const install = esmocha.fn();
    const end = esmocha.fn();

    // entities args
    const configuringEachEntity = esmocha.fn();
    const preparingEachEntity = esmocha.fn();
    const preparingEachEntityField = esmocha.fn();
    const preparingEachEntityRelationship = esmocha.fn();
    const postPreparingEachEntity = esmocha.fn();
    const defaultTask = esmocha.fn();
    const writingEntities = esmocha.fn();
    const postWritingEntities = esmocha.fn();

    class CustomGenerator extends Generator<BaseApplication> {
      async beforeQueue() {
        await this.dependsOnJHipster('bootstrap-application');
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
      await helpers.run(CustomGenerator).withJHipsterConfig({}, [
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

      const fieldArg = {
        ...entityArg,
        fieldName: expect.any(String),
        field: expect.any(Object),
      };

      const relationshipArg = {
        ...entityArg,
        entityName: expect.any(String),
        relationshipName: expect.any(String),
        relationship: expect.any(Object),
      };

      const entitiesArg = {
        ...controlArg,
        ...applicationArg,
        entities: [expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object)],
      };

      expect(initializing).toBeCalledWith(controlArg);
      expect(prompting).toBeCalledWith(controlArg);
      expect(configuring).toBeCalledWith(controlArg);
      expect(composing).toBeCalledWith(controlArg);
      expect(loading).toBeCalledWith(applicationDefaultsArg);
      expect(postPreparing).toBeCalledWith(applicationSourceArg);

      expect(configuringEachEntity).toBeCalledTimes(3);
      expect(configuringEachEntity).toHaveBeenNthCalledWith(1, { ...entityConfiguringArg, entityName: 'One' });
      expect(configuringEachEntity).toHaveBeenNthCalledWith(2, { ...entityConfiguringArg, entityName: 'Two' });
      expect(configuringEachEntity).toHaveBeenNthCalledWith(3, { ...entityConfiguringArg, entityName: 'Three' });

      expect(preparingEachEntity).toBeCalledTimes(4);
      expect(preparingEachEntity).toHaveBeenNthCalledWith(1, { ...entityArg, entityName: 'User' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(2, { ...entityArg, entityName: 'One' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(3, { ...entityArg, entityName: 'Two' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(4, { ...entityArg, entityName: 'Three' });

      expect(preparingEachEntityField).toBeCalledTimes(8);
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(1, { ...fieldArg, description: 'User#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(2, { ...fieldArg, description: 'User#login' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(3, { ...fieldArg, description: 'User#firstName' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(4, { ...fieldArg, description: 'User#lastName' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(5, { ...fieldArg, description: 'One#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(6, { ...fieldArg, description: 'Two#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(7, { ...fieldArg, description: 'Two#name' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(8, { ...fieldArg, description: 'Three#id' });

      expect(preparingEachEntityRelationship).toBeCalledTimes(3);
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(1, { ...relationshipArg, description: 'One#two' });
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(2, { ...relationshipArg, description: 'Two#one' });
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(3, { ...relationshipArg, description: 'Two#three' });

      expect(postPreparingEachEntity).toBeCalledTimes(4);
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(1, { ...entityArg, entityName: 'User' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(2, { ...entityArg, entityName: 'One' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(3, { ...entityArg, entityName: 'Two' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(4, { ...entityArg, entityName: 'Three' });

      expect(defaultTask).toBeCalledWith(entitiesArg);
      expect(writingEntities).toBeCalledWith(entitiesArg);
      expect(postWritingEntities).toBeCalledWith({ ...entitiesArg, source: expect.any(Object) });

      expect(writing).toBeCalledWith(applicationArg);
      expect(install).toBeCalledWith(applicationArg);
      expect(end).toBeCalledWith(applicationArg);

      expect(preparing).toBeCalledWith({ ...applicationSourceArg, ...applicationDefaultsArg });
      expect(postWriting).toBeCalledWith(applicationSourceArg);
    });
  });

  describe('entities option', () => {
    // no args
    const initializing = esmocha.fn();
    const prompting = esmocha.fn();
    const configuring = esmocha.fn();
    const composing = esmocha.fn();

    // application arg
    const loading = esmocha.fn();
    const preparing = esmocha.fn();
    const writing = esmocha.fn();
    const postWriting = esmocha.fn();
    const install = esmocha.fn();
    const end = esmocha.fn();

    // entities args
    const configuringEachEntity = esmocha.fn();
    const preparingEachEntity = esmocha.fn();
    const preparingEachEntityField = esmocha.fn();
    const preparingEachEntityRelationship = esmocha.fn();
    const postPreparingEachEntity = esmocha.fn();
    const defaultTask = esmocha.fn();
    const writingEntities = esmocha.fn();
    const postWritingEntities = esmocha.fn();

    class CustomGenerator extends Generator<BaseApplication> {
      async beforeQueue() {
        await this.dependsOnJHipster('bootstrap-application');
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

      const fieldArg = {
        ...entityArg,
        fieldName: expect.any(String),
        field: expect.any(Object),
      };

      const relationshipArg = {
        ...entityArg,
        entityName: expect.any(String),
        relationshipName: expect.any(String),
        relationship: expect.any(Object),
      };

      const entitiesArg = {
        ...applicationArg,
        entities: [expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object)],
      };

      const writingEntitiesArg = {
        ...applicationArg,
        entities: [expect.any(Object), expect.any(Object)],
      };

      const postWritingEntitiesArg = {
        ...writingEntitiesArg,
        source: expect.any(Object),
      };

      expect(initializing).toBeCalledWith(controlArg);
      expect(prompting).toBeCalledWith(controlArg);
      expect(configuring).toBeCalledWith(controlArg);
      expect(composing).toBeCalledWith(controlArg);
      expect(loading).toBeCalledWith(applicationDefaultsArg);

      expect(configuringEachEntity).toBeCalledTimes(3);
      expect(configuringEachEntity).toHaveBeenNthCalledWith(1, { ...entityConfiguringArg, entityName: 'One' });
      expect(configuringEachEntity).toHaveBeenNthCalledWith(2, { ...entityConfiguringArg, entityName: 'Two' });
      expect(configuringEachEntity).toHaveBeenNthCalledWith(3, { ...entityConfiguringArg, entityName: 'Three' });

      expect(preparingEachEntity).toBeCalledTimes(4);
      expect(preparingEachEntity).toHaveBeenNthCalledWith(1, { ...entityArg, entityName: 'User' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(2, { ...entityArg, entityName: 'One' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(3, { ...entityArg, entityName: 'Two' });
      expect(preparingEachEntity).toHaveBeenNthCalledWith(4, { ...entityArg, entityName: 'Three' });

      expect(preparingEachEntityField).toBeCalledTimes(8);
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(1, { ...fieldArg, description: 'User#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(2, { ...fieldArg, description: 'User#login' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(3, { ...fieldArg, description: 'User#firstName' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(4, { ...fieldArg, description: 'User#lastName' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(5, { ...fieldArg, description: 'One#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(6, { ...fieldArg, description: 'Two#id' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(7, { ...fieldArg, description: 'Two#name' });
      expect(preparingEachEntityField).toHaveBeenNthCalledWith(8, { ...fieldArg, description: 'Three#id' });

      expect(preparingEachEntityRelationship).toBeCalledTimes(3);
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(1, { ...relationshipArg, description: 'One#two' });
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(2, { ...relationshipArg, description: 'Two#one' });
      expect(preparingEachEntityRelationship).toHaveBeenNthCalledWith(3, { ...relationshipArg, description: 'Two#three' });

      expect(postPreparingEachEntity).toBeCalledTimes(4);
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(1, { ...entityArg, entityName: 'User' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(2, { ...entityArg, entityName: 'One' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(3, { ...entityArg, entityName: 'Two' });
      expect(postPreparingEachEntity).toHaveBeenNthCalledWith(4, { ...entityArg, entityName: 'Three' });

      expect(defaultTask).toBeCalledWith(entitiesArg);

      expect(writingEntities).toBeCalledWith(writingEntitiesArg);
      expect(postWritingEntities).toBeCalledWith(postWritingEntitiesArg);

      expect(writing).toBeCalledWith(applicationArg);
      expect(install).toBeCalledWith(applicationArg);
      expect(end).toBeCalledWith(applicationArg);

      expect(preparing).toBeCalledWith({ ...applicationSourceArg, ...applicationDefaultsArg });
      expect(postWriting).toBeCalledWith(applicationSourceArg);
    });
  });
});
