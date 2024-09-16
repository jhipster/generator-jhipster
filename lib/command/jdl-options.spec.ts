import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../jdl/jdl-importer.js';
import { createImporterFromContent } from '../jdl/jdl-importer.js';
import { lookupCommandsConfigs } from './lookup-commands-configs.js';

const jhipsterConfigsWithJDL = await lookupCommandsConfigs({ filter: config => Boolean(config.jdl) });

describe('jdl options', () => {
  const jdlConfigs = Object.entries(jhipsterConfigsWithJDL!);

  it('jdl configs names should match snapshot', () => {
    expect(jdlConfigs.map(([name]) => name)).toMatchInlineSnapshot(`
[
  "feignClient",
  "syncUserWithIdp",
  "messageBroker",
  "databaseMigration",
  "incrementalChangelog",
  "routes",
]
`);
  });

  for (const [optionName, config] of jdlConfigs) {
    let choices: any[] | undefined = config.choices?.map(choice => (typeof choice === 'string' ? choice : choice.value));
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

    describe(`generators - server - jdl - ${optionName}`, function () {
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
