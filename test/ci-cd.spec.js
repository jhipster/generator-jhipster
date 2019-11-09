const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    travis: ['.travis.yml'],
    jenkins: ['Jenkinsfile', 'src/main/docker/jenkins.yml', 'src/main/resources/idea.gdsl'],
    gitlab: ['.gitlab-ci.yml'],
    circle: ['circle.yml'],
    azure: ['azure-pipelines.yml'],
    github: ['.github/workflows/github-ci.yml'],
    dockerRegistry: ['src/main/docker/docker-registry.yml']
};

describe('JHipster CI-CD Sub Generator', () => {
    //--------------------------------------------------
    // Jenkins tests
    //--------------------------------------------------
    describe('Jenkins: maven AngularX Yarn', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'jenkins',
                    insideDocker: false,
                    cicdIntegrations: []
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
                    cicdIntegrations: []
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

    describe('Jenkins: Gradle AngularX Yarn', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'jenkins',
                    insideDocker: false,
                    cicdIntegrations: []
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
                    cicdIntegrations: []
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

    describe('Jenkins: maven AngularX Yarn with full options', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'jenkins',
                    insideDocker: false,
                    cicdIntegrations: ['deploy', 'sonar', 'publishDocker', 'heroku'],
                    artifactorySnapshotsId: 'snapshots',
                    artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
                    artifactoryReleasesId: 'releases',
                    artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
                    sonarName: 'sonarName',
                    dockerRegistryURL: 'https://registry.hub.docker.com',
                    dockerRegistryCredentialsId: 'docker-login',
                    dockerRegistryOrganizationName: 'jhipster'
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
        });
        it('contains Docker, Sonar, Heroku', () => {
            assert.fileContent('Jenkinsfile', /sonar/);
            assert.fileContent('Jenkinsfile', /heroku/);
            assert.fileContent('Jenkinsfile', /def dockerImage/);
        });
        it('contains distributionManagement in pom.xml', () => {
            assert.fileContent('pom.xml', /distributionManagement/);
        });
    });

    describe('Jenkins: maven AngularX Yarn inside Docker', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'jenkins',
                    insideDocker: true,
                    cicdIntegrations: ['deploy', 'sonar', 'publishDocker', 'heroku'],
                    artifactorySnapshotsId: 'snapshots',
                    artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
                    artifactoryReleasesId: 'releases',
                    artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
                    sonarName: 'sonarName',
                    dockerRegistryURL: 'https://registry.hub.docker.com',
                    dockerRegistryCredentialsId: 'docker-login',
                    dockerRegistryOrganizationName: 'jhipster'
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
        });
        it('contains Docker, Sonar, Heroku, dockerImage', () => {
            assert.fileContent('Jenkinsfile', /docker/);
            assert.fileContent('Jenkinsfile', /sonar/);
            assert.fileContent('Jenkinsfile', /heroku/);
            assert.fileContent('Jenkinsfile', /def dockerImage/);
        });
    });

    //--------------------------------------------------
    // GitLab CI tests
    //--------------------------------------------------
    describe('GitLab: maven AngularX Yarn', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'gitlab',
                    insideDocker: false,
                    cicdIntegrations: []
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
                    cicdIntegrations: []
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

    describe('GitLab: Gradle AngularX Yarn', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'gitlab',
                    cicdIntegrations: []
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
                    cicdIntegrations: []
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

    describe('GitLab: maven AngularX Yarn with full options', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'gitlab',
                    insideDocker: false,
                    cicdIntegrations: ['deploy', 'sonar', 'heroku'],
                    artifactorySnapshotsId: 'snapshots',
                    artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
                    artifactoryReleasesId: 'releases',
                    artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
                    sonarUrl: 'http://localhost:9000'
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.gitlab);
        });
        it('contains Sonar, Heroku', () => {
            assert.noFileContent('.gitlab-ci.yml', /image: jhipster/);
            assert.fileContent('.gitlab-ci.yml', /sonar/);
            assert.fileContent('.gitlab-ci.yml', /heroku/);
        });
        it('contains distributionManagement in pom.xml', () => {
            assert.fileContent('pom.xml', /distributionManagement/);
        });
    });

    describe('GitLab: maven AngularX Yarn inside Docker', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'gitlab',
                    insideDocker: true,
                    cicdIntegrations: ['deploy', 'sonar', 'heroku'],
                    artifactorySnapshotsId: 'snapshots',
                    artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
                    artifactoryReleasesId: 'releases',
                    artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
                    sonarUrl: 'http://localhost:9000',
                    dockerRegistryURL: 'https://registry.hub.docker.com',
                    dockerRegistryCredentialsId: 'docker-login',
                    dockerRegistryOrganizationName: 'jhipster'
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.gitlab);
        });
        it('contains image: jhipster, Sonar, Heroku', () => {
            assert.fileContent('.gitlab-ci.yml', /image: jhipster/);
            assert.fileContent('.gitlab-ci.yml', /sonar/);
            assert.fileContent('.gitlab-ci.yml', /heroku/);
        });
        it('contains distributionManagement in pom.xml', () => {
            assert.fileContent('pom.xml', /distributionManagement/);
        });
    });

    describe('GitLab: maven AngularX Yarn inside Docker Autoconfigure', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ autoconfigureGitlab: true })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.gitlab);
        });
        it('contains image: jhipster, Sonar, Heroku', () => {
            assert.fileContent('.gitlab-ci.yml', /image: jhipster/);
            assert.noFileContent('.gitlab-ci.yml', /sonar/);
            assert.noFileContent('.gitlab-ci.yml', /heroku/);
        });
    });

    //--------------------------------------------------
    // Travis CI tests
    //--------------------------------------------------
    describe('Travis CI: maven AngularX Yarn', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'travis',
                    cicdIntegrations: []
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
                    cicdIntegrations: []
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

    describe('Travis CI: Gradle AngularX Yarn', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'travis',
                    cicdIntegrations: []
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
                    cicdIntegrations: []
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

    describe('Travis CI: maven AngularX Yarn with full options', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'travis',
                    cicdIntegrations: ['deploy', 'sonar', 'heroku'],
                    artifactorySnapshotsId: 'snapshots',
                    artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
                    artifactoryReleasesId: 'releases',
                    artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
                    sonarUrl: 'http://localhost:9000'
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.travis);
        });
        it('contains Sonar, Heroku', () => {
            assert.fileContent('.travis.yml', /sonar/);
            assert.fileContent('.travis.yml', /heroku/);
        });
        it('contains distributionManagement in pom.xml', () => {
            assert.fileContent('pom.xml', /distributionManagement/);
        });
    });

    //--------------------------------------------------
    // Azure Pipelines tests
    //--------------------------------------------------
    describe('Azure Pipelines: maven AngularX Yarn', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'azure',
                    cicdIntegrations: []
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.azure);
        });
    });

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
                    cicdIntegrations: []
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.azure);
        });
    });

    describe('Azure Pipelines: Gradle AngularX Yarn', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'azure',
                    cicdIntegrations: []
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
                    cicdIntegrations: []
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.azure);
        });
    });

    describe('Azure Pipelines: Autoconfigure', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ autoconfigureAzure: true })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.azure);
        });
    });

    //--------------------------------------------------
    // GitHub CI tests
    //--------------------------------------------------
    describe('GitHub CI: maven AngularX Yarn', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'github',
                    cicdIntegrations: []
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.github);
        });
    });

    describe('GitHub CI: maven AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'github',
                    cicdIntegrations: []
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.github);
        });
    });

    describe('GitHub CI: Gradle AngularX Yarn', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'github',
                    cicdIntegrations: []
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.github);
        });
    });

    describe('GitHub CI: Gradle AngularX NPM', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipeline: 'github',
                    cicdIntegrations: []
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.github);
        });
    });

    describe('GitHub CI: Autoconfigure', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ autoconfigureGithub: true })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.github);
        });
    });
});
