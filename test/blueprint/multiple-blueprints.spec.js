/* eslint-disable max-classes-per-file */
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const expectedFiles = require('../utils/expected-files');
const ClientGenerator = require('../../generators/client');
const ServerGenerator = require('../../generators/server');

const mockClientBlueprintSubGen = class extends ClientGenerator {
    constructor(args, opts) {
        super(args, { ...opts, fromBlueprint: true }); // fromBlueprint variable is important
    }

    get initializing() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._initializing();
    }

    get prompting() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._prompting();
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const customPhaseSteps = {
            addDummyProperty() {
                this.addNpmDependency('dummy-blueprint-property', '2.0');
            }
        };
        return {
            ...phaseFromJHipster,
            ...customPhaseSteps
        };
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};

const mockServerBlueprintSubGen = class extends ServerGenerator {
    constructor(args, opts) {
        super(args, { ...opts, fromBlueprint: true }); // fromBlueprint variable is important
    }

    get initializing() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._initializing();
    }

    get writing() {
        const phaseFromJHipster = super._writing();
        const customPhaseSteps = {
            addDummyProperty() {
                this.addMavenProperty('dummy-blueprint-property', 'foo');
            }
        };
        return {
            ...phaseFromJHipster,
            ...customPhaseSteps
        };
    }

    get prompting() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._prompting();
    }

    get configuring() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._configuring();
    }

    get default() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._default();
    }

    get install() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._install();
    }

    get end() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._end();
    }
};

describe('JHipster entity generator with multiple blueprints', () => {
    const blueprintNames = [
        'generator-jhipster-my-client-blueprint,generator-jhipster-my-server-blueprint',
        'my-client-blueprint,my-server-blueprint'
    ];

    blueprintNames.forEach(blueprints => {
        describe(`generate entity with multiple blueprints option '${blueprints}'`, () => {
            before(done => {
                helpers
                    .run(path.join(__dirname, '../../generators/app'))
                    .withOptions({
                        'from-cli': true,
                        skipInstall: true,
                        skipChecks: true,
                        blueprints
                    })
                    .withGenerators([
                        [mockClientBlueprintSubGen, 'jhipster-my-client-blueprint:client'],
                        [mockServerBlueprintSubGen, 'jhipster-my-server-blueprint:server']
                    ])
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

            it('creates expected files from jhipster app generator', () => {
                assert.file(expectedFiles.common);
                assert.file(expectedFiles.server);
                assert.file(expectedFiles.maven);
                assert.file(expectedFiles.client);
            });

            it('contains the specific change added by the client blueprint', () => {
                assert.fileContent('package.json', /dummy-blueprint-property/);
            });

            it('contains the specific change added by the server blueprint', () => {
                assert.fileContent('pom.xml', /dummy-blueprint-property/);
            });
        });
    });
});
