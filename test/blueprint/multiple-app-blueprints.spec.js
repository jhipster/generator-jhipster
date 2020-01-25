/* eslint-disable max-classes-per-file */
const path = require('path');
const helpers = require('yeoman-test');
const sinon = require('sinon');
const AppGenerator = require('../../generators/app');
const ClientGenerator = require('../../generators/client');
const ServerGenerator = require('../../generators/server');
const CommonGenerator = require('../../generators/common');
const LanguagesGenerator = require('../../generators/languages');

const createMockBlueprint = function(parent, spy) {
    return class extends parent {
        constructor(args, opts) {
            super(args, { ...opts, fromBlueprint: true }); // fromBlueprint variable is important
        }

        spy() {
            spy();
        }
    };
};

const mockAppBlueprintSubGen = class extends AppGenerator {
    constructor(args, opts) {
        super(args, { ...opts, fromBlueprint: true }); // fromBlueprint variable is important
    }

    get initializing() {
        // Here we are not overriding this phase and hence its being handled by JHipster
        return super._initializing();
    }

    get writing() {
        return super._writing();
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

const options = {
    'from-cli': true,
    skipInstall: true,
    skipChecks: true,
    blueprints: 'my-blueprint'
};

const prompts = {
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
};

describe('JHipster with app blueprints', () => {
    describe('1 app blueprint', () => {
        before(done => {
            this.spyClient1 = sinon.spy();
            this.spyServer1 = sinon.spy();
            this.spyLanguages1 = sinon.spy();
            this.spyCommon1 = sinon.spy();
            helpers
                .run(path.join(__dirname, '../../generators/app'))
                .withOptions(options)
                .withGenerators([
                    [createMockBlueprint(ClientGenerator, this.spyClient1), 'jhipster-my-blueprint:client'],
                    [createMockBlueprint(ServerGenerator, this.spyServer1), 'jhipster-my-blueprint:server'],
                    [createMockBlueprint(LanguagesGenerator, this.spyLanguages1), 'jhipster-my-blueprint:languages'],
                    [createMockBlueprint(CommonGenerator, this.spyCommon1), 'jhipster-my-blueprint:common'],
                    [mockAppBlueprintSubGen, 'jhipster-my-blueprint:app']
                ])
                .withPrompts(prompts)
                .on('end', done);
        });

        it('every sub-generator must be called once', () => {
            sinon.assert.calledOnce(this.spyClient1);
            sinon.assert.calledOnce(this.spyServer1);
            sinon.assert.calledOnce(this.spyCommon1);
            sinon.assert.calledOnce(this.spyLanguages1);
        });
    });
});
