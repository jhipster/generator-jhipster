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
import { before, describe, esmocha, expect, it } from 'esmocha';
import { basename } from 'node:path';

import EnvironmentBuilder from '../../cli/environment-builder.ts';
import { defaultHelpers as helpers } from '../../lib/testing/index.ts';
import { shouldSupportFeatures } from '../../test/support/tests.ts';

import Generator from './index.ts';

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

  describe('custom priorities tasks', () => {
    // no args
    const initializing = esmocha.fn();
    const prompting = esmocha.fn();
    const configuring = esmocha.fn();
    const composing = esmocha.fn();

    // application arg
    const loading = esmocha.fn();
    const preparing = esmocha.fn();
    const defaultTask = esmocha.fn();
    const postPreparing = esmocha.fn();
    const writing = esmocha.fn();
    const postWriting = esmocha.fn();
    const install = esmocha.fn();
    const end = esmocha.fn();

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

      get [Generator.DEFAULT]() {
        return { defaultTask };
      }

      get [Generator.WRITING]() {
        return { writing };
      }

      get [Generator.POST_WRITING]() {
        return { postWriting };
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

      expect(initializing).toHaveBeenCalledWith(controlArg);
      expect(prompting).toHaveBeenCalledWith(controlArg);
      expect(configuring).toHaveBeenCalledWith(controlArg);
      expect(composing).toHaveBeenCalledWith(controlArg);
      expect(loading).toHaveBeenCalledWith(applicationDefaultsArg);
      expect(postPreparing).toHaveBeenCalledWith(applicationSourceArg);

      expect(defaultTask).toHaveBeenCalledWith(applicationArg);
      expect(writing).toHaveBeenCalledWith(applicationArg);
      expect(install).toHaveBeenCalledWith(applicationArg);
      expect(end).toHaveBeenCalledWith(applicationArg);

      expect(preparing).toHaveBeenCalledWith({ ...applicationSourceArg, ...applicationDefaultsArg });
      expect(postWriting).toHaveBeenCalledWith(applicationSourceArg);
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
    const defaultTask = esmocha.fn();
    const writing = esmocha.fn();
    const postWriting = esmocha.fn();
    const install = esmocha.fn();
    const end = esmocha.fn();

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

      get [Generator.DEFAULT]() {
        return { defaultTask };
      }

      get [Generator.WRITING]() {
        return { writing };
      }

      get [Generator.POST_WRITING]() {
        return { postWriting };
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

      expect(initializing).toHaveBeenCalledWith(controlArg);
      expect(prompting).toHaveBeenCalledWith(controlArg);
      expect(configuring).toHaveBeenCalledWith(controlArg);
      expect(composing).toHaveBeenCalledWith(controlArg);
      expect(loading).toHaveBeenCalledWith(applicationDefaultsArg);

      expect(defaultTask).toHaveBeenCalledWith(applicationArg);

      expect(writing).toHaveBeenCalledWith(applicationArg);
      expect(install).toHaveBeenCalledWith(applicationArg);
      expect(end).toHaveBeenCalledWith(applicationArg);

      expect(preparing).toHaveBeenCalledWith({ ...applicationSourceArg, ...applicationDefaultsArg });
      expect(postWriting).toHaveBeenCalledWith(applicationSourceArg);
    });
  });
});
