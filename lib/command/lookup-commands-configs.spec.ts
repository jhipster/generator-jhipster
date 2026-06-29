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

import { before, describe, expect, it } from 'esmocha';

import { type ImportState, createImporterFromContent } from '../jdl/jdl-importer.ts';

import { lookupCommandsConfigs } from './lookup-commands-configs.ts';

const jhipsterConfigsWithJDL = await lookupCommandsConfigs({ filter: config => Boolean(config.jdl) });

describe('jdl options', () => {
  const jdlConfigs = Object.entries(jhipsterConfigsWithJDL);

  it('jdl configs names should match snapshot', () => {
    expect(jdlConfigs.map(([name]) => name)).toMatchInlineSnapshot(`
[
  "removeNeedles",
  "clientBundler",
  "clientTestFramework",
  "incrementalChangelog",
  "feignClient",
  "syncUserWithIdp",
  "databaseMigration",
  "graalvmSupport",
  "messageBroker",
  "routes",
]
`);
  });

  for (const [optionName, config] of jdlConfigs) {
    let choices: (string | boolean)[] | undefined = config.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value));
    const isBoolean = config.cli?.type === Boolean;
    const isArray = config.cli?.type === Array;
    if (!choices && isBoolean) {
      choices = [true, false];
    }

    if (!choices) {
      if (['routes'].includes(optionName)) {
        // Option is manually tested.
        continue;
      }
      throw new Error(`No choices found for ${optionName}`);
    }

    describe(`jdl - ${optionName}`, function () {
      choices.forEach(optionValue => {
        if (isArray) {
          optionValue = `[${optionValue}]`;
        }
        describe(`with ${optionValue} value`, () => {
          let state: ImportState;

          before(() => {
            const importer = createImporterFromContent(`application { config { ${optionName} ${optionValue} } }`);
            state = importer.import();
          });

          it('should set expected value', () => {
            expect(state.exportedApplicationsWithEntities.jhipster.config[optionName]).toBe(optionValue);
          });
        });
      });

      if (isBoolean) {
        it('should not accept unknown value when creating importer', () => {
          expect(() => createImporterFromContent(`application { config { ${optionName} unknown } }`)).toThrow(/, but found: "unknown"/);
        });
      } else {
        it('should not accept unknown value when importing', () => {
          expect(() =>
            createImporterFromContent(`application { config { ${optionName} ${isArray ? `[unknown]` : 'unknown'} } }`).import(),
          ).toThrow(/The value 'unknown' is not allowed for the option '(.*)'/);
        });
      }
    });
  }
});
