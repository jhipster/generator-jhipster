const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    travis: ['.travis.yml'],
    jenkins: ['Jenkinsfile', 'src/main/docker/jenkins.yml', 'src/main/resources/idea.gdsl'],
    gitlab: ['.gitlab-ci.yml'],
    circle: ['.circleci/config.yml'],
    azure: ['azure-pipelines.yml'],
    github: ['.github/workflows/github-ci.yml'],
    dockerRegistry: ['src/main/docker/docker-registry.yml'],
};

describe('JHipster CI-CD Sub Generator', () => {
    //--------------------------------------------------
    // Jenkins tests
    //--------------------------------------------------

    describe('Jenkins: maven AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'jenkins',
                    insideDocker: false,
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
        });
        it("doesn't contain Docker, Sonar, Heroku", () => {
            assert.noFileContent('Jenkinsfile', /docker/);
            assert.noFileContent('Jenkinsfile', /sonar/);
            assert.noFileContent('Jenkinsfile', /heroku/);
        });
    });

    describe('Jenkins: Gradle AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'jenkins',
                    insideDocker: false,
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
        });
        it("doesn't contain Docker, Sonar, Heroku", () => {
            assert.noFileContent('Jenkinsfile', /docker/);
            assert.noFileContent('Jenkinsfile', /sonar/);
            assert.noFileContent('Jenkinsfile', /heroku/);
        });
    });

    //--------------------------------------------------
    // GitLab CI tests
    //--------------------------------------------------

    describe('GitLab: maven AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'gitlab',
                    insideDocker: false,
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.gitlab);
        });
        it("doesn't contain image: jhipster, Sonar, Heroku", () => {
            assert.noFileContent('.gitlab-ci.yml', /image: jhipster/);
            assert.noFileContent('.gitlab-ci.yml', /sonar/);
            assert.noFileContent('.gitlab-ci.yml', /heroku/);
        });
    });

    describe('GitLab: Gradle AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'gitlab',
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.gitlab);
        });
        it("doesn't contain jhipster/jhipster, Sonar, Heroku", () => {
            assert.noFileContent('.gitlab-ci.yml', /image: jhipster/);
            assert.noFileContent('.gitlab-ci.yml', /sonar/);
            assert.noFileContent('.gitlab-ci.yml', /heroku/);
        });
    });

    describe('GitLab: npm skip server', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/npm-skip-server'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'gitlab',
                    insideDocker: true,
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.gitlab);
        });
        it('contains image: jhipster', () => {
            assert.fileContent('.gitlab-ci.yml', /image: jhipster/);
        });
    });

    //--------------------------------------------------
    // Travis CI tests
    //--------------------------------------------------

    describe('Travis CI: maven AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'travis',
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
        });
        it("doesn't contain Sonar, Heroku", () => {
            assert.noFileContent('.travis.yml', /sonar/);
            assert.noFileContent('.travis.yml', /heroku/);
        });
    });

    describe('Travis CI: Gradle AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'travis',
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
        });
        it("doesn't contain Sonar, Heroku", () => {
            assert.noFileContent('.travis.yml', /sonar/);
            assert.noFileContent('.travis.yml', /heroku/);
        });
    });

    //--------------------------------------------------
    // Azure Pipelines tests
    //--------------------------------------------------

    describe('Azure Pipelines: maven AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'azure',
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.azure);
        });
    });

    describe('Azure Pipelines: Gradle AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'azure',
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.azure);
        });
    });

    //--------------------------------------------------
    // GitHub Actions tests
    //--------------------------------------------------

    describe('GitHub Actions: maven AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'github',
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.github);
        });
    });

    describe('GitHub Actions: Gradle AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'github',
                    cicdIntegrations: [],
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.github);
        });
    });
});
