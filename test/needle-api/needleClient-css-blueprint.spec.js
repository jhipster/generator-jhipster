const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const ClientGenerator = require('../../generators/client');
const constants = require('../../generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;

const mockBlueprintSubGen = class extends ClientGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
        if (!jhContext) {
            this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprint myblueprint')}");
        }
        this.configOptions = jhContext.configOptions || {};
        // This sets up options for this sub generator and is being reused from JHipster
        jhContext.setupClientOptions(this, jhContext);
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
            addCssStylesProperty() {
                this.addMainSCSSStyle('@import style', 'my comment');
                this.addVendorSCSSStyle('@import style', 'my comment');
                this.addMainCSSStyle('h1 { font-size: 200%; color: navy; }', 'my comment');
            }
        };
        return { ...phaseFromJHipster, ...customPhaseSteps };
    }

    get install() {
        return super._install();
    }

    get end() {
        return super._end();
    }
};

describe('JHipster client generator with blueprint and needle API SCSS', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate client with blueprint option '${blueprintName}'`, () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/client'))
                    .withOptions({
                        'from-cli': true,
                        build: 'maven',
                        auth: 'jwt',
                        db: 'mysql',
                        skipInstall: true,
                        blueprint: blueprintName,
                        skipChecks: true
                    })
                    .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: 'angularX',
                        useSass: true,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr']
                    })
                    .on('end', done);
            });

            it('vendor.scss contains the specific change added by needle api', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`, /@import style/);
                assert.fileContent(
                    `${CLIENT_MAIN_SRC_DIR}content/scss/vendor.scss`,
                    '* ==========================================================================\n' +
                        'my comment\n' +
                        '========================================================================== */\n'
                );
            });

            it('global.scss contains the specific change added by needle api', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`, /@import style/);
                assert.fileContent(
                    `${CLIENT_MAIN_SRC_DIR}content/scss/global.scss`,
                    '* ==========================================================================\n' +
                        'my comment\n' +
                        '========================================================================== */\n'
                );
            });
        });
    });
});

describe('JHipster client generator with blueprint and needle API CSS', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate client with blueprint option '${blueprintName}'`, () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/client'))
                    .withOptions({
                        'from-cli': true,
                        build: 'maven',
                        auth: 'jwt',
                        db: 'mysql',
                        skipInstall: true,
                        blueprint: blueprintName,
                        skipChecks: true
                    })
                    .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: 'angularX',
                        useSass: false,
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr']
                    })
                    .on('end', done);
            });

            it('global.css contains the specific change added by needle api', () => {
                assert.fileContent(`${CLIENT_MAIN_SRC_DIR}content/css/global.css`, /h1 { font-size: 200%; color: navy; }/);
                assert.fileContent(
                    `${CLIENT_MAIN_SRC_DIR}content/css/global.css`,
                    '* ==========================================================================\n' +
                        'my comment\n' +
                        '========================================================================== */\n'
                );
            });
        });
    });
});
