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
import { getDefaultRuntime } from '../jdl-config/jdl-runtime.ts';
import { getDefaultJDLApplicationConfig } from '../jdl-config/jhipster-jdl-config.ts';
import { parse } from '../jdl-parser/index.ts';

import { lookupCommandsConfigs } from './lookup-commands-configs.ts';

// Only the application definitions: the round-trip below goes through `application { config { … } }`, where the
// deployment options - declared by the generators `deployment` imports - are not valid.
const applicationJdlOptions = Object.keys(getDefaultJDLApplicationConfig().optionsTypes);
const jhipsterConfigsWithJDL = Object.fromEntries(
  Object.entries(lookupCommandsConfigs({ filter: config => Boolean(config.jdl) })).filter(([name]) => applicationJdlOptions.includes(name)),
);

describe('jdl options', () => {
  const jdlConfigs = Object.entries(jhipsterConfigsWithJDL);

  it('jdl configs names should match snapshot', () => {
    expect(jdlConfigs.map(([name]) => name)).toMatchInlineSnapshot(`
[
  "jhipsterVersion",
  "jhiPrefix",
  "entitySuffix",
  "dtoSuffix",
  "testFrameworks",
  "serviceDiscoveryType",
  "blueprints",
  "nodePackageManager",
  "creationTimestamp",
  "blueprint",
  "removeNeedles",
  "buildTool",
  "clientFramework",
  "clientBundler",
  "microfrontend",
  "microfrontends",
  "clientTestFramework",
  "withAdminUi",
  "clientTheme",
  "clientThemeVariant",
  "skipClient",
  "skipServer",
  "authenticationType",
  "skipUserManagement",
  "applicationType",
  "serverPort",
  "gatewayServerPort",
  "jwtSecretKey",
  "enableGradleDevelocity",
  "gradleDevelocityHost",
  "packageName",
  "graalvmSupport",
  "languages",
  "enableTranslation",
  "nativeLanguage",
  "incrementalChangelog",
  "baseName",
  "enableSwaggerCodegen",
  "searchEngine",
  "websocket",
  "databaseType",
  "devDatabaseType",
  "prodDatabaseType",
  "cacheProvider",
  "enableHibernateCache",
  "reactive",
  "rememberMeKey",
  "feignClient",
  "syncUserWithIdp",
  "databaseMigration",
  "messageBroker",
  "routes",
]
`);
  });

  // Options without enumerable choices (free-form names / lists); manually tested elsewhere.
  const freeFormOptions = [
    'routes',
    'clientTheme',
    'microfrontends',
    'languages',
    'nativeLanguage',
    'nodePackageManager',
    'packageName',
    'creationTimestamp',
    'websocket',
    'rememberMeKey',
    'gradleDevelocityHost',
    'jhiPrefix',
    'entitySuffix',
    'dtoSuffix',
    'testFrameworks',
    'gatewayServerPort',
    'serverPort',
    'jwtSecretKey',
    'baseName',
    'blueprints',
    'blueprint',
    'jhipsterVersion',
  ];

  const getChoices = (config: (typeof jdlConfigs)[number][1]): (string | boolean)[] | undefined => {
    const choices = config.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value));
    return !choices && config.cli?.type === Boolean ? [true, false] : choices;
  };

  // A throw while registering the describes would silently truncate the suite, assert the free-form list instead.
  it('should have choices for every jdl option not listed as free-form', () => {
    const optionsWithoutChoices = jdlConfigs.filter(([_optionName, config]) => !getChoices(config)).map(([optionName]) => optionName);
    expect(optionsWithoutChoices.filter(optionName => !freeFormOptions.includes(optionName))).toEqual([]);
    expect(freeFormOptions.filter(optionName => !optionsWithoutChoices.includes(optionName))).toEqual([]);
  });

  for (const [optionName, config] of jdlConfigs) {
    const choices = getChoices(config);
    const isBoolean = config.cli?.type === Boolean;
    const isArray = config.cli?.type === Array;
    if (!choices) {
      continue;
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
        it('should report an unknown choice before creating the importer', () => {
          const declaration = `${optionName} ${isArray ? '[unknown]' : 'unknown'}`;
          const content = `application { config { ${declaration} } }`;
          const message = `The '${optionName}' option is not valid for value 'unknown'.`;
          const start = content.indexOf(declaration);
          const end = start + declaration.length;
          expect(() => createImporterFromContent(content)).toThrow(new Error(`${message}\n\tat line: 1, column: ${start + 1}`));

          const { diagnostics } = parse(content, getDefaultRuntime());
          const errors = diagnostics.filter(diagnostic => diagnostic.severity === 'error');
          expect(errors).toEqual([
            {
              ruleId: 'config.value',
              severity: 'error',
              message,
              range: {
                start: { offset: start, line: 1, column: start + 1 },
                end: { offset: end, line: 1, column: end + 1 },
              },
            },
          ]);
          expect(content.slice(errors[0].range.start.offset, errors[0].range.end.offset)).toBe(declaration);
        });
      }
    });
  }
});
