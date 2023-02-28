import assert from 'yeoman-assert';
import { jestExpect as expect } from 'mocha-expect-snapshot';

import { GENERATOR_CI_CD } from '../generator-list.mjs';
import { basicHelpers as helpers } from '../../test/support/index.mjs';

const expectedFiles = {
  travis: ['.travis.yml'],
  jenkins: ['Jenkinsfile', 'src/main/docker/jenkins.yml', 'src/main/resources/idea.gdsl'],
  gitlab: ['.gitlab-ci.yml'],
  circle: ['.circleci/config.yml'],
  azure: ['azure-pipelines.yml'],
  github: ['.github/workflows/main.yml'],
  dockerRegistry: ['src/main/docker/docker-registry.yml'],
};

const mavenSample = { baseName: 'sampleMysql', buildTool: 'maven', testFrameworks: ['cypress'] };
const gradleSample = { baseName: 'sampleMysql', buildTool: 'gradle', testFrameworks: ['cypress'] };
const skipServerSample = { buildTool: 'maven', skipServer: true };

const pomFile = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">

    <!-- jhipster-needle-distribution-management -->
</project>
`;

describe('generator - CI-CD', () => {
  //--------------------------------------------------
  // Jenkins tests
  //--------------------------------------------------
  describe('Jenkins tests', () => {
    describe('Jenkins: Maven Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            pipeline: 'jenkins',
            insideDocker: false,
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.jenkins);
      });
      it("doesn't contain Docker, Sonar, Heroku", () => {
        assert.noFileContent('Jenkinsfile', /docker/);
        assert.noFileContent('Jenkinsfile', /sonar/);
        assert.noFileContent('Jenkinsfile', /heroku/);
        assert.noFileContent('Jenkinsfile', /snyk/);
      });
    });
    describe('Jenkins: Gradle Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            pipeline: 'jenkins',
            insideDocker: false,
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.jenkins);
      });
      it("doesn't contain Docker, Sonar, Heroku", () => {
        assert.noFileContent('Jenkinsfile', /docker/);
        assert.noFileContent('Jenkinsfile', /sonar/);
        assert.noFileContent('Jenkinsfile', /heroku/);
        assert.noFileContent('Jenkinsfile', /snyk/);
      });
    });
    describe('Jenkins: Maven Angular NPM with full options', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            pipeline: 'jenkins',
            insideDocker: false,
            cicdIntegrations: ['deploy', 'sonar', 'publishDocker', 'heroku', 'snyk'],
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarName: 'sonarName',
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.jenkins);
      });
      it('contains Docker, Sonar, Heroku', () => {
        assert.fileContent('Jenkinsfile', /sonar/);
        assert.fileContent('Jenkinsfile', /heroku/);
        assert.fileContent('Jenkinsfile', /def dockerImage/);
        assert.fileContent('Jenkinsfile', /snyk/);
      });
      it('contains distributionManagement in pom.xml', () => {
        assert.fileContent('pom.xml', /distributionManagement/);
      });
    });
    describe('Jenkins: Maven Angular NPM inside Docker', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            pipeline: 'jenkins',
            insideDocker: true,
            cicdIntegrations: ['deploy', 'sonar', 'publishDocker', 'heroku', 'snyk'],
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarName: 'sonarName',
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.jenkins);
      });
      it('contains Docker, Sonar, Heroku, dockerImage', () => {
        assert.fileContent('Jenkinsfile', /docker/);
        assert.fileContent('Jenkinsfile', /sonar/);
        assert.fileContent('Jenkinsfile', /heroku/);
        assert.fileContent('Jenkinsfile', /def dockerImage/);
        assert.fileContent('Jenkinsfile', /snyk/);
      });
    });
  });

  //--------------------------------------------------
  // GitLab CI tests
  //--------------------------------------------------
  describe('GitLab CI tests', () => {
    describe('GitLab CI: Maven Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            pipeline: 'gitlab',
            insideDocker: false,
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.gitlab);
      });
      it("doesn't contain image: jhipster, Sonar, Heroku", () => {
        assert.noFileContent('.gitlab-ci.yml', /image: jhipster/);
        assert.noFileContent('.gitlab-ci.yml', /sonar/);
        assert.noFileContent('.gitlab-ci.yml', /heroku/);
        assert.noFileContent('.gitlab-ci.yml', /snyk/);
      });
    });
    describe('GitLab CI: Gradle Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            pipeline: 'gitlab',
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.gitlab);
      });
      it("doesn't contain jhipster/jhipster, Sonar, Heroku", () => {
        assert.noFileContent('.gitlab-ci.yml', /image: jhipster/);
        assert.noFileContent('.gitlab-ci.yml', /sonar/);
        assert.noFileContent('.gitlab-ci.yml', /heroku/);
        assert.noFileContent('.gitlab-ci.yml', /snyk/);
      });
    });
    describe('GitLab CI: npm skip server', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(skipServerSample)
          .withAnswers({
            pipeline: 'gitlab',
            insideDocker: true,
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.gitlab);
      });
      it('contains image: jhipster', () => {
        assert.fileContent('.gitlab-ci.yml', /image: jhipster/);
      });
    });
    describe('GitLab CI: Maven Angular NPM with full options', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            pipeline: 'gitlab',
            insideDocker: false,
            cicdIntegrations: ['deploy', 'sonar', 'heroku', 'snyk'],
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarUrl: 'http://localhost:9000',
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.gitlab);
      });
      it('contains Sonar, Heroku', () => {
        assert.noFileContent('.gitlab-ci.yml', /image: jhipster/);
        assert.fileContent('.gitlab-ci.yml', /sonar/);
        assert.fileContent('.gitlab-ci.yml', /heroku/);
        assert.fileContent('.gitlab-ci.yml', /snyk/);
      });
      it('contains distributionManagement in pom.xml', () => {
        assert.fileContent('pom.xml', /distributionManagement/);
      });
    });
    describe('GitLab CI: Maven Angular NPM inside Docker', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            pipeline: 'gitlab',
            insideDocker: true,
            cicdIntegrations: ['deploy', 'sonar', 'heroku', 'snyk'],
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarUrl: 'http://localhost:9000',
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.gitlab);
      });
      it('contains image: jhipster, Sonar, Heroku', () => {
        assert.fileContent('.gitlab-ci.yml', /image: jhipster/);
        assert.fileContent('.gitlab-ci.yml', /sonar/);
        assert.fileContent('.gitlab-ci.yml', /heroku/);
        assert.fileContent('.gitlab-ci.yml', /snyk/);
      });
      it('contains distributionManagement in pom.xml', () => {
        assert.fileContent('pom.xml', /distributionManagement/);
      });
    });
    describe('GitLab CI: Maven Angular Yarn inside Docker Autoconfigure', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withOptions({ autoconfigureGitlab: true })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.gitlab);
      });
      it('contains image: jhipster, Sonar, Heroku', () => {
        assert.fileContent('.gitlab-ci.yml', /image: jhipster/);
        assert.noFileContent('.gitlab-ci.yml', /sonar/);
        assert.noFileContent('.gitlab-ci.yml', /heroku/);
        assert.noFileContent('.gitlab-ci.yml', /snyk/);
      });
    });
  });

  //--------------------------------------------------
  // Travis CI tests
  //--------------------------------------------------
  describe('Travis CI tests', () => {
    describe('Travis CI: Maven Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            pipeline: 'travis',
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.travis);
      });
      it("doesn't contain Sonar, Heroku", () => {
        assert.noFileContent('.travis.yml', /sonar/);
        assert.noFileContent('.travis.yml', /heroku/);
      });
    });
    describe('Travis CI: Gradle Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            pipeline: 'travis',
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.travis);
      });
      it("doesn't contain Sonar, Heroku", () => {
        assert.noFileContent('.travis.yml', /sonar/);
        assert.noFileContent('.travis.yml', /heroku/);
      });
      it('contains Cypress', () => {
        assert.fileContent('.travis.yml', /run ci:e2e:package/);
        assert.fileContent('.travis.yml', /CYPRESS_ENABLE_RECORD: false/);
      });
    });
    describe('Travis CI: Maven Angular NPM with full options', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            pipeline: 'travis',
            cicdIntegrations: ['deploy', 'sonar', 'heroku', 'snyk', 'cypressDashboard'],
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarUrl: 'http://localhost:9000',
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.travis);
      });
      it('contains Sonar, Heroku, Snyk', () => {
        assert.fileContent('.travis.yml', /sonar/);
        assert.fileContent('.travis.yml', /heroku/);
        assert.fileContent('.travis.yml', /snyk/);
      });
      it('contains distributionManagement in pom.xml', () => {
        assert.fileContent('pom.xml', /distributionManagement/);
      });
      it('contains Cypress', () => {
        assert.fileContent('.travis.yml', /run ci:e2e:package/);
        assert.fileContent('.travis.yml', /CYPRESS_ENABLE_RECORD: true/);
      });
    });
  });

  //--------------------------------------------------
  // Azure Pipelines tests
  //--------------------------------------------------
  describe('Azure Pipelines tests', () => {
    describe('Azure Pipelines: Maven Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            pipeline: 'azure',
            cicdIntegrations: ['cypressDashboard'],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.azure);
      });
      it('contains Cypress', () => {
        assert.fileContent('azure-pipelines.yml', /run ci:e2e:package/);
        assert.fileContent('azure-pipelines.yml', /CYPRESS_ENABLE_RECORD: true/);
        assert.fileContent('azure-pipelines.yml', /CYPRESS_PROJECT_ID/);
        assert.fileContent('azure-pipelines.yml', /CYPRESS_RECORD_KEY/);
      });
    });
    describe('Azure Pipelines: Gradle Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            pipeline: 'azure',
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.azure);
      });
      it('contains Cypress', () => {
        assert.fileContent('azure-pipelines.yml', /run ci:e2e:package/);
        assert.fileContent('azure-pipelines.yml', /CYPRESS_ENABLE_RECORD: false/);
      });
    });
    describe('Azure Pipelines: Maven Angular NPM with Snyk', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            pipeline: 'azure',
            cicdIntegrations: ['snyk'],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.azure);
      });
      it('contains Snyk', () => {
        assert.fileContent('azure-pipelines.yml', /snyk/);
      });
    });
    describe('Azure Pipelines: Gradle Angular NPM with Snyk', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            pipeline: 'azure',
            cicdIntegrations: ['snyk'],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.azure);
      });
      it('contains Snyk', () => {
        assert.fileContent('azure-pipelines.yml', /snyk/);
      });
    });
    describe('Azure Pipelines: autoconfigure', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withOptions({ autoconfigureAzure: true })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.azure);
      });
    });
  });

  //--------------------------------------------------
  // GitHub Actions tests
  //--------------------------------------------------
  describe('GitHub Actions tests', () => {
    describe('GitHub Actions: Maven Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            pipeline: 'github',
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.github);
      });
    });
    describe('GitHub Actions: Gradle Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            pipeline: 'github',
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.github);
      });
    });
    describe('GitHub Actions: Maven Angular NPM with full options', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            pipeline: 'github',
            cicdIntegrations: ['deploy', 'sonar', 'publishDocker', 'heroku', 'snyk', 'cypressDashboard'],
            dockerImage: 'jhipster-publish-docker',
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarUrl: 'http://sonar.com:9000',
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.github);
      });
      it('contains Docker, Sonar, Heroku, Snyk', () => {
        assert.fileContent('.github/workflows/main.yml', /mvnw.*sonar.com/);
        assert.fileContent('.github/workflows/main.yml', /mvnw.*jhipster-publish-docker/);
        assert.fileContent('.github/workflows/main.yml', /mvnw.*sample-mysql/);
        assert.fileContent('.github/workflows/main.yml', /snyk/);
      });
      it('contains distributionManagement in pom.xml', () => {
        assert.fileContent('pom.xml', /distributionManagement/);
      });
      it('contains Cypress', () => {
        assert.fileContent('.github/workflows/main.yml', /run ci:e2e:package/);
        assert.fileContent('.github/workflows/main.yml', /CYPRESS_ENABLE_RECORD: true/);
        assert.fileContent('.github/workflows/main.yml', /CYPRESS_PROJECT_ID/);
        assert.fileContent('.github/workflows/main.yml', /CYPRESS_RECORD_KEY/);
      });
    });
    describe('GitHub Actions: Gradle Angular NPM with full options', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            pipeline: 'github',
            cicdIntegrations: ['sonar', 'publishDocker', 'heroku', 'snyk'],
            dockerImage: 'jhipster-publish-docker',
            sonarUrl: 'http://sonar.com:9000',
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.github);
      });
      it('contains Docker, Sonar, Heroku', () => {
        assert.fileContent('.github/workflows/main.yml', /gradlew.*jhipster-publish-docker/);
        assert.fileContent('.github/workflows/main.yml', /gradlew.*sonar.com/);
        assert.fileContent('.github/workflows/main.yml', /gradlew.*deployHeroku/);
        assert.fileContent('.github/workflows/main.yml', /snyk/);
      });
      it('contains Cypress', () => {
        assert.fileContent('.github/workflows/main.yml', /run ci:e2e:package/);
        assert.fileContent('.github/workflows/main.yml', /CYPRESS_ENABLE_RECORD: false/);
        assert.fileContent('.github/workflows/main.yml', /CYPRESS_PROJECT_ID/);
        assert.fileContent('.github/workflows/main.yml', /CYPRESS_RECORD_KEY/);
      });
    });
    describe('GitHub Actions: autoconfigure', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withOptions({ autoconfigureGithub: true })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.github);
      });
    });
  });

  //--------------------------------------------------
  // Circle CI tests
  //--------------------------------------------------
  describe('Circle CI test', () => {
    describe('Circle CI: Maven Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            pipeline: 'circle',
            cicdIntegrations: ['cypressDashboard'],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.circle);
        assert.noFile(expectedFiles.jenkins);
        assert.noFile(expectedFiles.travis);
        assert.noFile(expectedFiles.gitlab);
      });
      it('contains Cypress', () => {
        assert.fileContent('.circleci/config.yml', /run ci:e2e:package/);
        assert.fileContent('.circleci/config.yml', /CYPRESS_ENABLE_RECORD: true/);
      });
    });
    describe('Circle CI: Gradle Angular NPM', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            pipeline: 'circle',
            cicdIntegrations: [],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.circle);
        assert.noFile(expectedFiles.jenkins);
        assert.noFile(expectedFiles.travis);
        assert.noFile(expectedFiles.gitlab);
      });
      it('contains Cypress', () => {
        assert.fileContent('.circleci/config.yml', /run ci:e2e:package/);
        assert.fileContent('.circleci/config.yml', /CYPRESS_ENABLE_RECORD: false/);
      });
    });
    describe('Circle CI: Maven with Snyk', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            pipeline: 'circle',
            cicdIntegrations: ['snyk'],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.circle);
      });
      it('contains Snyk', () => {
        assert.fileContent('.circleci/config.yml', /snyk/);
      });
    });
    describe('Circle CI: Gradle with Snyk', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .createJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            pipeline: 'circle',
            cicdIntegrations: ['snyk'],
          })
          .run();
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        assert.file(expectedFiles.circle);
      });
      it('contains Snyk', () => {
        assert.fileContent('.circleci/config.yml', /snyk/);
      });
    });
  });
});
