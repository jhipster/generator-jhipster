const path = require('path');
const fs = require('fs');
const helpers = require('yeoman-test');

const expectedFiles = require('../utils/expected-files');
const { SERVER_MAIN_RES_DIR } = require('../../generators/generator-constants');

const incrementalFiles = [
    `${SERVER_MAIN_RES_DIR}config/liquibase/master.xml`,
    `${SERVER_MAIN_RES_DIR}config/liquibase/changelog/00000000000000_initial_schema.xml`,
];

describe('JHipster incremental changelog feature', () => {
    const options = {
        skipInstall: true,
        noInsight: true,
        creationTimestamp: '2020-01-01',
        incrementalChangelog: true,
        defaults: true,
        skipClient: true,
    };
    context('when creating a new application', () => {
        let runResult;
        before(() => {
            return helpers
                .create(path.join(__dirname, '../../generators/app'))
                .withOptions(options)
                .run()
                .then(result => {
                    runResult = result;
                });
        });

        after(() => runResult.cleanup());

        it('creates the application', () => {
            runResult.assertFile(['.yo-rc.json']);
        });

        it('creates expected liquibase files', () => {
            runResult.assertFile(expectedFiles.liquibase);
        });
    });

    context('when incremental liquibase files exists', () => {
        context('with default options', () => {
            let runResult;
            before(() => {
                return helpers
                    .create(path.join(__dirname, '../../generators/app'))
                    .withOptions(options)
                    .doInDir(cwd => {
                        incrementalFiles.forEach(filePath => {
                            filePath = path.join(cwd, filePath);
                            const dirname = path.dirname(filePath);
                            if (!fs.existsSync(dirname)) {
                                fs.mkdirSync(dirname, { recursive: true });
                            }
                            fs.writeFileSync(filePath, filePath);
                        });
                    })
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

            it('creates the application', () => {
                runResult.assertFile(['.yo-rc.json']);
            });

            it('creates expected liquibase files', () => {
                runResult.assertFile(expectedFiles.liquibase);
            });

            it('should not override existing incremental files', () => {
                incrementalFiles.forEach(filePath => {
                    runResult.assertFileContent(filePath, filePath);
                });
            });
        });

        context('with --recreate-initial-changelog', () => {
            let runResult;
            before(() => {
                return helpers
                    .create(path.join(__dirname, '../../generators/app'))
                    .withOptions({ ...options, recreateInitialChangelog: true })
                    .doInDir(cwd => {
                        incrementalFiles.forEach(filePath => {
                            filePath = path.join(cwd, filePath);
                            const dirname = path.dirname(filePath);
                            if (!fs.existsSync(dirname)) {
                                fs.mkdirSync(dirname, { recursive: true });
                            }
                            fs.writeFileSync(filePath, filePath);
                        });
                    })
                    .run()
                    .then(result => {
                        runResult = result;
                    });
            });

            after(() => runResult.cleanup());

            it('creates the application', () => {
                runResult.assertFile(['.yo-rc.json']);
            });

            it('creates expected liquibase files', () => {
                runResult.assertFile(expectedFiles.liquibase);
            });

            it('should override existing incremental files', () => {
                incrementalFiles.forEach(filePath => {
                    runResult.assertNoFileContent(filePath, filePath);
                });
            });
        });
    });
});
