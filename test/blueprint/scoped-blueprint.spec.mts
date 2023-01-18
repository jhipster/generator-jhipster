import { jestExpect as expect } from 'mocha-expect-snapshot';
import path from 'path';
import assert from 'yeoman-assert';
import helpers from 'yeoman-test';
import fse from 'fs-extra';

import EnvironmentBuilder from '../../cli/environment-builder.mjs';
import { getTemplatePath } from '../support/index.mjs';

describe('generator - app - with scoped blueprint', () => {
  describe('generate monolith application with scoped blueprint', () => {
    let runResult;
    before(async () => {
      runResult = await helpers
        .create('jhipster:app', {}, { createEnv: EnvironmentBuilder.createEnv })
        .inTmpDir(dir => {
          // Fake the presence of the blueprint in node_modules
          const fakeBlueprintModuleDir = path.join(dir, 'node_modules/@jhipster/generator-jhipster-scoped-blueprint');
          fse.ensureDirSync(fakeBlueprintModuleDir);
          fse.copySync(getTemplatePath('blueprints/fake-blueprint'), fakeBlueprintModuleDir);
        })
        .withOptions({
          skipInstall: true,
          skipChecks: true,
          blueprints: '@jhipster/generator-jhipster-scoped-blueprint',
          baseName: 'jhipster',
          defaults: true,
        })
        .run();
    });

    it('creates expected default files for server and angular', () => {
      expect(runResult.getStateSnapshot()).toMatchSnapshot();
    });

    it('blueprint version is saved in .yo-rc.json', () => {
      assert.JSONFileContent('.yo-rc.json', {
        'generator-jhipster': { blueprints: [{ name: '@jhipster/generator-jhipster-scoped-blueprint', version: '9.9.9' }] },
      });
    });
    it('blueprint module and version are in package.json', () => {
      assert.fileContent('package.json', /"@jhipster\/generator-jhipster-scoped-blueprint": "9.9.9"/);
    });
  });
});
