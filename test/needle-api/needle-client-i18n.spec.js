const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const LanguagesGenerator = require('../../generators/languages');
const constants = require('../../generators/generator-constants');

const ANGULAR = constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends LanguagesGenerator {
  constructor(args, opts) {
    super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

    const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

    if (!jhContext) {
      this.error('This is a JHipster blueprint and should be used only like jhipster --blueprints myblueprint');
    }

    this.configOptions = jhContext.configOptions || {};
  }

  get initializing() {
    return super._initializing();
  }

  get prompting() {
    return super._prompting();
  }

  get configuring() {
    return super._configuring();
  }

  get default() {
    return super._default();
  }

  get writing() {
    const phaseFromJHipster = super._writing();
    const customPhaseSteps = {
      addElementInTranslation() {
        this.addElementTranslationKey('my_key', 'My Value', 'en');
        this.addElementTranslationKey('ma_cle', 'Ma Valeur', 'fr');
      },
      addAdminElementTranslationKey() {
        this.addAdminElementTranslationKey('my_admin_key', 'My Admin Value', 'en');
        this.addAdminElementTranslationKey('ma_cle_admin', 'Ma Valeur Admin', 'fr');
      },
      addEntityTranslationKey() {
        this.addEntityTranslationKey('my_entity_key', 'My Entity Value', 'en');
        this.addEntityTranslationKey('ma_cle_entite', 'Ma Valeur Entite', 'fr');
      },
    };
    return { ...phaseFromJHipster, ...customPhaseSteps };
  }

  get postWriting() {
    return super._postWriting();
  }
};

describe('needle API i18n: JHipster language generator with blueprint', () => {
  before(done => {
    helpers
      .run(path.join(__dirname, '../../generators/languages'))
      .inTmpDir(dir => {
        fse.copySync(path.join(__dirname, '../../test/templates/ngx-blueprint'), dir);
      })
      .withOptions({
        fromCli: true,
        build: 'maven',
        auth: 'jwt',
        db: 'mysql',
        skipInstall: true,
        blueprint: 'myblueprint',
        skipChecks: true,
      })
      .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:languages']])
      .withPrompts({
        baseName: 'jhipster',
        clientFramework: ANGULAR,
        enableTranslation: true,
        nativeLanguage: 'en',
        languages: ['en', 'fr'],
      })
      .on('end', done);
  });

  it('Assert english global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, '"my_key": "My Value",');
  });

  it('Assert french global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`, '"ma_cle": "Ma Valeur",');
  });

  it('Assert english admin global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, '"my_admin_key": "My Admin Value",');
  });

  it('Assert french admin global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`, '"ma_cle_admin": "Ma Valeur Admin",');
  });

  it('Assert english entity global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`, '"my_entity_key": "My Entity Value",');
  });

  it('Assert french entity global.json contain the new key', () => {
    assert.fileContent(`${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`, '"ma_cle_entite": "Ma Valeur Entite",');
  });
});
