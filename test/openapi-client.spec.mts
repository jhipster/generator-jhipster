import assert from 'yeoman-assert';
import fse from 'fs-extra';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { getTemplatePath, basicHelpers as helpers } from './support/index.mjs';
import { GENERATOR_OPENAPI_CLIENT } from '../generators/generator-list.mjs';

const basePackage = 'src/main/java/com/mycompany/myapp';

describe('generator - OpenAPI Client', () => {
  //--------------------------------------------------
  // Spring Cloud Client tests
  //--------------------------------------------------
  describe('Spring: microservice petstore custom endpoint ', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .createJHipster(GENERATOR_OPENAPI_CLIENT)
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('openapi-client/microservice-simple'), dir);
          fse.copySync(getTemplatePath('openapi-client'), dir);
        })
        .withAnswers({
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
        .createJHipster(GENERATOR_OPENAPI_CLIENT)
        .inTmpDir(dir => {
          fse.copySync(getTemplatePath('openapi-client/microservice-with-client'), dir);
          fse.copySync(getTemplatePath('openapi-client'), dir);
        })
        .withOptions({ regen: true })
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
