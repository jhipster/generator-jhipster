/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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

import { before, describe, expect, it } from 'esmocha';
import createApplicationConfigurationFromObject from '../models/jdl-application-configuration-factory.js';
import applicationOptions from '../../../jhipster/application-options.js';
import { getDefaultRuntime } from '../runtime.js';

const { OptionNames } = applicationOptions;

const runtime = getDefaultRuntime();

describe('jdl - JDLApplicationConfigurationFactory', () => {
  describe('createApplicationConfigurationFromObject', () => {
    describe('when passing no configuration', () => {
      let createdConfiguration;

      before(() => {
        createdConfiguration = createApplicationConfigurationFromObject(undefined, runtime);
      });

      it('should a configuration without option', () => {
        expect(createdConfiguration).toMatchInlineSnapshot(`
JDLApplicationConfiguration {
  "namespace": undefined,
  "options": {},
}
`);
      });
    });
    describe('when passing a configuration', () => {
      describe('containing a string option', () => {
        let createdConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject(
            {
              [OptionNames.BASE_NAME]: 'application',
            },
            runtime,
          );
        });

        it('should create it', () => {
          expect(createdConfiguration).toMatchInlineSnapshot(`
JDLApplicationConfiguration {
  "namespace": undefined,
  "options": {
    "baseName": StringJDLApplicationConfigurationOption {
      "name": "baseName",
      "quoted": false,
      "value": "application",
    },
  },
}
`);
        });
      });
      describe('containing a integer option', () => {
        let createdConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject(
            {
              [OptionNames.SERVER_PORT]: 8042,
            },
            runtime,
          );
        });

        it('should create it', () => {
          expect(createdConfiguration).toMatchInlineSnapshot(`
JDLApplicationConfiguration {
  "namespace": undefined,
  "options": {
    "serverPort": IntegerJDLApplicationConfigurationOption {
      "name": "serverPort",
      "value": 8042,
    },
  },
}
`);
        });
      });
      describe('containing a boolean option', () => {
        let createdConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject(
            {
              [OptionNames.ENABLE_TRANSLATION]: true,
            },
            runtime,
          );
        });

        it('should create it', () => {
          expect(createdConfiguration).toMatchInlineSnapshot(`
JDLApplicationConfiguration {
  "namespace": undefined,
  "options": {
    "enableTranslation": BooleanJDLApplicationConfigurationOption {
      "name": "enableTranslation",
      "value": true,
    },
  },
}
`);
        });
      });
      describe('containing a list-based option', () => {
        let createdConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject(
            {
              [OptionNames.TEST_FRAMEWORKS]: ['gatling'],
            },
            runtime,
          );
        });

        it('should create it', () => {
          expect(createdConfiguration).toMatchInlineSnapshot(`
JDLApplicationConfiguration {
  "namespace": undefined,
  "options": {
    "testFrameworks": ListJDLApplicationConfigurationOption {
      "name": "testFrameworks",
      "quoted": false,
      "value": Set {
        "gatling",
      },
    },
  },
}
`);
        });
      });
    });
  });
});
