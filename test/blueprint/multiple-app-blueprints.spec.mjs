/* eslint-disable max-classes-per-file */
import helpers from 'yeoman-test';
import sinon from 'sinon';

import AppGenerator from '../../generators/app/index.mjs';
import ClientGenerator from '../../generators/client/index.mjs';
import ServerGenerator from '../../generators/server/index.mjs';
import CommonGenerator from '../../generators/common/index.mjs';
import LanguagesGenerator from '../../generators/languages/index.mjs';
import databaseTypes from '../../jdl/jhipster/database-types';
import clientFrameworkTypes from '../../jdl/jhipster/client-framework-types';
import authenticationTypes from '../../jdl/jhipster/authentication-types';
import cacheTypes from '../../jdl/jhipster/cache-types';
import testSupport from '../support/index.cjs';

const { getGenerator } = testSupport;

const { MYSQL, SQL, H2_MEMORY } = databaseTypes;
const { ANGULAR } = clientFrameworkTypes;
const { JWT } = authenticationTypes;
const { EHCACHE } = cacheTypes;

const generatorPath = getGenerator('app');

const createMockBlueprint = function (parent, spy) {
  return class extends parent {
    [parent.INITIALIZING]() {
      spy();
    }
  };
};

const mockAppBlueprintSubGen = class extends AppGenerator {
  get [AppGenerator.INITIALIZING]() {
    return super._initializing();
  }

  get [AppGenerator.PROMPTING]() {
    return super._prompting();
  }

  get [AppGenerator.CONFIGURING]() {
    return super._configuring();
  }

  get [AppGenerator.COMPOSING]() {
    return super._composing();
  }

  get [AppGenerator.LOADING]() {
    return super._loading();
  }

  get [AppGenerator.PREPARING]() {
    return super._preparing();
  }

  get [AppGenerator.DEFAULT]() {
    return super._default();
  }

  get [AppGenerator.POST_WRITING]() {
    return super._postWriting();
  }

  get [AppGenerator.INSTALL]() {
    return super._install();
  }

  get [AppGenerator.POST_INSTALL]() {
    return super._postInstall();
  }

  get [AppGenerator.END]() {
    return super._end();
  }
};

const options = {
  fromCli: true,
  skipInstall: true,
  skipChecks: true,
  blueprints: 'my-blueprint',
};

const prompts = {
  baseName: 'jhipster',
  clientFramework: ANGULAR,
  packageName: 'com.mycompany.myapp',
  packageFolder: 'com/mycompany/myapp',
  serviceDiscoveryType: false,
  authenticationType: JWT,
  cacheProvider: EHCACHE,
  enableHibernateCache: true,
  databaseType: SQL,
  devDatabaseType: H2_MEMORY,
  prodDatabaseType: MYSQL,
  enableTranslation: true,
  nativeLanguage: 'en',
  languages: ['fr'],
};

