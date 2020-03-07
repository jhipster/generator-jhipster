const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const CommonGenerator = require('../../generators/common');

describe('JHipster basic (any) generator with blueprint', () => {
    const blueprintName = 'myblueprint';
    let jhipsterGenerator;
    let fromBlueprint;

    let jhipsterSourceRoot;
    let sourceRoot;
    let sourceRootFromBlueprintedGenerator;

    let jhipsterConfig;
    let config;
    let blueprintConfig;

    const mockBlueprintSubGen = class extends CommonGenerator {
        constructor(args, opts) {
            super(args, opts);

            jhipsterGenerator = this.jhipsterGenerator;
            fromBlueprint = this.fromBlueprint;

            jhipsterSourceRoot = this.jhipsterSourceRoot();
            sourceRoot = this.sourceRoot();
            sourceRootFromBlueprintedGenerator = this.jhipsterGenerator.sourceRoot();

            jhipsterConfig = this.jhipsterConfig;
            config = this.config;
            blueprintConfig = this.blueprintConfig;
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

    describe('with blueprint option', () => {
        before(done => {
            helpers
                .run(path.join(__dirname, '../../generators/common'))
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: blueprintName,
                    skipChecks: true,
                })
                .withGenerators([[mockBlueprintSubGen, `jhipster-${blueprintName}:common`]])
                .withPrompts({
                    baseName: 'jhipster',
                })
                .on('end', done);
        });
        it('should set jhipsterGenerator', () => {
            assert(jhipsterGenerator, 'jhipsterGenerator must be set to with the original generator');
        });
        it('should set fromBlueprint to true', () => {
            assert(fromBlueprint === true, 'fromBlueprint must be set to true');
        });
        it('should set jhipsterSourceRoot with the sourceRoot from the blueprinted generator', () => {
            assert(jhipsterSourceRoot, 'jhipsterSourceRoot must be set');
            assert(jhipsterSourceRoot !== sourceRoot, 'jhipsterSourceRoot must differ from sourceRoot');
            assert.equal(jhipsterSourceRoot, sourceRootFromBlueprintedGenerator);
        });
        it('should set jhipsterConfig with generator-jhipster config', () => {
            assert(jhipsterConfig, 'jhipsterConfig must be set');
            assert.equal(jhipsterConfig.name, 'generator-jhipster');
        });
        it('should set config with generator-jhipster config', () => {
            assert(config, 'config must be set');
            assert.equal(config.name, 'generator-jhipster');
        });
        it('should set config with generator-jhipster config', () => {
            assert(config, 'config must be set');
            assert.equal(config.name, 'generator-jhipster');
        });
        it('should set blueprint with the blueprint config', () => {
            assert(blueprintConfig, 'config must be set');
            // * because the packageName cannot be discovered.
            assert.equal(blueprintConfig.name, '*');
        });
    });
});
