const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const ClientGenerator = require('../../generators/client');
const constants = require('../../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;
const assetFrom = 'source';
const assetTo = 'target';

const mockBlueprintSubGen = class extends ClientGenerator {
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
            webpackPhase() {
                this.copyExternalAssetsInWebpack(assetFrom, assetTo);
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
    }
};

describe('needle API Webpack: JHipster client generator with blueprint', () => {
    before(done => {
        helpers
            .run(path.join(__dirname, '../../generators/client'))
            .withOptions({
                'from-cli': true,
                build: 'maven',
                auth: 'jwt',
                db: 'mysql',
                skipInstall: true,
                blueprint: 'myblueprint',
                skipChecks: true
            })
            .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
            .withPrompts({
                baseName: 'jhipster',
                clientFramework: 'angularX',
                enableTranslation: true,
                nativeLanguage: 'en',
                languages: ['en', 'fr']
            })
            .on('end', done);
    });
    it('Assert external asset is added to webpack.common.js', () => {
        const from = `${CLIENT_MAIN_SRC_DIR}content/${assetFrom}/`;
        const to = `content/${assetTo}/`;

        assert.fileContent(`${CLIENT_WEBPACK_DIR}/webpack.common.js`, `{ from: './${from}', to: '${to}' },`);
    });
});
