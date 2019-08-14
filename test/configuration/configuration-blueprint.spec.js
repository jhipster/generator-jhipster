const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const ClientGenerator = require('../../generators/client');

const packagejs = require('../../package.json');

const mockBlueprintSubGen = class extends ClientGenerator {
    constructor(args, opts) {
        super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
        const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
        if (!jhContext) {
            this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprint myblueprint')}");
        }
        this.configOptions = jhContext.configOptions || {};

        if (this.options.blueprintName === undefined) {
            this.error('BlueprintName is not defined');
        }

        this.configuration.registerConfigs(
            {
                client: {
                    testVar: {
                        persistent: true,
                        varName: 'testVar',
                        async prompt(generator, repository) {
                            const done = generator.async();
                            const prompts = [
                                {
                                    type: 'confirm',
                                    name: 'testVar',
                                    message: 'Test var?'
                                }
                            ];

                            const answers = await generator.prompt(prompts);
                            repository.testVar = answers.testVar;
                            done();
                        }
                    }
                }
            },
            this.options.blueprintName
        );

        this.configuration.requireAllConfigs(this, 'client', this.options.blueprintName);
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
        return super._writing();
    }

    get install() {
        return super._install();
    }

    get end() {
        return super._end();
    }
};

describe('JHipster client generator with blueprint', () => {
    const blueprintNames = ['generator-jhipster-myblueprint', 'myblueprint'];

    blueprintNames.forEach(blueprintName => {
        describe(`generate client with blueprint option '${blueprintName}'`, () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/app'))
                    .withOptions({
                        'from-cli': true,
                        skipInstall: true,
                        blueprint: blueprintName,
                        testVar: true,
                        skipChecks: true,
                        'new-configuration': true,
                        'init-configuration': true
                    })
                    .withGenerators([[mockBlueprintSubGen, 'jhipster-myblueprint:client']])
                    .withPrompts({
                        baseName: 'jhipster',
                        clientFramework: 'angularX',
                        packageName: 'com.mycompany.myapp',
                        packageFolder: 'com/mycompany/myapp',
                        serviceDiscoveryType: false,
                        authenticationType: 'jwt',
                        cacheProvider: 'ehcache',
                        enableHibernateCache: true,
                        databaseType: 'sql',
                        devDatabaseType: 'h2Memory',
                        prodDatabaseType: 'mysql',
                        enableTranslation: true,
                        nativeLanguage: 'en',
                        languages: ['fr']
                    })
                    .on('end', done);
            });

            // it('contains the specific change added by the blueprint', () => {
            //    assert.fileContent('.yo-rc.json', /fail to debug/);
            // });
            it('Compare base implemented configurations', () => {
                assert.JSONFileContent('.yo-rc.json', {
                    'generator-jhipster': {
                        jhipsterVersion: packagejs.version,
                        baseName: 'jhipster'
                    }
                });
            });

            it('Compare blueprint implemented configurations', () => {
                assert.JSONFileContent('.yo-rc.json', {
                    /**
                     * Blueprints will save with config root packageName or *
                     * Ref: yeoman-generation.rootGeneratorName()
                     * New configuration is forcing generator-jhisters
                     */
                    'generator-jhipster-myblueprint': {
                        testVar: true
                    }
                });
            });
        });
    });
});
