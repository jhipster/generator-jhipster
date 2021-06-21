const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const expect = require('expect');

const basePackage = 'src/main/java/com/mycompany/myapp';

describe('JHipster OpenAPI Client Sub Generator', () => {
  //--------------------------------------------------
  // Spring Cloud Client tests
  //--------------------------------------------------
  describe('Spring: microservice petstore custom endpoint ', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create(require.resolve('../generators/openapi-client'))
        .inTmpDir(dir => {
          fse.copySync(path.join(__dirname, './templates/openapi-client/microservice-simple'), dir);
          fse.copySync(path.join(__dirname, './templates/openapi-client'), dir);
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
        .create(require.resolve('../generators/openapi-client'))
        .inTmpDir(dir => {
          fse.copySync(path.join(__dirname, './templates/openapi-client/microservice-with-client'), dir);
          fse.copySync(path.join(__dirname, './templates/openapi-client'), dir);
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
