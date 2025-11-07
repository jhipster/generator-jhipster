import { before, describe, expect, it } from 'esmocha';
import { basename, resolve } from 'node:path';

import { defaultHelpers as helpers, result } from '../../../../lib/testing/index.ts';
import { shouldSupportFeatures, testBlueprintSupport } from '../../../../test/support/tests.js';

import Generator from './index.ts';

const generator = `${basename(resolve(import.meta.dirname, '../../'))}:${basename(import.meta.dirname)}`;

describe(`generator - ${generator}`, () => {
  shouldSupportFeatures(Generator);
  describe('blueprint support', () => testBlueprintSupport(generator));

  describe('with default config', () => {
    before(async () => {
      await helpers.runJHipster(generator).withJHipsterConfig({}, [
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
      expect(Object.keys(result.getStateSnapshot('**/enumeration/**')).length).toBe(1);
    });

    it('should generate enum javadoc', () => {
      result.assertFileContent('src/main/java/com/mycompany/myapp/domain/enumeration/MyEnum.java', '* Enum Doc');
    });

    it('should have options defaults set', () => {
      const generator: any = result.generator;
      expect(generator.generateEntities).toBe(true);
      expect(generator.generateEnums).toBe(true);
      expect(generator.useJakartaValidation).toBe(true);
    });
  });

  describe('with jakarta and enums disabled', () => {
    before(async () => {
      await helpers
        .runJHipster(generator)
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
        .runJHipster(generator)
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
        .runJHipster(generator)
        .withJHipsterConfig({})
        .onGenerator((generator: any) => {
          generator.generateEntities = false;
          generator.generateEnums = false;
          generator.useJakartaValidation = false;
        });
    });

    it('should not override custom values', () => {
      const generator: any = result.generator;
      expect(generator.generateEntities).toBe(false);
      expect(generator.generateEnums).toBe(false);
      expect(generator.useJakartaValidation).toBe(false);
    });
  });
});
