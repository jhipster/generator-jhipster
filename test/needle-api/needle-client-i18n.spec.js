const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const LanguagesGenerator = require('../../generators/languages');
const constants = require('../../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends LanguagesGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important

        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);

        if (!jhContext) {
            this.error('This is a JHipster blueprint and should be used only like jhipster --blueprint myblueprint');
        }

        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupEntityOptions(this, jhContext, this);
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
                this.addElementTranslationKey('my_key', 'My value', 'en');
                this.addElementTranslationKey('ma_cle', 'Ma valeur', 'fr');
            },
            addAdminElementTranslationKey() {
                this.addAdminElementTranslationKey('my_admin_key', 'my admin value', 'en');
                this.addAdminElementTranslationKey('ma_cle_admin', 'ma valeur admin', 'fr');
            },
            addEntityTranslationKey() {
                this.addEntityTranslationKey('my_entity_key', 'my entity value', 'en');
                this.addEntityTranslationKey('ma_cle_entite', 'ma valeur entite', 'fr');
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
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
                'from-cli': true,
                build: 'maven',
                auth: 'jwt',
                db: 'mysql',
                skipInstall: true,
                blueprint: 'myblueprint',
                skipChecks: true
            })
            .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:languages']])
            .withPrompts({
                baseName: 'jhipster',
                clientFramework: 'angularX',
                enableTranslation: true,
                nativeLanguage: 'en',
                languages: ['en', 'fr']
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
