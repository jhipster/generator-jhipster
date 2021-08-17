const expect = require('expect');
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const getFilesForOptions = require('./utils/utils').getFilesForOptions;
const expectedFiles = require('./utils/expected-files');
const reactFiles = require('../generators/client/files-react').files;
const { SQL, H2_MEMORY, POSTGRESQL } = require('../jdl/jhipster/database-types');
const { ANGULAR_X, REACT } = require('../jdl/jhipster/client-framework-types');
const { JWT } = require('../jdl/jhipster/authentication-types');
const { EHCACHE } = require('../jdl/jhipster/cache-types');
const { MAVEN } = require('../jdl/jhipster/build-tool-types');

const outputPathCustomizer = paths => (paths ? paths.replace(/^src\/main\/webapp([$/])/, 'src/main/webapp2$1') : undefined);

const clientTestPathCustomizer = paths => (paths ? paths.replace(/^src\/main\/javascript([$/])/, 'src/main/javascript2$1') : undefined);

const applyCustomizers = paths => clientTestPathCustomizer(outputPathCustomizer(paths));

describe('JHipster generator', () => {
  context('Default configuration with', () => {
    describe('AngularX', () => {
      let runResult;
      before(async () => {
        runResult = await helpers
          .create(path.join(__dirname, '../generators/app'))
          .withEnvironment(env => {
            env.sharedOptions.outputPathCustomizer = [outputPathCustomizer, clientTestPathCustomizer];
            return env;
          })
          .withOptions({
            fromCli: true,
            skipInstall: true,
            skipChecks: true,
            jhiPrefix: 'test',
          })
          .withPrompts({
            baseName: 'jhipster',
            clientFramework: ANGULAR_X,
            packageName: 'com.mycompany.myapp',
            packageFolder: 'com/mycompany/myapp',
            serviceDiscoveryType: false,
            authenticationType: JWT,
            cacheProvider: EHCACHE,
            enableHibernateCache: true,
            databaseType: SQL,
            devDatabaseType: H2_MEMORY,
            prodDatabaseType: POSTGRESQL,
            enableTranslation: true,
            nativeLanguage: 'en',
            languages: ['fr'],
            buildTool: MAVEN,
            rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
            skipClient: false,
            skipUserManagement: false,
            serverSideOptions: [],
          })
          .run();
      });

      it('creates expected default files for angularX', () => {
        expect(runResult.getStateSnapshot()).toMatchSnapshot();
      });
      it('outputPathCustomizer converts webapp to webapp2', () => {
        assert.equal(applyCustomizers('src/main/webapp/foo'), 'src/main/webapp2/foo');
        assert.equal(applyCustomizers('src/main/javascript/foo'), 'src/main/javascript2/foo');
      });
      it('contains clientFramework with angularX value', () => {
        assert.fileContent('.yo-rc.json', /"clientFramework": "angularX"/);
      });
      it('contains correct custom prefix when specified', () => {
        assert.fileContent('angular.json', /"prefix": "test"/);
      });
      it('generates a README with no undefined value', () => {
        assert.noFileContent('README.md', /undefined/);
      });
      it('uses correct prettier formatting', () => {
        // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
        assert.fileContent('webpack/webpack.custom.js', / {2}\/\/ PLUGINS/);
      });
    });

    describe('React', () => {
      before(done => {
        helpers
          .run(path.join(__dirname, '../generators/app'))
          .withEnvironment(env => {
            env.sharedOptions.outputPathCustomizer = [outputPathCustomizer, clientTestPathCustomizer];
            return env;
          })
          .withOptions({
            fromCli: true,
            skipInstall: true,
            skipChecks: true,
            jhiPrefix: 'test',
            experimental: true,
          })
          .withPrompts({
            baseName: 'jhipster',
            clientFramework: REACT,
            packageName: 'com.mycompany.myapp',
            packageFolder: 'com/mycompany/myapp',
            serviceDiscoveryType: false,
            authenticationType: JWT,
            cacheProvider: EHCACHE,
            enableHibernateCache: true,
            databaseType: SQL,
            devDatabaseType: H2_MEMORY,
            prodDatabaseType: POSTGRESQL,
            enableTranslation: true,
            nativeLanguage: 'en',
            languages: ['fr'],
            buildTool: MAVEN,
            rememberMeKey: '5c37379956bd1242f5636c8cb322c2966ad81277',
            skipClient: false,
            skipUserManagement: false,
            serverSideOptions: [],
          })
          .on('end', done);
      });

      it('creates expected default files for react', () => {
        assert.file(expectedFiles.common.map(applyCustomizers));
        assert.file(expectedFiles.server.map(applyCustomizers));
        assert.file(expectedFiles.userManagementServer.map(applyCustomizers));
        assert.file(expectedFiles.jwtServer.map(applyCustomizers));
        assert.file(expectedFiles.maven.map(applyCustomizers));
        assert.file(expectedFiles.dockerServices.map(applyCustomizers));
        assert.file(expectedFiles.postgresql.map(applyCustomizers));
        assert.file(expectedFiles.hibernateTimeZoneConfig.map(applyCustomizers));
        assert.file(
          getFilesForOptions(reactFiles, {
            outputPathCustomizer: applyCustomizers,
            enableTranslation: true,
            serviceDiscoveryType: false,
            authenticationType: JWT,
            testFrameworks: [],
          })
        );
      });
      it('contains clientFramework with react value', () => {
        assert.fileContent('.yo-rc.json', /"clientFramework": "react"/);
      });
      it('uses correct prettier formatting', () => {
        // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
        assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
        assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
      });
    });
  });
});
