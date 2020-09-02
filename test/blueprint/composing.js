/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

const AppGenerator = require('../../generators/app');

const createMockedGenerators = generatorNamespace => {
    return [
        `${generatorNamespace}:common`,
        `${generatorNamespace}:server`,
        `${generatorNamespace}:client`,
        `${generatorNamespace}:languages`,
    ];
};

const createDumbBlueprint = Parent => {
    return class DumbGenerator extends Parent {
        constructor(args, opts) {
            super(args, opts);
            const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
            if (!jhContext) {
                this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprints myblueprint')}");
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
            return super._writing();
        }

        get install() {
            return super._install();
        }

        get end() {
            return super._end();
        }
    };
};

describe('composing with blueprints', () => {
    describe('when composing with multiple jhipster (app) blueprints', () => {
        describe('using mocked jhipster (app) generators', () => {
            let runResult;
            before(() => {
                return helpers
                    .create(require.resolve('../../generators/app'))
                    .withOptions({
                        baseName: 'jhipster',
                        fromCli: true,
                        skipInstall: true,
                        defaults: true,
                        blueprints: 'blueprint1,blueprint2,blueprint3',
                        skipChecks: true,
                    })
                    .withMockedGenerators(['jhipster-blueprint1:jhipster', 'jhipster-blueprint2:jhipster', 'jhipster-blueprint3:jhipster'])
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

            it('composes with mocked blueprint1:jhipster (app)', () => {
                const CommonGenerator = runResult.mockedGenerators['jhipster-blueprint1:jhipster'];
                assert(CommonGenerator.calledOnce);
            });

            it('composes with mocked blueprint2:jhipster (app)', () => {
                const CommonGenerator = runResult.mockedGenerators['jhipster-blueprint2:jhipster'];
                assert(CommonGenerator.calledOnce);
            });

            it('composes with mocked blueprint3:jhipster (app) ', () => {
                const CommonGenerator = runResult.mockedGenerators['jhipster-blueprint2:jhipster'];
                assert(CommonGenerator.calledOnce);
            });
        });
        describe('using dump jhipster (app) generators', () => {
            let runResult;
            before(() => {
                return helpers
                    .create(require.resolve('../../generators/app'))
                    .withOptions({
                        baseName: 'jhipster',
                        fromCli: true,
                        skipInstall: true,
                        defaults: true,
                        blueprints: 'blueprint1,blueprint2,blueprint3',
                        skipChecks: true,
                    })
                    .withGenerators([[createDumbBlueprint(AppGenerator), 'jhipster-myblueprint1:app']])
                    .withGenerators([[createDumbBlueprint(AppGenerator), 'jhipster-myblueprint2:app']])
                    .withGenerators([[createDumbBlueprint(AppGenerator), 'jhipster-myblueprint3:app']])
                    .withMockedGenerators([
                        ...createMockedGenerators('jhipster-blueprint1'),
                        ...createMockedGenerators('jhipster-blueprint2'),
                        ...createMockedGenerators('jhipster-blueprint3'),
                    ])
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

            ['jhipster-blueprint1', 'jhipster-blueprint2', 'jhipster-blueprint3'].forEach(ns => {
                createMockedGenerators(ns).forEach(generator => {
                    it(`composes with mocked ${generator} generator once`, () => {
                        assert(runResult.mockedGenerators[generator].calledOnce);
                    });
                });
            });
        });
    });
    describe('composing without jhipster (app) blueprint', () => {
        let runResult;
        before(() => {
            return helpers
                .create(require.resolve('../../generators/app'))
                .withOptions({
                    baseName: 'jhipster',
                    fromCli: true,
                    skipInstall: true,
                    defaults: true,
                    blueprints: 'blueprint1',
                    skipChecks: true,
                })
                .withMockedGenerators([...createMockedGenerators('jhipster-blueprint1')])
                .run()
                .then(result => {
                    runResult = result;
                });
        });

        after(() => runResult.cleanup());

        createMockedGenerators('jhipster-blueprint1').forEach(generator => {
            it(`composes with mocked ${generator} generator once`, () => {
                assert(runResult.mockedGenerators[generator].calledOnce);
            });
        });
    });
});
