const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('generator-jhipster/generators/generator-constants');
const blueprintPackagejs = require('../package.json');

const SERVER_MAIN_RES_DIR = constants.SERVER_MAIN_RES_DIR;
const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const CLIENT_SPEC_SRC_DIR = `${CLIENT_TEST_SRC_DIR}spec/`;
const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;

const expectedFiles = {
    i18n: [
        `${CLIENT_MAIN_SRC_DIR}app/locale/translation.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/activate.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/audits.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/configuration.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/error.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/health.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/login.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/logs.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/home.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/metrics.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/password.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/register.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/sessions.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/settings.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/reset.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/en/user-management.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/activate.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/audits.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/configuration.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/error.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/global.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/health.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/login.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/logs.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/home.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/metrics.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/password.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/register.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/sessions.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/settings.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/reset.json`,
        `${CLIENT_MAIN_SRC_DIR}i18n/fr/user-management.json`
    ],

    common: [
        '.editorconfig',
        '.gitattributes',
        '.gitignore',
        '.prettierrc',
        '.prettierignore',
        'README.md',
        `${SERVER_MAIN_RES_DIR}banner.txt`
    ],

    session: [
        `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/sessions/sessions.vue`,
        `${CLIENT_SPEC_SRC_DIR}app/account/sessions/sessions.component.spec.ts`
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
        `${CLIENT_SPEC_SRC_DIR}app/admin/user-management/user-management-view.component.spec.ts`
    ],

    app: [
        `${CLIENT_MAIN_SRC_DIR}app/account/account.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/audits/audits.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/configuration/configuration.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/docs/docs.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/docs/docs.vue`,
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
        `${CLIENT_MAIN_SRC_DIR}app/account/login.service.ts`,

        `${CLIENT_SPEC_SRC_DIR}app/account/account.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/audits/audits.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/admin/audits/audits.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/configuration/configuration.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/docs/docs.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/health/health.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/health/health-modal.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/health/health.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/logs/logs.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/admin/logs/logs.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/metrics/metrics.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/metrics/metrics-modal.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/admin/metrics/metrics.service.spec.ts`,

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
        `${CLIENT_SPEC_SRC_DIR}app/core/jhi-footer/jhi-footer.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/core/jhi-navbar/jhi-navbar.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/core/ribbon/ribbon.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/shared/alert/alert.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/shared/config/axios-interceptor.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/shared/data/data-utils.service.spec.ts`,

        `${CLIENT_MAIN_SRC_DIR}app/shared/config/axios-interceptor.ts`,

        `${CLIENT_MAIN_SRC_DIR}app/router/index.ts`,

        `${CLIENT_MAIN_SRC_DIR}app/shared/alert/alert.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/data/data-utils.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/date/filters.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/config/config.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/config/config-bootstrap-vue.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/jhi-item-count.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/jhi-item-count.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/model/user.model.ts`,

        `${CLIENT_MAIN_SRC_DIR}app/app.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/app.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shims-vue.d.ts`,

        `${CLIENT_MAIN_SRC_DIR}WEB-INF/web.xml`
    ],

    websocket: [
        `${CLIENT_MAIN_SRC_DIR}app/admin/tracker/tracker.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/tracker/tracker.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/tracker/tracker.vue`,

        `${CLIENT_SPEC_SRC_DIR}app/admin/tracker/tracker.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/tracker/tracker.service.spec.ts`
    ],

    test: [
        `${CLIENT_TEST_SRC_DIR}jest.conf.js`,
    ],

    protractor: [
        `${CLIENT_TEST_SRC_DIR}e2e/modules/account/account.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}e2e/modules/administration/administration.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}e2e/page-objects/alert-page.ts`,
        `${CLIENT_TEST_SRC_DIR}e2e/page-objects/navbar-page.ts`,
        `${CLIENT_TEST_SRC_DIR}e2e/page-objects/password-page.ts`,
        `${CLIENT_TEST_SRC_DIR}e2e/page-objects/register-page.ts`,
        `${CLIENT_TEST_SRC_DIR}e2e/page-objects/settings-page.ts`,
        `${CLIENT_TEST_SRC_DIR}e2e/page-objects/signin-page.ts`,
        `${CLIENT_TEST_SRC_DIR}e2e/util/utils.ts`,
        `${CLIENT_TEST_SRC_DIR}protractor.conf.js`
    ],

    webpack: [
        `${CLIENT_WEBPACK_DIR}/loader.conf.js`,
        `${CLIENT_WEBPACK_DIR}/utils.js`,
        `${CLIENT_WEBPACK_DIR}/vue.utils.js`,
        `${CLIENT_WEBPACK_DIR}/webpack.common.js`,
        `${CLIENT_WEBPACK_DIR}/webpack.dev.js`,
        `${CLIENT_WEBPACK_DIR}/webpack.prod.js`
    ]
};

