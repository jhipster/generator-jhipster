import { basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import { before, it, describe, expect } from 'esmocha';
import lodash from 'lodash';

import { shouldSupportFeatures, testBlueprintSupport } from '../../test/support/tests.js';
import Generator from './index.js';
import { defaultHelpers as helpers, result } from '../../testing/index.js';

import { GENERATOR_JAVA } from '../generator-list.js';

const { snakeCase } = lodash;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generator = basename(__dirname);

describe(`generator - ${generator}`, () => {
  it('generator-list constant matches folder name', async () => {
    await expect((await import('../generator-list.js'))[`GENERATOR_${snakeCase(generator).toUpperCase()}`]).toBe(generator);
  });
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with default config', () => {
    before(async () => {
      await helpers.runJHipster(GENERATOR_JAVA).withJHipsterConfig({}, [
        {
          name: 'Foo',
          fields: [
            { fieldName: 'name', documentation: 'My Name', fieldType: 'String', fieldValidateRules: ['required'] },
            { fieldName: 'myEnum', fieldType: 'MyEnum', fieldValues: 'FRENCH,ENGLISH', fieldTypeDocumentation: 'Enum Doc' },
          ],
        },
        {
          name: 'Bar',
          documentation: 'Custom Bar',
          fields: [{ fieldName: 'name2', fieldType: 'String', fieldValidateRules: ['required'] }],
        },
      ]);
    });

    it('should match files snapshot', () => {
      expect(result.getStateSnapshot()).toMatchSnapshot();
    });

    it('should generate entities containing jakarta', () => {
      result.assertFileContent('src/main/java/com/mycompany/myapp/domain/Foo.java', 'jakarta');
    });

    it('should generate javadocs', () => {
      result.assertFileContent('src/main/java/com/mycompany/myapp/domain/Foo.java', '* A Foo');
      result.assertFileContent('src/main/java/com/mycompany/myapp/domain/Foo.java', '* My Name');
      result.assertFileContent('src/main/java/com/mycompany/myapp/domain/Bar.java', '* Custom Bar');
    });

    it('should generate openapi @Schema', () => {
      result.assertFileContent('src/main/java/com/mycompany/myapp/domain/Bar.java', '@Schema(description = "Custom Bar")');
    });

    it('should write enum files', () => {
      result.assertFile('src/main/java/com/mycompany/myapp/domain/enumeration/MyEnum.java');
      expect(Object.keys(result.getStateSnapshot('**/enumeration/**')).length).toBe(2);
    });

    it('should generate enum javadoc', () => {
      result.assertFileContent('src/main/java/com/mycompany/myapp/domain/enumeration/MyEnum.java', '* Enum Doc');
    });

    it('should have options defaults set', () => {
      expect(result.generator.generateEntities).toBe(true);
      expect(result.generator.generateEnums).toBe(true);
      expect(result.generator.useJakartaValidation).toBe(true);
    });
  });

  it('packageName with reserved keyword', async () => {
    await expect(helpers.runJHipster(GENERATOR_JAVA).withJHipsterConfig({ packageName: 'com.public.myapp' })).rejects.toThrow(
      'The package name "com.public.myapp" contains a reserved Java keyword "public".',
    );
  });

  describe('with jakarta and enums disabled', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_JAVA)
        .withJHipsterConfig({}, [
          {
            name: 'Foo',
            fields: [
              { fieldName: 'name', fieldType: 'String', fieldValidateRules: ['required'] },
              { fieldName: 'myEnum', fieldType: 'MyEnum', fieldValues: 'FRENCH,ENGLISH' },
            ],
          },
        ])
        .withOptions({ useJakartaValidation: false, generateEnums: false });
    });

    it('should generate entities not containing jakarta', () => {
      result.assertNoFileContent('src/main/java/com/mycompany/myapp/domain/Foo.java', 'jakarta');
    });

    it('should not write enum files', () => {
      expect(Object.keys(result.getStateSnapshot('**/enumeration/**')).length).toBe(0);
    });
  });

  describe('with entities disabled', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_JAVA)
        .withJHipsterConfig({}, [
          {
            name: 'Foo',
            fields: [
              { fieldName: 'name', fieldType: 'String', fieldValidateRules: ['required'] },
              { fieldName: 'myEnum', fieldType: 'MyEnum', fieldValues: 'FRENCH,ENGLISH' },
            ],
          },
        ])
        .withOptions({ generateEntities: false });
    });

    it('should not contain jakarta', () => {
      result.assertNoFile('src/main/java/com/mycompany/myapp/domain/Foo.java');
    });
  });

  describe('with custom properties values', () => {
    before(async () => {
      await helpers
        .runJHipster(GENERATOR_JAVA)
        .withJHipsterConfig({})
        .onGenerator(generator => {
          generator.generateEntities = false;
          generator.generateEnums = false;
          generator.useJakartaValidation = false;
        });
    });

    it('should not override custom values', () => {
      expect(result.generator.generateEntities).toBe(false);
      expect(result.generator.generateEnums).toBe(false);
      expect(result.generator.useJakartaValidation).toBe(false);
    });
  });
});
