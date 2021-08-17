const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('../generators/generator-constants');

const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const CLIENT_SPEC_SRC_DIR = `${CLIENT_TEST_SRC_DIR}spec/`;
const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;
const { MONOLITH } = require('../jdl/jhipster/application-types');
const { VUE } = require('../jdl/jhipster/client-framework-types');
const { JWT, OAUTH2, SESSION } = require('../jdl/jhipster/authentication-types');
const { EHCACHE } = require('../jdl/jhipster/cache-types');
const { PROTRACTOR, CYPRESS } = require('../jdl/jhipster/test-framework-types');
const { SQL, H2_DISK, POSTGRESQL } = require('../jdl/jhipster/database-types');
const { MAVEN, GRADLE } = require('../jdl/jhipster/build-tool-types');

const expectedFiles = {
  i18n: [
    `${CLIENT_MAIN_SRC_DIR}app/locale/translation.service.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/shared/config/store/translation-store.ts`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/activate.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/error.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/login.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/home.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/password.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/register.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/sessions.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/settings.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/reset.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/user-management.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/activate.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/error.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/login.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/home.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/password.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/register.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/sessions.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/settings.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/reset.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/user-management.json`,
  ],

  i18nAdmin: [
    `${CLIENT_MAIN_SRC_DIR}i18n/en/configuration.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/health.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/logs.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/en/metrics.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/configuration.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/health.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/metrics.json`,
    `${CLIENT_MAIN_SRC_DIR}i18n/fr/logs.json`,
  ],

  common: [
    '.editorconfig',
    '.gitattributes',
    '.gitignore',
    '.prettierrc',
    '.prettierignore',
    'README.md',
    `${SERVER_MAIN_RES_DIR}banner.txt`,
  ],

  session: [
    `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.vue`,
    `${CLIENT_SPEC_SRC_DIR}app/account/sessions/sessions.component.spec.ts`,
  ],

  allAuthExceptOAuth2: [
    `${CLIENT_MAIN_SRC_DIR}app/account/change-password/change-password.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/account/change-password/change-password.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/account/login-form/login-form.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/account/login-form/login-form.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/account/activate/activate.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/account/activate/activate.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/account/activate/activate.service.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/account/register/register.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/account/register/register.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/account/register/register.service.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/account/reset-password/init/reset-password-init.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/account/reset-password/init/reset-password-init.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/account/reset-password/finish/reset-password-finish.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/account/reset-password/finish/reset-password-finish.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/account/settings/settings.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/account/settings/settings.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-edit.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-edit.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.service.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-view.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-view.vue`,

    `${CLIENT_SPEC_SRC_DIR}app/account/change-password/change-password.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/account/login-form/login-form.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/account/activate/activate.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/account/register/register.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/account/reset-password/init/reset-password-init.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/account/reset-password/finish/reset-password-finish.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/account/settings/settings.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/admin/user-management/user-management.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/admin/user-management/user-management-edit.component.spec.ts`,
    // `${CLIENT_SPEC_SRC_DIR}app/admin/user-management/user-management.service.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/admin/user-management/user-management-view.component.spec.ts`,
  ],

  admin: [
    `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.service.ts`,

    `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/health/health-modal.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/health/health-modal.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/health/health.service.ts`,

    `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/logs/logs.service.ts`,

    `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics-modal.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics-modal.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/metrics/metrics.service.ts`,

    `${CLIENT_SPEC_SRC_DIR}app/admin/metrics/metrics.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/admin/metrics/metrics-modal.component.spec.ts`,
    // `${CLIENT_SPEC_SRC_DIR}app/admin/metrics/metrics.service.spec.ts`,

    `${CLIENT_SPEC_SRC_DIR}app/admin/logs/logs.component.spec.ts`,
    // `${CLIENT_SPEC_SRC_DIR}app/admin/logs/logs.service.spec.ts`,

    `${CLIENT_SPEC_SRC_DIR}app/admin/configuration/configuration.component.spec.ts`,

    `${CLIENT_SPEC_SRC_DIR}app/admin/health/health.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/admin/health/health-modal.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/admin/health/health.service.spec.ts`,
  ],
  app: [
    `${CLIENT_MAIN_SRC_DIR}app/account/account.service.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/docs/docs.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/docs/docs.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/account/login.service.ts`,

    `${CLIENT_SPEC_SRC_DIR}app/account/account.service.spec.ts`,

    `${CLIENT_MAIN_SRC_DIR}app/core/home/home.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/core/home/home.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/core/error/error.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/core/error/error.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/core/jhi-footer/jhi-footer.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/core/jhi-footer/jhi-footer.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/core/jhi-navbar/jhi-navbar.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/core/jhi-navbar/jhi-navbar.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/core/ribbon/ribbon.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/core/ribbon/ribbon.vue`,

    `${CLIENT_SPEC_SRC_DIR}app/core/error/error.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/core/home/home.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/core/jhi-navbar/jhi-navbar.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/core/ribbon/ribbon.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/shared/config/axios-interceptor.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/shared/data/data-utils.service.spec.ts`,

    `${CLIENT_MAIN_SRC_DIR}app/shared/config/axios-interceptor.ts`,

    `${CLIENT_MAIN_SRC_DIR}app/router/index.ts`,

    `${CLIENT_MAIN_SRC_DIR}app/shared/data/data-utils.service.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/shared/date/filters.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/shared/config/config.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/shared/config/config-bootstrap-vue.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/shared/config/dayjs.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/shared/config/store/account-store.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/shared/jhi-item-count.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/shared/jhi-item-count.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/shared/model/user.model.ts`,

    `${CLIENT_MAIN_SRC_DIR}app/app.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/app.vue`,
    `${CLIENT_MAIN_SRC_DIR}app/constants.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/shims-vue.d.ts`,

    `${CLIENT_MAIN_SRC_DIR}WEB-INF/web.xml`,
  ],

  websocket: [
    `${CLIENT_MAIN_SRC_DIR}app/admin/tracker/tracker.component.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/tracker/tracker.service.ts`,
    `${CLIENT_MAIN_SRC_DIR}app/admin/tracker/tracker.vue`,

    `${CLIENT_SPEC_SRC_DIR}app/admin/tracker/tracker.component.spec.ts`,
    `${CLIENT_SPEC_SRC_DIR}app/admin/tracker/tracker.service.spec.ts`,
  ],

  test: [`${CLIENT_TEST_SRC_DIR}jest.conf.js`],

  protractor: [
    `${CLIENT_TEST_SRC_DIR}e2e/modules/account/account.spec.ts`,
    `${CLIENT_TEST_SRC_DIR}e2e/modules/administration/administration.spec.ts`,
    `${CLIENT_TEST_SRC_DIR}e2e/page-objects/navbar-page.ts`,
    `${CLIENT_TEST_SRC_DIR}e2e/page-objects/password-page.ts`,
    `${CLIENT_TEST_SRC_DIR}e2e/page-objects/register-page.ts`,
    `${CLIENT_TEST_SRC_DIR}e2e/page-objects/settings-page.ts`,
    `${CLIENT_TEST_SRC_DIR}e2e/page-objects/signin-page.ts`,
    `${CLIENT_TEST_SRC_DIR}e2e/util/utils.ts`,
    `${CLIENT_TEST_SRC_DIR}protractor.conf.js`,
  ],

  webpack: [
    `${CLIENT_WEBPACK_DIR}/loader.conf.js`,
    `${CLIENT_WEBPACK_DIR}/utils.js`,
    `${CLIENT_WEBPACK_DIR}/vue.utils.js`,
    `${CLIENT_WEBPACK_DIR}/webpack.common.js`,
    `${CLIENT_WEBPACK_DIR}/webpack.dev.js`,
    `${CLIENT_WEBPACK_DIR}/webpack.prod.js`,
  ],
};

describe('Vue applications', () => {
  describe('Default with Maven', () => {
    before(done => {
      helpers
        .run(path.join(__dirname, '../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
        })
        .withPrompts({
          baseName: 'samplePsql',
          packageName: 'com.mycompany.myapp',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: JWT,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['en', 'fr'],
          buildTool: MAVEN,
          clientFramework: VUE,
          clientTheme: 'none',
        })
        .on('end', done);
    });
    it('creates expected files from jhipster Vue generator', () => {
      assert.file(expectedFiles.i18n);
      assert.file(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.allAuthExceptOAuth2);
      assert.noFile(expectedFiles.session);
      assert.noFile([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
      assert.file(expectedFiles.test);
      assert.noFile(expectedFiles.protractor);
      assert.file(expectedFiles.webpack);
    });
    it('contains the specific change added by the blueprint', () => {
      assert.fileContent('package.json', '"vue"');
      assert.fileContent('package.json', '"vuex"');
      assert.fileContent('package.json', '"vuelidate"');
      assert.fileContent('.prettierrc', 'tabWidth: 2');
    });
    it('uses correct prettier formatting', () => {
      // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
      assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
      assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
    });
    it('uses default JHipster theme', () => {
      assert.noFileContent('src/main/webapp/content/scss/vendor.scss', "@import '~bootswatch/dist/");
    });
  });
  describe('Default with Gradle', () => {
    before(done => {
      helpers
        .run(path.join(__dirname, '../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
        })
        .withPrompts({
          baseName: 'samplePsql',
          packageName: 'com.mycompany.myapp',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: JWT,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['en', 'fr'],
          buildTool: GRADLE,
          clientFramework: VUE,
          clientTheme: 'none',
        })
        .on('end', done);
    });
    it('creates expected files from jhipster Vue generator', () => {
      assert.file(expectedFiles.i18n);
      assert.file(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.allAuthExceptOAuth2);
      assert.noFile(expectedFiles.session);
      assert.noFile([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
      assert.file(expectedFiles.test);
      assert.noFile(expectedFiles.protractor);
      assert.file(expectedFiles.webpack);
    });
    it('contains the specific change added by the blueprint', () => {
      assert.fileContent('package.json', '"vue"');
      assert.fileContent('package.json', '"vuex"');
      assert.fileContent('package.json', '"vuelidate"');
      assert.fileContent('.prettierrc', 'tabWidth: 2');
    });
    it('uses correct prettier formatting', () => {
      // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
      assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
      assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
    });
    it('uses default JHipster theme', () => {
      assert.noFileContent('src/main/webapp/content/scss/vendor.scss', "@import '~bootswatch/dist/");
    });
  });

  describe('noi18n with Session Maven', () => {
    before(done => {
      helpers
        .run(path.join(__dirname, '../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
        })
        .withPrompts({
          baseName: 'samplePsql',
          packageName: 'com.mycompany.myapp',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: SESSION,
          enableTranslation: false,
          nativeLanguage: 'en',
          buildTool: MAVEN,
          clientFramework: VUE,
          clientTheme: 'none',
        })
        .on('end', done);
    });
    it('creates expected files from jhipster Vue generator', () => {
      assert.noFile(expectedFiles.i18n);
      assert.noFile(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.session);
      assert.file([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
      assert.file(expectedFiles.allAuthExceptOAuth2);
      assert.file(expectedFiles.test);
      assert.noFile(expectedFiles.protractor);
      assert.file(expectedFiles.webpack);
    });
    it('contains the specific change added by the blueprint', () => {
      assert.fileContent('package.json', '"vue"');
      assert.fileContent('package.json', '"vuex"');
      assert.fileContent('package.json', '"vuelidate"');
      assert.fileContent('.prettierrc', 'tabWidth: 2');
    });
    it('uses correct prettier formatting', () => {
      // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
      assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
      assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
    });
    it('uses default JHipster theme', () => {
      assert.noFileContent('src/main/webapp/content/scss/vendor.scss', "@import '~bootswatch/dist/");
    });
  });
  describe('noi18n with OAuth2 Maven', () => {
    before(done => {
      helpers
        .run(path.join(__dirname, '../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
        })
        .withPrompts({
          baseName: 'samplePsql',
          packageName: 'com.mycompany.myapp',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: OAUTH2,
          enableTranslation: false,
          nativeLanguage: 'en',
          buildTool: MAVEN,
          clientFramework: VUE,
          clientTheme: 'none',
        })
        .on('end', done);
    });
    it('creates expected files from jhipster Vue generator', () => {
      assert.noFile(expectedFiles.i18n);
      assert.noFile(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.test);
      assert.file([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
      assert.noFile(expectedFiles.protractor);
      assert.noFile(expectedFiles.allAuthExceptOAuth2);
      assert.noFile(expectedFiles.session);
      assert.file(expectedFiles.webpack);
    });
    it('contains the specific change added by the blueprint', () => {
      assert.fileContent('package.json', '"vue"');
      assert.fileContent('package.json', '"vuex"');
      assert.fileContent('package.json', '"vuelidate"');
      assert.fileContent('.prettierrc', 'tabWidth: 2');
    });
    it('uses correct prettier formatting', () => {
      // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
      assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
      assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
    });
    it('uses default JHipster theme', () => {
      assert.noFileContent('src/main/webapp/content/scss/vendor.scss', "@import '~bootswatch/dist/");
    });
  });
  describe('Elasticsearch and Protractor', () => {
    before(done => {
      helpers
        .run(path.join(__dirname, '../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
        })
        .withPrompts({
          baseName: 'samplePsql',
          packageName: 'com.mycompany.myapp',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: JWT,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['en', 'fr'],
          testFrameworks: [PROTRACTOR],
          buildTool: MAVEN,
          clientFramework: VUE,
          serverSideOptions: ['searchEngine:elasticsearch'],
          clientTheme: 'none',
        })
        .on('end', done);
    });
    it('creates expected files from jhipster Vue generator', () => {
      assert.file(expectedFiles.i18n);
      assert.file(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.allAuthExceptOAuth2);
      assert.noFile(expectedFiles.session);
      assert.noFile([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
      assert.file(expectedFiles.test);
      assert.file(expectedFiles.protractor);
      assert.file(expectedFiles.webpack);
    });
    it('contains the specific change added by the blueprint', () => {
      assert.fileContent('package.json', '"vue"');
      assert.fileContent('package.json', '"vuex"');
      assert.fileContent('package.json', '"vuelidate"');
      assert.fileContent('.prettierrc', 'tabWidth: 2');
    });
    it('uses correct prettier formatting', () => {
      // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
      assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
      assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
    });
    it('uses default JHipster theme', () => {
      assert.noFileContent('src/main/webapp/content/scss/vendor.scss', "@import '~bootswatch/dist/");
    });
  });
  describe('Websocket', () => {
    before(done => {
      helpers
        .run(path.join(__dirname, '../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
        })
        .withPrompts({
          baseName: 'sampleWebsocket',
          packageName: 'tech.jhipster.sample',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: JWT,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['en', 'fr'],
          testFrameworks: [PROTRACTOR],
          buildTool: MAVEN,
          clientFramework: VUE,
          serverSideOptions: ['websocket:spring-websocket'],
          clientTheme: 'none',
        })
        .on('end', done);
    });
    it('creates expected files from jhipster Vue generator', () => {
      assert.file(expectedFiles.i18n);
      assert.file(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.allAuthExceptOAuth2);
      assert.noFile(expectedFiles.session);
      assert.noFile([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
      assert.file(expectedFiles.test);
      assert.file(expectedFiles.protractor);
      assert.file(expectedFiles.websocket);
      assert.file(expectedFiles.webpack);
    });
    it('contains the specific change added by the blueprint', () => {
      assert.fileContent('package.json', '"vue"');
      assert.fileContent('package.json', '"vuex"');
      assert.fileContent('package.json', '"vuelidate"');
      assert.fileContent('.prettierrc', 'tabWidth: 2');
    });
    it('uses correct prettier formatting', () => {
      // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
      assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
      assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
    });
    it('uses default JHipster theme', () => {
      assert.noFileContent('src/main/webapp/content/scss/vendor.scss', "@import '~bootswatch/dist/");
    });
  });
  describe('OAuth2', () => {
    before(done => {
      helpers
        .run(path.join(__dirname, '../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
        })
        .withPrompts({
          baseName: 'samplePsql',
          packageName: 'com.mycompany.myapp',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: OAUTH2,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['en', 'fr'],
          buildTool: MAVEN,
          clientFramework: VUE,
          clientTheme: 'none',
        })
        .on('end', done);
    });
    it('creates expected files from jhipster Vue generator', () => {
      assert.file(expectedFiles.i18n);
      assert.file(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.test);
      assert.file([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
      assert.noFile(expectedFiles.protractor);
      assert.noFile(expectedFiles.allAuthExceptOAuth2);
      assert.noFile(expectedFiles.session);
      assert.file(expectedFiles.webpack);
    });
    it('contains the specific change added by the blueprint', () => {
      assert.fileContent('package.json', '"vue"');
      assert.fileContent('package.json', '"vuex"');
      assert.fileContent('package.json', '"vuelidate"');
      assert.fileContent('.prettierrc', 'tabWidth: 2');
    });
    it('uses correct prettier formatting', () => {
      // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
      assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
      assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
    });
    it('uses default JHipster theme', () => {
      assert.noFileContent('src/main/webapp/content/scss/vendor.scss', "@import '~bootswatch/dist/");
    });
  });
  describe('Client theme', () => {
    before(() => {
      return helpers
        .create(path.join(__dirname, '../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
          skipChecks: true,
        })
        .withPrompts({
          baseName: 'samplePsql',
          packageName: 'com.mycompany.myapp',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: JWT,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['en', 'fr'],
          buildTool: MAVEN,
          clientFramework: VUE,
          clientTheme: 'lux',
          clientThemeVariant: 'primary',
        })
        .run();
    });
    it('creates expected files from jhipster Vue generator', () => {
      assert.file(expectedFiles.i18n);
      assert.file(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.allAuthExceptOAuth2);
      assert.file(expectedFiles.test);
      assert.noFile(expectedFiles.session);
      assert.noFile(expectedFiles.protractor);
      assert.file(expectedFiles.webpack);
    });
    it('contains the specific change added by the blueprint', () => {
      assert.fileContent('package.json', '"vue"');
      assert.fileContent('package.json', '"vuex"');
      assert.fileContent('package.json', '"vuelidate"');
      assert.fileContent('.prettierrc', 'tabWidth: 2');
    });
    it('uses correct theme from bootswatch', () => {
      assert.fileContent('src/main/webapp/content/scss/vendor.scss', "@import '~bootswatch/dist/lux/variables';");
      assert.fileContent('src/main/webapp/content/scss/vendor.scss', "@import '~bootswatch/dist/lux/bootswatch';");
    });
  });

  describe('Admin UI selected', () => {
    let runResult;
    before(() => {
      return helpers
        .create(require.resolve('../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
        })
        .withPrompts({
          baseName: 'samplePsql',
          packageName: 'com.mycompany.myapp',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: JWT,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['en', 'fr'],
          buildTool: MAVEN,
          clientFramework: VUE,
          clientTheme: 'none',
          testFrameworks: [CYPRESS],
        })
        .run()
        .then(result => {
          runResult = result;
        });
    });

    after(() => runResult.cleanup());

    it('should have admin ui components', () => {
      assert.file(expectedFiles.i18n);
      assert.file(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.file(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.allAuthExceptOAuth2);
      assert.noFile(expectedFiles.session);
      assert.noFile([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
      assert.file(expectedFiles.test);
      assert.noFile(expectedFiles.protractor);
      assert.file(expectedFiles.webpack);
    });

    it('should contains admin ui menu', () => {
      assert.fileContent(
        `${CLIENT_MAIN_SRC_DIR}app/core/jhi-navbar/jhi-navbar.vue`,
        '<b-dropdown-item to="/admin/metrics" active-class="active">\n' +
          '            <font-awesome-icon icon="tachometer-alt" />\n' +
          '            <span v-text="$t(\'global.menu.admin.metrics\')">Metrics</span>\n' +
          '          </b-dropdown-item>\n' +
          '          <b-dropdown-item to="/admin/health" active-class="active">\n' +
          '            <font-awesome-icon icon="heart" />\n' +
          '            <span v-text="$t(\'global.menu.admin.health\')">Health</span>\n' +
          '          </b-dropdown-item>\n' +
          '          <b-dropdown-item to="/admin/configuration" active-class="active">\n' +
          '            <font-awesome-icon icon="cogs" />\n' +
          '            <span v-text="$t(\'global.menu.admin.configuration\')">Configuration</span>\n' +
          '          </b-dropdown-item>\n' +
          '          <b-dropdown-item to="/admin/logs" active-class="active">\n' +
          '            <font-awesome-icon icon="tasks" />\n' +
          '            <span v-text="$t(\'global.menu.admin.logs\')">Logs</span>\n' +
          '          </b-dropdown-item>'
      );
    });

    it('should contains admin service in main app file', () => {
      assert.fileContent(
        `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
        "import HealthService from './admin/health/health.service';\n" +
          "import MetricsService from './admin/metrics/metrics.service';\n" +
          "import LogsService from './admin/logs/logs.service';\n" +
          "import ConfigurationService from '@/admin/configuration/configuration.service';"
      );

      assert.fileContent(
        `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
        '    healthService: () => new HealthService(),\n' +
          '    configurationService: () => new ConfigurationService(),\n' +
          '    logsService: () => new LogsService(),\n' +
          '    metricsService: () => new MetricsService(),'
      );
    });

    it('should contains admin routes in admin router', () => {
      assert.fileContent(
        `${CLIENT_MAIN_SRC_DIR}app/router/admin.ts`,
        "const JhiConfigurationComponent = () => import('@/admin/configuration/configuration.vue');\n" +
          "const JhiHealthComponent = () => import('@/admin/health/health.vue');\n" +
          "const JhiLogsComponent = () => import('@/admin/logs/logs.vue');\n" +
          "const JhiMetricsComponent = () => import('@/admin/metrics/metrics.vue');"
      );

      assert.fileContent(
        `${CLIENT_MAIN_SRC_DIR}app/router/admin.ts`,
        '{\n' +
          "    path: '/admin/health',\n" +
          "    name: 'JhiHealthComponent',\n" +
          '    component: JhiHealthComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },\n' +
          '  {\n' +
          "    path: '/admin/logs',\n" +
          "    name: 'JhiLogsComponent',\n" +
          '    component: JhiLogsComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },\n' +
          '  {\n' +
          "    path: '/admin/metrics',\n" +
          "    name: 'JhiMetricsComponent',\n" +
          '    component: JhiMetricsComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },\n' +
          '  {\n' +
          "    path: '/admin/configuration',\n" +
          "    name: 'JhiConfigurationComponent',\n" +
          '    component: JhiConfigurationComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },'
      );
    });

    it('should contains admin ui cypress tests', () => {
      assert.fileContent(
        `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
        '  metricsPageHeadingSelector,\n' +
          '  healthPageHeadingSelector,\n' +
          '  logsPageHeadingSelector,\n' +
          '  configurationPageHeadingSelector,'
      );

      assert.fileContent(
        `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
        "  describe('/metrics', () => {\n" +
          "    it('should load the page', () => {\n" +
          "      cy.clickOnAdminMenuItem('metrics');\n" +
          "      cy.get(metricsPageHeadingSelector).should('be.visible');\n" +
          '    });\n' +
          '  });\n' +
          '\n' +
          "  describe('/health', () => {\n" +
          "    it('should load the page', () => {\n" +
          "      cy.clickOnAdminMenuItem('health');\n" +
          "      cy.get(healthPageHeadingSelector).should('be.visible');\n" +
          '    });\n' +
          '  });\n' +
          '\n' +
          "  describe('/logs', () => {\n" +
          "    it('should load the page', () => {\n" +
          "      cy.clickOnAdminMenuItem('logs');\n" +
          "      cy.get(logsPageHeadingSelector).should('be.visible');\n" +
          '    });\n' +
          '  });\n' +
          '\n' +
          "  describe('/configuration', () => {\n" +
          "    it('should load the page', () => {\n" +
          "      cy.clickOnAdminMenuItem('configuration');\n" +
          "      cy.get(configurationPageHeadingSelector).should('be.visible');\n" +
          '    });\n' +
          '  });'
      );

      assert.fileContent(
        `${CLIENT_TEST_SRC_DIR}cypress/support/commands.ts`,
        'export const metricsPageHeadingSelector = \'[data-cy="metricsPageHeading"]\';\n' +
          'export const healthPageHeadingSelector = \'[data-cy="healthPageHeading"]\';\n' +
          'export const logsPageHeadingSelector = \'[data-cy="logsPageHeading"]\';\n' +
          'export const configurationPageHeadingSelector = \'[data-cy="configurationPageHeading"]\';'
      );
    });
  });

  describe('Admin UI not selected', () => {
    let runResult;
    before(() => {
      return helpers
        .create(require.resolve('../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
        })
        .withPrompts({
          baseName: 'samplePsql',
          packageName: 'com.mycompany.myapp',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: JWT,
          enableTranslation: true,
          nativeLanguage: 'en',
          languages: ['en', 'fr'],
          buildTool: MAVEN,
          clientFramework: VUE,
          clientTheme: 'none',
          testFrameworks: ['cypress'],
          withAdminUi: false,
        })
        .run()
        .then(result => {
          runResult = result;
        });
    });

    after(() => runResult.cleanup());

    it('should not have admin ui components', () => {
      assert.file(expectedFiles.i18n);
      assert.noFile(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.noFile(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.allAuthExceptOAuth2);
      assert.noFile(expectedFiles.session);
      assert.noFile([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
      assert.file(expectedFiles.test);
      assert.noFile(expectedFiles.protractor);
      assert.file(expectedFiles.webpack);
    });

    it('should not contains admin ui menu', () => {
      assert.noFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/core/jhi-navbar/jhi-navbar.vue`,
        '<b-dropdown-item  to="/admin/metrics" active-class="active">\n' +
          '            <font-awesome-icon icon="tachometer-alt" />\n' +
          '            <span v-text="$t(\'global.menu.admin.metrics\')">Metrics</span>\n' +
          '          </b-dropdown-item>\n' +
          '          <b-dropdown-item to="/admin/health" active-class="active">\n' +
          '            <font-awesome-icon icon="heart" />\n' +
          '            <span v-text="$t(\'global.menu.admin.health\')">Health</span>\n' +
          '          </b-dropdown-item>\n' +
          '          <b-dropdown-item  to="/admin/configuration" active-class="active">\n' +
          '            <font-awesome-icon icon="cogs" />\n' +
          '            <span v-text="$t(\'global.menu.admin.configuration\')">Configuration</span>\n' +
          '          </b-dropdown-item>\n' +
          '          <b-dropdown-item  to="/admin/logs" active-class="active">\n' +
          '            <font-awesome-icon icon="tasks" />\n' +
          '            <span v-text="$t(\'global.menu.admin.logs\')">Logs</span>\n' +
          '          </b-dropdown-item>'
      );
    });

    it('should contains admin service in main app file', () => {
      assert.noFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
        "import HealthService from './admin/health/health.service';\n" +
          "import MetricsService from './admin/metrics/metrics.service';\n" +
          "import LogsService from './admin/logs/logs.service';\n" +
          "import ConfigurationService from '@/admin/configuration/configuration.service';"
      );

      assert.noFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
        '    healthService: () => new HealthService(),\n' +
          '    configurationService: () => new ConfigurationService(),\n' +
          '    logsService: () => new LogsService(),\n' +
          '    metricsService: () => new MetricsService(),'
      );
    });

    it('should not contains admin routes in admin router', () => {
      assert.noFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/router/admin.ts`,
        "const JhiConfigurationComponent = () => import('@/admin/configuration/configuration.vue');\n" +
          "const JhiHealthComponent = () => import('@/admin/health/health.vue');\n" +
          "const JhiLogsComponent = () => import('@/admin/logs/logs.vue');\n" +
          "const JhiMetricsComponent = () => import('@/admin/metrics/metrics.vue');"
      );

      assert.noFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/router/admin.ts`,
        '{\n' +
          "    path: '/admin/health',\n" +
          "    name: 'JhiHealthComponent',\n" +
          '    component: JhiHealthComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },\n' +
          '  {\n' +
          "    path: '/admin/logs',\n" +
          "    name: 'JhiLogsComponent',\n" +
          '    component: JhiLogsComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },\n' +
          '  {\n' +
          "    path: '/admin/metrics',\n" +
          "    name: 'JhiMetricsComponent',\n" +
          '    component: JhiMetricsComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },\n' +
          '  {\n' +
          "    path: '/admin/configuration',\n" +
          "    name: 'JhiConfigurationComponent',\n" +
          '    component: JhiConfigurationComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },'
      );
    });

    it('should not contains admin ui cypress tests', () => {
      assert.noFileContent(
        `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
        '  metricsPageHeadingSelector,\n' +
          '  healthPageHeadingSelector,\n' +
          '  logsPageHeadingSelector,\n' +
          '  configurationPageHeadingSelector,'
      );

      assert.noFileContent(
        `${CLIENT_TEST_SRC_DIR}cypress/support/commands.ts`,
        'export const metricsPageHeadingSelector = \'[data-cy="metricsPageHeading"]\';\n' +
          'export const healthPageHeadingSelector = \'[data-cy="healthPageHeading"]\';\n' +
          'export const logsPageHeadingSelector = \'[data-cy="logsPageHeading"]\';\n' +
          'export const configurationPageHeadingSelector = \'[data-cy="configurationPageHeading"]\';'
      );
    });
  });

  describe('noi18 and Admin UI not selected', () => {
    let runResult;
    before(() => {
      return helpers
        .create(require.resolve('../generators/app'))
        .withOptions({
          fromCli: true,
          skipInstall: true,
        })
        .withPrompts({
          baseName: 'samplePsql',
          packageName: 'com.mycompany.myapp',
          applicationType: MONOLITH,
          databaseType: SQL,
          devDatabaseType: H2_DISK,
          prodDatabaseType: POSTGRESQL,
          cacheProvider: EHCACHE,
          authenticationType: JWT,
          enableTranslation: false,
          nativeLanguage: 'en',
          buildTool: MAVEN,
          clientFramework: VUE,
          clientTheme: 'none',
          testFrameworks: ['cypress'],
          withAdminUi: false,
        })
        .run()
        .then(result => {
          runResult = result;
        });
    });

    after(() => runResult.cleanup());

    it('should not have admin ui components', () => {
      assert.noFile(expectedFiles.i18n);
      assert.noFile(expectedFiles.i18nAdmin);
      assert.file(expectedFiles.common);
      assert.noFile(expectedFiles.admin);
      assert.file(expectedFiles.app);
      assert.file(expectedFiles.allAuthExceptOAuth2);
      assert.noFile(expectedFiles.session);
      assert.noFile([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
      assert.file(expectedFiles.test);
      assert.noFile(expectedFiles.protractor);
      assert.file(expectedFiles.webpack);
    });

    it('should not contains admin ui menu', () => {
      assert.noFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/core/jhi-navbar/jhi-navbar.vue`,
        '<b-dropdown-item  to="/admin/metrics" active-class="active">\n' +
          '            <font-awesome-icon icon="tachometer-alt" />\n' +
          '            <span v-text="$t(\'global.menu.admin.metrics\')">Metrics</span>\n' +
          '          </b-dropdown-item>\n' +
          '          <b-dropdown-item to="/admin/health" active-class="active">\n' +
          '            <font-awesome-icon icon="heart" />\n' +
          '            <span v-text="$t(\'global.menu.admin.health\')">Health</span>\n' +
          '          </b-dropdown-item>\n' +
          '          <b-dropdown-item  to="/admin/configuration" active-class="active">\n' +
          '            <font-awesome-icon icon="cogs" />\n' +
          '            <span v-text="$t(\'global.menu.admin.configuration\')">Configuration</span>\n' +
          '          </b-dropdown-item>\n' +
          '          <b-dropdown-item  to="/admin/logs" active-class="active">\n' +
          '            <font-awesome-icon icon="tasks" />\n' +
          '            <span v-text="$t(\'global.menu.admin.logs\')">Logs</span>\n' +
          '          </b-dropdown-item>'
      );
    });

    it('should contains admin service in main app file', () => {
      assert.noFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
        "import HealthService from './admin/health/health.service';\n" +
          "import MetricsService from './admin/metrics/metrics.service';\n" +
          "import LogsService from './admin/logs/logs.service';\n" +
          "import ConfigurationService from '@/admin/configuration/configuration.service';"
      );

      assert.noFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
        '    healthService: () => new HealthService(),\n' +
          '    configurationService: () => new ConfigurationService(),\n' +
          '    logsService: () => new LogsService(),\n' +
          '    metricsService: () => new MetricsService(),'
      );
    });

    it('should not contains admin routes in admin router', () => {
      assert.noFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/router/admin.ts`,
        "const JhiConfigurationComponent = () => import('@/admin/configuration/configuration.vue');\n" +
          "const JhiHealthComponent = () => import('@/admin/health/health.vue');\n" +
          "const JhiLogsComponent = () => import('@/admin/logs/logs.vue');\n" +
          "const JhiMetricsComponent = () => import('@/admin/metrics/metrics.vue');"
      );

      assert.noFileContent(
        `${CLIENT_MAIN_SRC_DIR}app/router/admin.ts`,
        '{\n' +
          "    path: '/admin/health',\n" +
          "    name: 'JhiHealthComponent',\n" +
          '    component: JhiHealthComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },\n' +
          '  {\n' +
          "    path: '/admin/logs',\n" +
          "    name: 'JhiLogsComponent',\n" +
          '    component: JhiLogsComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },\n' +
          '  {\n' +
          "    path: '/admin/metrics',\n" +
          "    name: 'JhiMetricsComponent',\n" +
          '    component: JhiMetricsComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },\n' +
          '  {\n' +
          "    path: '/admin/configuration',\n" +
          "    name: 'JhiConfigurationComponent',\n" +
          '    component: JhiConfigurationComponent,\n' +
          '    meta: { authorities: [Authority.ADMIN] },\n' +
          '  },'
      );
    });

    it('should not contains admin ui cypress tests', () => {
      assert.noFileContent(
        `${CLIENT_TEST_SRC_DIR}cypress/integration/administration/administration.spec.ts`,
        '  metricsPageHeadingSelector,\n' +
          '  healthPageHeadingSelector,\n' +
          '  logsPageHeadingSelector,\n' +
          '  configurationPageHeadingSelector,'
      );

      assert.noFileContent(
        `${CLIENT_TEST_SRC_DIR}cypress/support/commands.ts`,
        'export const metricsPageHeadingSelector = \'[data-cy="metricsPageHeading"]\';\n' +
          'export const healthPageHeadingSelector = \'[data-cy="healthPageHeading"]\';\n' +
          'export const logsPageHeadingSelector = \'[data-cy="logsPageHeading"]\';\n' +
          'export const configurationPageHeadingSelector = \'[data-cy="configurationPageHeading"]\';'
      );
    });
  });
});
