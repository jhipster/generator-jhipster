import { before, describe, expect, it } from 'esmocha';

import { defaultHelpers as helpers, runResult } from '../../lib/testing/index.ts';
import { GENERATOR_CI_CD } from '../generator-list.ts';

const expectedFiles = {
  travis: ['.travis.yml'],
  jenkins: ['Jenkinsfile', 'src/main/docker/jenkins.yml', 'src/main/resources/idea.gdsl'],
  gitlab: ['.gitlab-ci.yml'],
  circle: ['.circleci/config.yml'],
  azure: ['azure-pipelines.yml'],
  github: ['.github/workflows/main.yml'],
  dockerRegistry: ['src/main/docker/docker-registry.yml'],
};

const mavenSample = { baseName: 'sampleMysql', buildTool: 'maven' as const, testFrameworks: ['cypress'] };
const gradleSample = { baseName: 'sampleMysql', buildTool: 'gradle' as const, testFrameworks: ['cypress'] };
const skipServerSample = { buildTool: 'maven' as const, skipServer: true };

const pomFile = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">

</project>
`;

describe('generator - CI-CD', () => {
  //--------------------------------------------------
  // Jenkins tests
  //--------------------------------------------------
  describe('Jenkins tests', () => {
    describe('Jenkins: Maven Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            ciCd: ['jenkins'],
            insideDocker: false,
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.jenkins);
      });
      it("doesn't contain Docker, Sonar, Heroku", () => {
        runResult.assertNoFileContent('Jenkinsfile', /docker/);
        runResult.assertNoFileContent('Jenkinsfile', /sonar/);
        runResult.assertNoFileContent('Jenkinsfile', /heroku/);
        runResult.assertNoFileContent('Jenkinsfile', /snyk/);
      });
    });
    describe('Jenkins: Gradle Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            ciCd: ['jenkins'],
            insideDocker: false,
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.jenkins);
      });
      it("doesn't contain Docker, Sonar, Heroku", () => {
        runResult.assertNoFileContent('Jenkinsfile', /docker/);
        runResult.assertNoFileContent('Jenkinsfile', /sonar/);
        runResult.assertNoFileContent('Jenkinsfile', /heroku/);
        runResult.assertNoFileContent('Jenkinsfile', /snyk/);
      });
    });
    describe('Jenkins: Maven Angular NPM with full options', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            ciCd: ['jenkins'],
            insideDocker: false,
            ciCdIntegrations: ['deploy', 'sonar', 'publishDocker', 'heroku', 'snyk'],
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarName: 'sonarName',
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.jenkins);
      });
      it('contains Docker, Sonar, Heroku', () => {
        runResult.assertFileContent('Jenkinsfile', /sonar/);
        runResult.assertFileContent('Jenkinsfile', /heroku/);
        runResult.assertFileContent('Jenkinsfile', /def dockerImage/);
        runResult.assertFileContent('Jenkinsfile', /snyk/);
      });
      it('contains distributionManagement in pom.xml', () => {
        runResult.assertFileContent('pom.xml', /distributionManagement/);
      });
    });
    describe('Jenkins: Maven Angular NPM inside Docker', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            ciCd: ['jenkins'],
            insideDocker: true,
            ciCdIntegrations: ['deploy', 'sonar', 'publishDocker', 'heroku', 'snyk'],
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarName: 'sonarName',
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.jenkins);
      });
      it('contains Docker, Sonar, Heroku, dockerImage', () => {
        runResult.assertFileContent('Jenkinsfile', /docker/);
        runResult.assertFileContent('Jenkinsfile', /sonar/);
        runResult.assertFileContent('Jenkinsfile', /heroku/);
        runResult.assertFileContent('Jenkinsfile', /def dockerImage/);
        runResult.assertFileContent('Jenkinsfile', /snyk/);
      });
    });
  });

  //--------------------------------------------------
  // GitLab CI tests
  //--------------------------------------------------
  describe('GitLab CI tests', () => {
    describe('GitLab CI: Maven Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            ciCd: ['gitlab'],
            insideDocker: false,
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.gitlab);
      });
      it("doesn't contain image: jhipster, Sonar, Heroku", () => {
        runResult.assertNoFileContent('.gitlab-ci.yml', /image: jhipster/);
        runResult.assertNoFileContent('.gitlab-ci.yml', /sonar/);
        runResult.assertNoFileContent('.gitlab-ci.yml', /heroku/);
        runResult.assertNoFileContent('.gitlab-ci.yml', /snyk/);
      });
    });
    describe('GitLab CI: Gradle Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            ciCd: ['gitlab'],
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.gitlab);
      });
      it("doesn't contain jhipster/jhipster, Sonar, Heroku", () => {
        runResult.assertNoFileContent('.gitlab-ci.yml', /image: jhipster/);
        runResult.assertNoFileContent('.gitlab-ci.yml', /sonar/);
        runResult.assertNoFileContent('.gitlab-ci.yml', /heroku/);
        runResult.assertNoFileContent('.gitlab-ci.yml', /snyk/);
      });
    });
    describe('GitLab CI: npm skip server', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(skipServerSample)
          .withAnswers({
            ciCd: ['gitlab'],
            insideDocker: true,
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.gitlab);
      });
      it('contains image: jhipster', () => {
        runResult.assertFileContent('.gitlab-ci.yml', /image: jhipster/);
      });
    });
    describe('GitLab CI: Maven Angular NPM with full options', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            ciCd: ['gitlab'],
            insideDocker: false,
            ciCdIntegrations: ['deploy', 'sonar', 'heroku', 'snyk'],
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarUrl: 'http://localhost:9000',
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.gitlab);
      });
      it('contains Sonar, Heroku', () => {
        runResult.assertNoFileContent('.gitlab-ci.yml', /image: jhipster/);
        runResult.assertFileContent('.gitlab-ci.yml', /sonar/);
        runResult.assertFileContent('.gitlab-ci.yml', /heroku/);
        runResult.assertFileContent('.gitlab-ci.yml', /snyk/);
      });
      it('contains distributionManagement in pom.xml', () => {
        runResult.assertFileContent('pom.xml', /distributionManagement/);
      });
    });
    describe('GitLab CI: Maven Angular NPM inside Docker', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            ciCd: ['gitlab'],
            insideDocker: true,
            ciCdIntegrations: ['deploy', 'sonar', 'heroku', 'snyk'],
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarUrl: 'http://localhost:9000',
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.gitlab);
      });
      it('contains image: jhipster, Sonar, Heroku', () => {
        runResult.assertFileContent('.gitlab-ci.yml', /image: jhipster/);
        runResult.assertFileContent('.gitlab-ci.yml', /sonar/);
        runResult.assertFileContent('.gitlab-ci.yml', /heroku/);
        runResult.assertFileContent('.gitlab-ci.yml', /snyk/);
      });
      it('contains distributionManagement in pom.xml', () => {
        runResult.assertFileContent('pom.xml', /distributionManagement/);
      });
    });
    describe('GitLab CI: Maven Angular Yarn inside Docker Autoconfigure', () => {
      before(async () => {
        await helpers.runJHipster(GENERATOR_CI_CD).withJHipsterConfig(mavenSample).withArguments(['gitlab']).withAnswers({
          insideDocker: true,
        });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.gitlab);
      });
      it('contains image: jhipster, Sonar, Heroku', () => {
        runResult.assertFileContent('.gitlab-ci.yml', /image: jhipster/);
        runResult.assertNoFileContent('.gitlab-ci.yml', /sonar/);
        runResult.assertNoFileContent('.gitlab-ci.yml', /heroku/);
        runResult.assertNoFileContent('.gitlab-ci.yml', /snyk/);
      });
    });
  });

  //--------------------------------------------------
  // Travis CI tests
  //--------------------------------------------------
  describe('Travis CI tests', () => {
    describe('Travis CI: Maven Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            ciCd: ['travis'],
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.travis);
      });
      it("doesn't contain Sonar, Heroku", () => {
        runResult.assertNoFileContent('.travis.yml', /sonar/);
        runResult.assertNoFileContent('.travis.yml', /heroku/);
      });
    });
    describe('Travis CI: Gradle Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            ciCd: ['travis'],
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.travis);
      });
      it("doesn't contain Sonar, Heroku", () => {
        runResult.assertNoFileContent('.travis.yml', /sonar/);
        runResult.assertNoFileContent('.travis.yml', /heroku/);
      });
      it('contains Cypress', () => {
        runResult.assertFileContent('.travis.yml', /run ci:e2e:package/);
        runResult.assertFileContent('.travis.yml', /CYPRESS_ENABLE_RECORD: false/);
      });
    });
    describe('Travis CI: Maven Angular NPM with full options', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            ciCd: ['travis'],
            ciCdIntegrations: ['deploy', 'sonar', 'heroku', 'snyk', 'cypressDashboard'],
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarUrl: 'http://localhost:9000',
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.travis);
      });
      it('contains Sonar, Heroku, Snyk', () => {
        runResult.assertFileContent('.travis.yml', /sonar/);
        runResult.assertFileContent('.travis.yml', /heroku/);
        runResult.assertFileContent('.travis.yml', /snyk/);
      });
      it('contains distributionManagement in pom.xml', () => {
        runResult.assertFileContent('pom.xml', /distributionManagement/);
      });
      it('contains Cypress', () => {
        runResult.assertFileContent('.travis.yml', /run ci:e2e:package/);
        runResult.assertFileContent('.travis.yml', /CYPRESS_ENABLE_RECORD: true/);
      });
    });
  });

  //--------------------------------------------------
  // Azure Pipelines tests
  //--------------------------------------------------
  describe('Azure Pipelines tests', () => {
    describe('Azure Pipelines: Maven Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            ciCd: ['azure'],
            ciCdIntegrations: ['cypressDashboard'],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.azure);
      });
      it('contains Cypress', () => {
        runResult.assertFileContent('azure-pipelines.yml', /run ci:e2e:package/);
        runResult.assertFileContent('azure-pipelines.yml', /CYPRESS_ENABLE_RECORD: true/);
        runResult.assertFileContent('azure-pipelines.yml', /CYPRESS_PROJECT_ID/);
        runResult.assertFileContent('azure-pipelines.yml', /CYPRESS_RECORD_KEY/);
      });
    });
    describe('Azure Pipelines: Gradle Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            ciCd: ['azure'],
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.azure);
      });
      it('contains Cypress', () => {
        runResult.assertFileContent('azure-pipelines.yml', /run ci:e2e:package/);
        runResult.assertFileContent('azure-pipelines.yml', /CYPRESS_ENABLE_RECORD: false/);
      });
    });
    describe('Azure Pipelines: Maven Angular NPM with Snyk', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            ciCd: ['azure'],
            ciCdIntegrations: ['snyk'],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.azure);
      });
      it('contains Snyk', () => {
        runResult.assertFileContent('azure-pipelines.yml', /snyk/);
      });
    });
    describe('Azure Pipelines: Gradle Angular NPM with Snyk', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            ciCd: ['azure'],
            ciCdIntegrations: ['snyk'],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.azure);
      });
      it('contains Snyk', () => {
        runResult.assertFileContent('azure-pipelines.yml', /snyk/);
      });
    });
    describe('Azure Pipelines: autoconfigure', () => {
      before(async () => {
        await helpers.runJHipster(GENERATOR_CI_CD).withJHipsterConfig(mavenSample).withArguments(['azure']);
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.azure);
      });
    });
  });

  //--------------------------------------------------
  // GitHub Actions tests
  //--------------------------------------------------
  describe('GitHub Actions tests', () => {
    describe('GitHub Actions: Maven Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            ciCd: ['github'],
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.github);
      });
    });
    describe('GitHub Actions: Gradle Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            ciCd: ['github'],
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.github);
      });
    });
    describe('GitHub Actions: Maven Angular NPM with full options', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withFiles({ 'pom.xml': pomFile })
          .withAnswers({
            ciCd: ['github'],
            ciCdIntegrations: ['deploy', 'sonar', 'publishDocker', 'heroku', 'snyk', 'cypressDashboard'],
            dockerImage: 'jhipster-publish-docker',
            artifactorySnapshotsId: 'snapshots',
            artifactorySnapshotsUrl: 'http://artifactory:8081/artifactory/libs-snapshot',
            artifactoryReleasesId: 'releases',
            artifactoryReleasesUrl: 'http://artifactory:8081/artifactory/libs-release',
            sonarUrl: 'http://sonar.com:9000',
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.github);
      });
      it('contains Docker, Sonar, Heroku, Snyk', () => {
        runResult.assertFileContent('.github/workflows/main.yml', /mvnw.*sonar.com/);
        runResult.assertFileContent('.github/workflows/main.yml', /mvnw.*jhipster-publish-docker/);
        runResult.assertFileContent('.github/workflows/main.yml', /mvnw.*sample-mysql/);
        runResult.assertFileContent('.github/workflows/main.yml', /snyk/);
      });
      it('contains distributionManagement in pom.xml', () => {
        runResult.assertFileContent('pom.xml', /distributionManagement/);
      });
      it('contains Cypress', () => {
        runResult.assertFileContent('.github/workflows/main.yml', /run ci:e2e:package/);
        runResult.assertFileContent('.github/workflows/main.yml', /CYPRESS_ENABLE_RECORD: true/);
        runResult.assertFileContent('.github/workflows/main.yml', /CYPRESS_PROJECT_ID/);
        runResult.assertFileContent('.github/workflows/main.yml', /CYPRESS_RECORD_KEY/);
      });
    });
    describe('GitHub Actions: Gradle Angular NPM with full options', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            ciCd: ['github'],
            ciCdIntegrations: ['sonar', 'publishDocker', 'heroku', 'snyk'],
            dockerImage: 'jhipster-publish-docker',
            sonarUrl: 'http://sonar.com:9000',
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.github);
      });
      it('contains Docker, Sonar, Heroku', () => {
        runResult.assertFileContent('.github/workflows/main.yml', /gradlew.*jhipster-publish-docker/);
        runResult.assertFileContent('.github/workflows/main.yml', /gradlew.*sonar.com/);
        runResult.assertFileContent('.github/workflows/main.yml', /gradlew.*deployHeroku/);
        runResult.assertFileContent('.github/workflows/main.yml', /snyk/);
      });
      it('contains Cypress', () => {
        runResult.assertFileContent('.github/workflows/main.yml', /run ci:e2e:package/);
        runResult.assertFileContent('.github/workflows/main.yml', /CYPRESS_ENABLE_RECORD: false/);
        runResult.assertFileContent('.github/workflows/main.yml', /CYPRESS_PROJECT_ID/);
        runResult.assertFileContent('.github/workflows/main.yml', /CYPRESS_RECORD_KEY/);
      });
    });
    describe('GitHub Actions: autoconfigure', () => {
      before(async () => {
        await helpers.runJHipster(GENERATOR_CI_CD).withJHipsterConfig(mavenSample).withArguments(['github']);
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.github);
      });
    });
  });

  //--------------------------------------------------
  // Circle CI tests
  //--------------------------------------------------
  describe('Circle CI test', () => {
    describe('Circle CI: Maven Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            ciCd: ['circle'],
            ciCdIntegrations: ['cypressDashboard'],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.circle);
        runResult.assertNoFile(expectedFiles.jenkins);
        runResult.assertNoFile(expectedFiles.travis);
        runResult.assertNoFile(expectedFiles.gitlab);
      });
      it('contains Cypress', () => {
        runResult.assertFileContent('.circleci/config.yml', /run ci:e2e:package/);
        runResult.assertFileContent('.circleci/config.yml', /CYPRESS_ENABLE_RECORD: true/);
      });
    });
    describe('Circle CI: Gradle Angular NPM', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            ciCd: ['circle'],
            ciCdIntegrations: [],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.circle);
        runResult.assertNoFile(expectedFiles.jenkins);
        runResult.assertNoFile(expectedFiles.travis);
        runResult.assertNoFile(expectedFiles.gitlab);
      });
      it('contains Cypress', () => {
        runResult.assertFileContent('.circleci/config.yml', /run ci:e2e:package/);
        runResult.assertFileContent('.circleci/config.yml', /CYPRESS_ENABLE_RECORD: false/);
      });
    });
    describe('Circle CI: Maven with Snyk', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(mavenSample)
          .withAnswers({
            ciCd: ['circle'],
            ciCdIntegrations: ['snyk'],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.circle);
      });
      it('contains Snyk', () => {
        runResult.assertFileContent('.circleci/config.yml', /snyk/);
      });
    });
    describe('Circle CI: Gradle with Snyk', () => {
      before(async () => {
        await helpers
          .runJHipster(GENERATOR_CI_CD)
          .withJHipsterConfig(gradleSample)
          .withAnswers({
            ciCd: ['circle'],
            ciCdIntegrations: ['snyk'],
          });
      });
      it('should match files snapshot', function () {
        expect(runResult.getSnapshot()).toMatchSnapshot();
      });
      it('creates expected files', () => {
        runResult.assertFile(expectedFiles.circle);
      });
      it('contains Snyk', () => {
        runResult.assertFileContent('.circleci/config.yml', /snyk/);
      });
    });
  });
});
