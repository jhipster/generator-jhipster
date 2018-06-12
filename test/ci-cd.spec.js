/* global describe, beforeEach, it */


const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    travis: [
        '.travis.yml'
    ],
    jenkins: [
        'Jenkinsfile',
        'src/main/docker/jenkins.yml',
        'src/main/resources/idea.gdsl'
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

    describe('Jenkins: maven AngularX Yarn', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: 'jenkins',
                    cicdIntegrations: [
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
        });
        it('doesn\'t contain Docker, Sonar, Heroku', () => {
            assert.noFileContent('Jenkinsfile', /docker/);
            assert.noFileContent('Jenkinsfile', /sonar/);
            assert.noFileContent('Jenkinsfile', /heroku/);
        });
    });

    describe('Jenkins: maven AngularX NPM', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: 'jenkins',
                    cicdIntegrations: [
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
        });
        it('doesn\'t contain Docker, Sonar, Heroku', () => {
            assert.noFileContent('Jenkinsfile', /docker/);
            assert.noFileContent('Jenkinsfile', /sonar/);
            assert.noFileContent('Jenkinsfile', /heroku/);
        });
    });

    describe('Jenkins: Gradle AngularX Yarn', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: 'jenkins',
                    cicdIntegrations: [
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
        });
        it('doesn\'t contain Docker, Sonar, Heroku', () => {
            assert.noFileContent('Jenkinsfile', /docker/);
            assert.noFileContent('Jenkinsfile', /sonar/);
            assert.noFileContent('Jenkinsfile', /heroku/);
        });
    });

    describe('Jenkins: Gradle AngularX NPM', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/gradle-ngx-npm'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: 'jenkins',
                    cicdIntegrations: [
                    ]
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
        });
        it('doesn\'t contain Docker, Sonar, Heroku', () => {
            assert.noFileContent('Jenkinsfile', /docker/);
            assert.noFileContent('Jenkinsfile', /sonar/);
            assert.noFileContent('Jenkinsfile', /heroku/);
        });
    });

    describe('Jenkins: maven AngularX Yarn with full options', () => {
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: 'jenkins',
                    cicdIntegrations: [
                        'deploy',
                        'sonar',
                        'publishDocker',
                        'heroku'
                    ],
                    artifactoryId: 'artifactoryId',
                    artifactoryName: 'artifactoryName',
                    artifactoryUrl: 'artifactoryUrl',
                    sonarName: 'sonarName',
                    dockerRegistryURL: 'https://registry.hub.docker.com',
                    dockerRegistryCredentialsId: 'docker-login',
                    dockerRegistryOrganizationName: 'jhipster',
                    insideDocker: false
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
        beforeEach((done) => {
            helpers
                .run(require.resolve('../generators/ci-cd'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    pipelines: 'jenkins',
                    cicdIntegrations: [
                        'deploy',
                        'sonar',
                        'heroku'
                    ],
                    artifactoryId: 'artifactoryId',
                    artifactoryName: 'artifactoryName',
                    artifactoryUrl: 'artifactoryUrl',
                    sonarName: 'sonarName',
                    insideDocker: true
                })
                .on('end', done);
        });
        it('creates expected files', () => {
            assert.file(expectedFiles.jenkins);
        });
        it('contains Docker, Sonar, Heroku', () => {
            assert.fileContent('Jenkinsfile', /docker/);
            assert.fileContent('Jenkinsfile', /sonar/);
            assert.fileContent('Jenkinsfile', /heroku/);
            assert.noFileContent('Jenkinsfile', /def dockerImage/);
        });
    });

    // describe('Jenkins', () => {
    //     beforeEach((done) => {
    //         helpers
    //             .run(require.resolve('../generators/ci-cd'))
    //             .inTmpDir((dir) => {
    //                 fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
    //             })
    //             .withOptions({ skipChecks: true })
    //             .withPrompts({
    //                 pipelines: [
    //                     'jenkins'
    //                 ],
    //                 jenkinsIntegrations: [
    //                     'docker',
    //                     'sonar',
    //                     'gitlab'
    //                 ],
    //                 heroku: [
    //                     'jenkins'
    //                 ]
    //             })
    //             .on('end', done);
    //     });
    //     it('creates expected files', () => {
    //         assert.file(expectedFiles.jenkins);
    //         assert.noFile(expectedFiles.gitlab);
    //         assert.noFile(expectedFiles.travis);
    //         assert.noFile(expectedFiles.circle);
    //     });
    //     it('contains Docker, Sonar, Heroku', () => {
    //         assert.fileContent('Jenkinsfile', /docker/);
    //         assert.fileContent('Jenkinsfile', /sonar/);
    //         assert.fileContent('Jenkinsfile', /heroku/);
    //         assert.noFileContent('Jenkinsfile', /def dockerImage/);
    //     });
    // });

    // describe('Jenkins with pushing to Docker Registry', () => {
    //     beforeEach((done) => {
    //         helpers
    //             .run(require.resolve('../generators/ci-cd'))
    //             .inTmpDir((dir) => {
    //                 fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
    //             })
    //             .withOptions({ skipChecks: true })
    //             .withPrompts({
    //                 pipelines: [
    //                     'jenkins'
    //                 ],
    //                 jenkinsIntegrations: [
    //                     'publishDocker'
    //                 ],
    //                 dockerRegistryURL: 'https://registry.hub.docker.com',
    //                 dockerRegistryCredentialsId: 'jhipster'
    //             })
    //             .on('end', done);
    //     });
    //     it('creates expected files', () => {
    //         assert.file(expectedFiles.jenkins);
    //         assert.file(expectedFiles.dockerRegistry);
    //         assert.noFile(expectedFiles.gitlab);
    //         assert.noFile(expectedFiles.travis);
    //         assert.noFile(expectedFiles.circle);
    //     });
    //     it('contains def dockerImage', () => {
    //         assert.fileContent('Jenkinsfile', /def dockerImage/);
    //     });
    // });

    // describe('GitLab CI', () => {
    //     beforeEach((done) => {
    //         helpers
    //             .run(require.resolve('../generators/ci-cd'))
    //             .inTmpDir((dir) => {
    //                 fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
    //             })
    //             .withOptions({ skipChecks: true })
    //             .withPrompts({
    //                 pipelines: [
    //                     'gitlab'
    //                 ],
    //                 gitlabUseDocker: true,
    //                 heroku: [
    //                     'gitlab'
    //                 ]
    //             })
    //             .on('end', done);
    //     });
    //     it('creates expected files', () => {
    //         assert.file(expectedFiles.gitlab);
    //         assert.noFile(expectedFiles.jenkins);
    //         assert.noFile(expectedFiles.travis);
    //         assert.noFile(expectedFiles.circle);
    //     });
    //     it('contains image openjdk, heroku', () => {
    //         assert.fileContent('.gitlab-ci.yml', /image: openjdk/);
    //         assert.fileContent('.gitlab-ci.yml', /heroku/);
    //     });
    // });

    // describe('Circle CI', () => {
    //     beforeEach((done) => {
    //         helpers
    //             .run(require.resolve('../generators/ci-cd'))
    //             .inTmpDir((dir) => {
    //                 fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
    //             })
    //             .withOptions({ skipChecks: true })
    //             .withPrompts({
    //                 pipelines: [
    //                     'circle'
    //                 ],
    //                 gitlabUseDocker: true,
    //                 heroku: [
    //                     'circle'
    //                 ]
    //             })
    //             .on('end', done);
    //     });
    //     it('creates expected files', () => {
    //         assert.file(expectedFiles.circle);
    //         assert.noFile(expectedFiles.jenkins);
    //         assert.noFile(expectedFiles.travis);
    //         assert.noFile(expectedFiles.gitlab);
    //     });
    //     it('contains heroku', () => {
    //         assert.fileContent('circle.yml', /heroku/);
    //     });
    // });

    // describe('Travis CI', () => {
    //     beforeEach((done) => {
    //         helpers
    //             .run(require.resolve('../generators/ci-cd'))
    //             .inTmpDir((dir) => {
    //                 fse.copySync(path.join(__dirname, './templates/ci-cd/maven-ngx-yarn'), dir);
    //             })
    //             .withOptions({ skipChecks: true })
    //             .withPrompts({
    //                 pipelines: [
    //                     'travis'
    //                 ],
    //                 heroku: [
    //                     'travis'
    //                 ]
    //             })
    //             .on('end', done);
    //     });
    //     it('creates expected files', () => {
    //         assert.file(expectedFiles.travis);
    //         assert.noFile(expectedFiles.jenkins);
    //         assert.noFile(expectedFiles.circle);
    //         assert.noFile(expectedFiles.gitlab);
    //     });
    //     it('contains heroku', () => {
    //         assert.fileContent('.travis.yml', /heroku/);
    //     });
    // });
});