describe('JHipster with app blueprints', () => {
  describe('1 app blueprint', () => {
    let spyClient1;
    let spyServer1;
    let spyLanguages1;
    let spyCommon1;

    before(async () => {
      spyClient1 = sinon.spy();
      spyServer1 = sinon.spy();
      spyLanguages1 = sinon.spy();
      spyCommon1 = sinon.spy();
      await helpers
        .run(generatorPath)
        .withOptions(options)
        .withGenerators([
          [createMockBlueprint(ClientGenerator, spyClient1), 'jhipster-my-blueprint:client'],
          [createMockBlueprint(ServerGenerator, spyServer1), 'jhipster-my-blueprint:server'],
          [createMockBlueprint(LanguagesGenerator, spyLanguages1), 'jhipster-my-blueprint:languages'],
          [createMockBlueprint(CommonGenerator, spyCommon1), 'jhipster-my-blueprint:common'],
          [mockAppBlueprintSubGen, 'jhipster-my-blueprint:app'],
        ])
        .withPrompts(prompts);
    });

    it('every sub-generator must be called once', () => {
      sinon.assert.calledOnce(spyClient1);
      sinon.assert.calledOnce(spyServer1);
      sinon.assert.calledOnce(spyCommon1);
      sinon.assert.calledOnce(spyLanguages1);
    });
  });

  describe('2 app blueprint', () => {
    let spyClient1;
    let spyServer1;
    let spyLanguages1;
    let spyCommon1;

    let spyClient2;
    let spyServer2;
    let spyLanguages2;
    let spyCommon2;

    before(async () => {
      spyClient1 = sinon.spy();
      spyServer1 = sinon.spy();
      spyLanguages1 = sinon.spy();
      spyCommon1 = sinon.spy();

      spyClient2 = sinon.spy();
      spyServer2 = sinon.spy();
      spyLanguages2 = sinon.spy();
      spyCommon2 = sinon.spy();

      await helpers
        .run(generatorPath)
        .withOptions({ ...options, blueprints: 'my-blueprint,my-blueprint-2' })
        .withGenerators([
          [createMockBlueprint(ClientGenerator, spyClient1), 'jhipster-my-blueprint:client'],
          [createMockBlueprint(ServerGenerator, spyServer1), 'jhipster-my-blueprint:server'],
          [createMockBlueprint(LanguagesGenerator, spyLanguages1), 'jhipster-my-blueprint:languages'],
          [createMockBlueprint(CommonGenerator, spyCommon1), 'jhipster-my-blueprint:common'],
          [mockAppBlueprintSubGen, 'jhipster-my-blueprint:app'],
          [createMockBlueprint(ClientGenerator, spyClient2), 'jhipster-my-blueprint-2:client'],
          [createMockBlueprint(ServerGenerator, spyServer2), 'jhipster-my-blueprint-2:server'],
          [createMockBlueprint(LanguagesGenerator, spyLanguages2), 'jhipster-my-blueprint-2:languages'],
          [createMockBlueprint(CommonGenerator, spyCommon2), 'jhipster-my-blueprint-2:common'],
          [mockAppBlueprintSubGen, 'jhipster-my-blueprint-2:app'],
        ])
        .withPrompts(prompts);
    });

    it('every sub-generator must be called once', () => {
      sinon.assert.calledOnce(spyClient1);
      sinon.assert.calledOnce(spyServer1);
      sinon.assert.calledOnce(spyCommon1);
      sinon.assert.calledOnce(spyLanguages1);

      sinon.assert.calledOnce(spyClient2);
      sinon.assert.calledOnce(spyServer2);
      sinon.assert.calledOnce(spyCommon2);
      sinon.assert.calledOnce(spyLanguages2);
    });
  });

  describe('3 app blueprint', () => {
    let spyClient1;
    let spyServer1;
    let spyLanguages1;
    let spyCommon1;

    let spyClient2;
    let spyServer2;
    let spyLanguages2;
    let spyCommon2;

    before(async () => {
      spyClient1 = sinon.spy();
      spyServer1 = sinon.spy();
      spyLanguages1 = sinon.spy();
      spyCommon1 = sinon.spy();

      spyClient2 = sinon.spy();
      spyServer2 = sinon.spy();
      spyLanguages2 = sinon.spy();
      spyCommon2 = sinon.spy();

      await helpers
        .run(generatorPath)
        .withOptions({ ...options, blueprints: 'my-blueprint,my-blueprint-2,my-blueprint-3' })
        .withGenerators([
          [createMockBlueprint(ClientGenerator, spyClient1), 'jhipster-my-blueprint:client'],
          [createMockBlueprint(ServerGenerator, spyServer1), 'jhipster-my-blueprint:server'],
          [createMockBlueprint(LanguagesGenerator, spyLanguages1), 'jhipster-my-blueprint:languages'],
          [createMockBlueprint(CommonGenerator, spyCommon1), 'jhipster-my-blueprint:common'],
          [mockAppBlueprintSubGen, 'jhipster-my-blueprint:app'],
          [createMockBlueprint(ClientGenerator, spyClient2), 'jhipster-my-blueprint-2:client'],
          [createMockBlueprint(ServerGenerator, spyServer2), 'jhipster-my-blueprint-2:server'],
          [createMockBlueprint(LanguagesGenerator, spyLanguages2), 'jhipster-my-blueprint-2:languages'],
          [createMockBlueprint(CommonGenerator, spyCommon2), 'jhipster-my-blueprint-2:common'],
          [mockAppBlueprintSubGen, 'jhipster-my-blueprint-2:app'],
          [mockAppBlueprintSubGen, 'jhipster-my-blueprint-3:app'],
        ])
        .withPrompts(prompts);
    });

    it('every sub-generator must be called once', () => {
      sinon.assert.calledOnce(spyClient1);
      sinon.assert.calledOnce(spyServer1);
      sinon.assert.calledOnce(spyCommon1);
      sinon.assert.calledOnce(spyLanguages1);

      sinon.assert.calledOnce(spyClient2);
      sinon.assert.calledOnce(spyServer2);
      sinon.assert.calledOnce(spyCommon2);
      sinon.assert.calledOnce(spyLanguages2);
    });
  });
});