describe('Vue.js JHipster blueprint', () => {
    describe('Default with Maven', () => {
        before((done) => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'vuejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/client/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:client',
                        path.join(__dirname, '../generators/client/index.js')
                    ],
                    [
                        require('../generators/common/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:common',
                        path.join(__dirname, '../generators/common/index.js')
                    ]
                ])
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'jwt',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    buildTool: 'maven',
                    clientFramework: 'Vue.js',
                    clientTheme: 'none'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.file(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.allAuthExceptOAuth2);
            assert.noFile(expectedFiles.session);
            assert.noFile([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
            assert.file(expectedFiles.test);
            assert.noFile(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', `"generator-jhipster-vuejs": "${blueprintPackagejs.version}"`);
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
            assert.fileContent('.prettierrc', 'tabWidth: 2');
            assert.fileContent('.editorconfig', '[*.{ts,tsx,js,json,css,scss,sql,ejs}]\n'
                + 'indent_style = space\n'
                + 'indent_size = 2');
        });
        it('uses correct prettier formatting', () => {
            // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
            assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
            assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
        });
        it('uses default JHipster theme', () => {
            assert.noFileContent('src/main/webapp/content/scss/vendor.scss', '@import \'~bootswatch/dist/');
        });
    });
    describe('Default with Gradle', () => {
        before((done) => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'vuejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/client/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:client',
                        path.join(__dirname, '../generators/client/index.js')
                    ],
                    [
                        require('../generators/common/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:common',
                        path.join(__dirname, '../generators/common/index.js')
                    ]
                ])
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'jwt',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    buildTool: 'gradle',
                    clientFramework: 'Vue.js',
                    clientTheme: 'none'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.file(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.allAuthExceptOAuth2);
            assert.noFile(expectedFiles.session);
            assert.noFile([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
            assert.file(expectedFiles.test);
            assert.noFile(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', `"generator-jhipster-vuejs": "${blueprintPackagejs.version}"`);
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
            assert.fileContent('.prettierrc', 'tabWidth: 2');
            assert.fileContent('.editorconfig', '[*.{ts,tsx,js,json,css,scss,sql,ejs}]\n'
                + 'indent_style = space\n'
                + 'indent_size = 2');
        });
        it('uses correct prettier formatting', () => {
            // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
            assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
            assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
        });
        it('uses default JHipster theme', () => {
            assert.noFileContent('src/main/webapp/content/scss/vendor.scss', '@import \'~bootswatch/dist/');
        });
    });
    describe('noi18n with Session Maven', () => {
        before((done) => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'vuejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/client/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:client',
                        path.join(__dirname, '../generators/client/index.js')
                    ],
                    [
                        require('../generators/common/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:common',
                        path.join(__dirname, '../generators/common/index.js')
                    ]
                ])
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'session',
                    enableTranslation: false,
                    nativeLanguage: 'en',
                    buildTool: 'maven',
                    clientFramework: 'Vue.js',
                    clientTheme: 'none'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.noFile(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.session);
            assert.file([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
            assert.file(expectedFiles.allAuthExceptOAuth2);
            assert.file(expectedFiles.test);
            assert.noFile(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', `"generator-jhipster-vuejs": "${blueprintPackagejs.version}"`);
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
            assert.fileContent('.prettierrc', 'tabWidth: 2');
            assert.fileContent('.editorconfig', '[*.{ts,tsx,js,json,css,scss,sql,ejs}]\n'
                + 'indent_style = space\n'
                + 'indent_size = 2');
        });
        it('uses correct prettier formatting', () => {
            // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
            assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
            assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
        });
        it('uses default JHipster theme', () => {
            assert.noFileContent('src/main/webapp/content/scss/vendor.scss', '@import \'~bootswatch/dist/');
        });
    });
    describe('noi18n with OAuth2 Maven', () => {
        before((done) => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'vuejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/client/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:client',
                        path.join(__dirname, '../generators/client/index.js')
                    ],
                    [
                        require('../generators/common/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:common',
                        path.join(__dirname, '../generators/common/index.js')
                    ]
                ])
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'oauth2',
                    enableTranslation: false,
                    nativeLanguage: 'en',
                    buildTool: 'maven',
                    clientFramework: 'Vue.js',
                    clientTheme: 'none'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.noFile(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.test);
            assert.file([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
            assert.noFile(expectedFiles.protractor);
            assert.noFile(expectedFiles.allAuthExceptOAuth2);
            assert.noFile(expectedFiles.session);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', `"generator-jhipster-vuejs": "${blueprintPackagejs.version}"`);
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
            assert.fileContent('.prettierrc', 'tabWidth: 2');
            assert.fileContent('.editorconfig', '[*.{ts,tsx,js,json,css,scss,sql,ejs}]\n'
                + 'indent_style = space\n'
                + 'indent_size = 2');
        });
        it('uses correct prettier formatting', () => {
            // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
            assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
            assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
        });
        it('uses default JHipster theme', () => {
            assert.noFileContent('src/main/webapp/content/scss/vendor.scss', '@import \'~bootswatch/dist/');
        });
    });
    describe('Elasticsearch and Protractor', () => {
        before((done) => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'vuejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/client/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:client',
                        path.join(__dirname, '../generators/client/index.js')
                    ],
                    [
                        require('../generators/common/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:common',
                        path.join(__dirname, '../generators/common/index.js')
                    ]
                ])
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'jwt',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    testFrameworks: ['protractor'],
                    buildTool: 'maven',
                    clientFramework: 'Vue.js',
                    serverSideOptions: ['searchEngine:elasticsearch'],
                    clientTheme: 'none'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.file(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.allAuthExceptOAuth2);
            assert.noFile(expectedFiles.session);
            assert.noFile([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
            assert.file(expectedFiles.test);
            assert.file(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', `"generator-jhipster-vuejs": "${blueprintPackagejs.version}"`);
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
            assert.fileContent('.prettierrc', 'tabWidth: 2');
            assert.fileContent('.editorconfig', '[*.{ts,tsx,js,json,css,scss,sql,ejs}]\n'
                + 'indent_style = space\n'
                + 'indent_size = 2');
        });
        it('uses correct prettier formatting', () => {
            // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
            assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
            assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
        });
        it('uses default JHipster theme', () => {
            assert.noFileContent('src/main/webapp/content/scss/vendor.scss', '@import \'~bootswatch/dist/');
        });
    });
    describe('Websocket', () => {
        before((done) => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'vuejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/client/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:client',
                        path.join(__dirname, '../generators/client/index.js')
                    ],
                    [
                        require('../generators/common/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:common',
                        path.join(__dirname, '../generators/common/index.js')
                    ]
                ])
                .withPrompts({
                    baseName: 'sampleWebsocket',
                    packageName: 'io.github.jhipster.sample',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'jwt',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    testFrameworks: ['protractor'],
                    buildTool: 'maven',
                    clientFramework: 'Vue.js',
                    serverSideOptions: ['websocket:spring-websocket'],
                    clientTheme: 'none'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.file(expectedFiles.i18n);
            assert.file(expectedFiles.common);
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
            assert.fileContent('package.json', `"generator-jhipster-vuejs": "${blueprintPackagejs.version}"`);
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
            assert.fileContent('.prettierrc', 'tabWidth: 2');
            assert.fileContent('.editorconfig', '[*.{ts,tsx,js,json,css,scss,sql,ejs}]\n'
                + 'indent_style = space\n'
                + 'indent_size = 2');
        });
        it('uses correct prettier formatting', () => {
            // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
            assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
            assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
        });
        it('uses default JHipster theme', () => {
            assert.noFileContent('src/main/webapp/content/scss/vendor.scss', '@import \'~bootswatch/dist/');
        });
    });
    describe('OAuth2', () => {
        before((done) => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'vuejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/client/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:client',
                        path.join(__dirname, '../generators/client/index.js')
                    ],
                    [
                        require('../generators/common/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:common',
                        path.join(__dirname, '../generators/common/index.js')
                    ]
                ])
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'oauth2',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    buildTool: 'maven',
                    clientFramework: 'Vue.js',
                    clientTheme: 'none'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.file(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.test);
            assert.file([`${CLIENT_SPEC_SRC_DIR}app/account/login.service.spec.ts`]);
            assert.noFile(expectedFiles.protractor);
            assert.noFile(expectedFiles.allAuthExceptOAuth2);
            assert.noFile(expectedFiles.session);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', `"generator-jhipster-vuejs": "${blueprintPackagejs.version}"`);
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
            assert.fileContent('.prettierrc', 'tabWidth: 2');
            assert.fileContent('.editorconfig', '[*.{ts,tsx,js,json,css,scss,sql,ejs}]\n'
                + 'indent_style = space\n'
                + 'indent_size = 2');
        });
        it('uses correct prettier formatting', () => {
            // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
            assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
            assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
        });
        it('uses default JHipster theme', () => {
            assert.noFileContent('src/main/webapp/content/scss/vendor.scss', '@import \'~bootswatch/dist/');
        });
    });
    describe('Client theme', () => {
        before((done) => {
            helpers
                .run('generator-jhipster/generators/app')
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'vuejs',
                    skipChecks: true
                })
                .withGenerators([
                    [
                        require('../generators/client/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:client',
                        path.join(__dirname, '../generators/client/index.js')
                    ],
                    [
                        require('../generators/common/index.js'), // eslint-disable-line global-require
                        'jhipster-vuejs:common',
                        path.join(__dirname, '../generators/common/index.js')
                    ]
                ])
                .withPrompts({
                    baseName: 'sampleMysql',
                    packageName: 'com.mycompany.myapp',
                    applicationType: 'monolith',
                    databaseType: 'sql',
                    devDatabaseType: 'h2Disk',
                    prodDatabaseType: 'mysql',
                    cacheProvider: 'ehcache',
                    authenticationType: 'jwt',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    buildTool: 'maven',
                    clientFramework: 'Vue.js',
                    clientTheme: 'lux',
                    clientThemeVariant: 'primary'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.file(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.allAuthExceptOAuth2);
            assert.file(expectedFiles.test);
            assert.noFile(expectedFiles.session);
            assert.noFile(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', `"generator-jhipster-vuejs": "${blueprintPackagejs.version}"`);
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
            assert.fileContent('.prettierrc', 'tabWidth: 2');
            assert.fileContent('.editorconfig', '[*.{ts,tsx,js,json,css,scss,sql,ejs}]\n'
                + 'indent_style = space\n'
                + 'indent_size = 2');
        });
        it('uses correct theme from bootswatch', () => {
            assert.fileContent('src/main/webapp/content/scss/vendor.scss', '@import \'~bootswatch/dist/lux/variables\';');
            assert.fileContent('src/main/webapp/content/scss/vendor.scss', '@import \'~bootswatch/dist/lux/bootswatch\';');
        });
    });
});
