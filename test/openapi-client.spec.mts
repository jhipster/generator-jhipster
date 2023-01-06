import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import fse from 'fs-extra';
import { jestExpect as expect } from 'mocha-expect-snapshot';
import { getTemplatePath, getGenerator } from './support/index.mjs';

const basePackage = 'src/main/java/com/mycompany/myapp';

describe('generator - OpenAPI Client', () => {
  //--------------------------------------------------
  // Spring Cloud Client tests
  //--------------------------------------------------
  describe('Spring: microservice petstore custom endpoint ', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('openapi-client'))
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('openapi-client/microservice-simple'), dir);
          fse.copySync(getTemplatePath('openapi-client'), dir);
        })
        .withOptions({ skipChecks: true })
        .withPrompts({
          action: 'new',
          specOrigin: 'custom-endpoint',
          customEndpoint: 'petstore-openapi-3.yml',
          cliName: 'petstore',
        })
        .run();
    });
    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('creates .openapi-generator-ignore-file', () => {
      assert.file('.openapi-generator-ignore');
    });
  });

  describe('Spring: microservice petstore regenerate ', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(getGenerator('openapi-client'))
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('openapi-client/microservice-with-client'), dir);
          fse.copySync(getTemplatePath('openapi-client'), dir);
        })
        .withOptions({ skipChecks: true, regen: true })
        .run();
    });

    it('should match files snapshot', function () {
      expect(runResult.getSnapshot()).toMatchSnapshot();
    });
    it('has removed old client file', () => {
      assert.noFile(`${basePackage}/client/petstore/api/PetsApiClientOld.java`);
    });
  });
});
