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

import { jestExpect as expect } from 'mocha-expect-snapshot';
import createApplicationConfigurationFromObject from '../../../jdl/models/jdl-application-configuration-factory.js';
import { applicationOptions } from '../../../jdl/jhipster/index.mjs';

const { OptionNames } = applicationOptions;

describe('JDLApplicationConfigurationFactory', () => {
  describe('createApplicationConfigurationFromObject', () => {
    context('when passing no configuration', () => {
      let createdConfiguration;

      before(() => {
        createdConfiguration = createApplicationConfigurationFromObject();
      });

      it('should a configuration without option', () => {
        expect(createdConfiguration).toMatchInlineSnapshot(`
JDLApplicationConfiguration {
  "options": Object {},
}
`);
      });
    });
    context('when passing a configuration', () => {
      context('containing a string option', () => {
        let createdConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject({
            [OptionNames.BASE_NAME]: 'application',
          });
        });

        it('should create it', () => {
          expect(createdConfiguration).toMatchInlineSnapshot(`
JDLApplicationConfiguration {
  "options": Object {
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
      context('containing a integer option', () => {
        let createdConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject({
            [OptionNames.SERVER_PORT]: 8042,
          });
        });

        it('should create it', () => {
          expect(createdConfiguration).toMatchInlineSnapshot(`
JDLApplicationConfiguration {
  "options": Object {
    "serverPort": IntegerJDLApplicationConfigurationOption {
      "name": "serverPort",
      "value": 8042,
    },
  },
}
`);
        });
      });
      context('containing a boolean option', () => {
        let createdConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject({
            [OptionNames.ENABLE_TRANSLATION]: true,
          });
        });

        it('should create it', () => {
          expect(createdConfiguration).toMatchInlineSnapshot(`
JDLApplicationConfiguration {
  "options": Object {
    "enableTranslation": BooleanJDLApplicationConfigurationOption {
      "name": "enableTranslation",
      "value": true,
    },
  },
}
`);
        });
      });
      context('containing a list-based option', () => {
        let createdConfiguration;

        before(() => {
          createdConfiguration = createApplicationConfigurationFromObject({
            [OptionNames.TEST_FRAMEWORKS]: [],
          });
        });

        it('should create it', () => {
          expect(createdConfiguration).toMatchInlineSnapshot(`
JDLApplicationConfiguration {
  "options": Object {
    "testFrameworks": ListJDLApplicationConfigurationOption {
      "name": "testFrameworks",
      "value": Set {},
    },
  },
}
`);
        });
      });
    });
  });
});
