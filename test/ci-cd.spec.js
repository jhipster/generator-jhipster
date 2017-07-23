/* global describe, beforeEach, it*/


const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    travis: [
        '.travis.yml'
    ],
    jenkins: [
        'Jenkinsfile'
    ],
    gitlab: [
        '.gitlab-ci.yml'
    ],
    circle: [
        'circle.yml'
    ],
    dockerRegistry: [
        'src/main/docker/docker-registry.yml'
    ]
};

describe('JHipster CI-CD Sub Generator', () => {
    describe('Gradle Angular1 NPM', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ng1-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Gradle Angular1 Yarn', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ng1-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Gradle Angular2 NPM', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ng2-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Gradle Angular2 Yarn', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ng2-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Maven Angular1 NPM', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng1-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Maven Angular1 Yarn', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng1-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Maven Angular2 NPM', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
    });

    describe('Maven Angular2 Yarn', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'jenkins',
                        'travis',
                        'gitlab',
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.gitlab);
            assert.file(expectedFiles.circle);
        });
        it('doesn\'t contain Docker, Sonar, Heroku', () => {
            assert.noFileContent('Jenkinsfile', /docker/);
            assert.noFileContent('Jenkinsfile', /sonar/);
            assert.noFileContent('Jenkinsfile', /heroku/);
            assert.noFileContent('.gitlab-ci.yml', /image: openjdk/);
            assert.noFileContent('.gitlab-ci.yml', /heroku/);
            assert.noFileContent('circle.yml', /heroku/);
            assert.noFileContent('.travis.yml', /heroku/);
        });
    });

    describe('Jenkins', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'jenkins'
                    ],
                    jenkinsIntegrations: [
                        'docker',
                        'sonar',
                        'gitlab'
                    ],
                    heroku: [
                        'jenkins'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
            assert.noFile(expectedFiles.gitlab);
            assert.noFile(expectedFiles.travis);
            assert.noFile(expectedFiles.circle);
        });
        it('contains Docker, Sonar, Heroku', () => {
            assert.fileContent('Jenkinsfile', /docker/);
            assert.fileContent('Jenkinsfile', /sonar/);
            assert.fileContent('Jenkinsfile', /heroku/);
            assert.noFileContent('Jenkinsfile', /def dockerImage/);
        });
    });

    describe('Jenkins with pushing to Docker Registry', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'jenkins'
                    ],
                    jenkinsIntegrations: [
                        'publishDocker'
                    ],
                    dockerRegistryURL: 'https://registry.hub.docker.com',
                    dockerRegistryCredentialsId: 'jhipster'
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
            assert.file(expectedFiles.dockerRegistry);
            assert.noFile(expectedFiles.gitlab);
            assert.noFile(expectedFiles.travis);
            assert.noFile(expectedFiles.circle);
        });
        it('contains def dockerImage', () => {
            assert.fileContent('Jenkinsfile', /def dockerImage/);
        });
    });

    describe('GitLab CI', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'gitlab'
                    ],
                    gitlabUseDocker: true,
                    heroku: [
                        'gitlab'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.gitlab);
            assert.noFile(expectedFiles.jenkins);
            assert.noFile(expectedFiles.travis);
            assert.noFile(expectedFiles.circle);
        });
        it('contains image openjdk, heroku', () => {
            assert.fileContent('.gitlab-ci.yml', /image: openjdk/);
            assert.fileContent('.gitlab-ci.yml', /heroku/);
        });
    });

    describe('Circle CI', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'circle'
                    ],
                    gitlabUseDocker: true,
                    heroku: [
                        'circle'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.circle);
            assert.noFile(expectedFiles.jenkins);
            assert.noFile(expectedFiles.travis);
            assert.noFile(expectedFiles.gitlab);
        });
        it('contains heroku', () => {
            assert.fileContent('circle.yml', /heroku/);
        });
    });

    describe('Travis CI', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ng2-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: [
                        'travis'
                    ],
                    heroku: [
                        'travis'
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
            assert.noFile(expectedFiles.jenkins);
            assert.noFile(expectedFiles.circle);
            assert.noFile(expectedFiles.gitlab);
        });
        it('contains heroku', () => {
            assert.fileContent('.travis.yml', /heroku/);
        });
    });
});
