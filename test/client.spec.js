const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('generator-jhipster/generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const CLIENT_WEBPACK_DIR = constants.CLIENT_WEBPACK_DIR;

const expectedFiles = {
    i18nJson: [
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

    app: [
        `${CLIENT_MAIN_SRC_DIR}app/components/account/change-password/change-password.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/change-password/change-password.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/login-form/login-form.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/login-form/login-form.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/register/register.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/register/register.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/register/register.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/reset-password/reset-password.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/reset-password/reset-password.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/settings/settings.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/settings/settings.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/LoginModalService.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/account/principal.ts`,

        `${CLIENT_MAIN_SRC_DIR}app/components/admin/audits/audits.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/audits/audits.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/audits/audits.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/configuration/configuration.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/configuration/configuration.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/configuration/configuration.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/docs/docs.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/docs/docs.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/health/health.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/health/health.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/health/health-modal.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/health/health-modal.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/health/health.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/logs/logs.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/logs/LogsService.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/metrics/metrics.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/metrics/metrics-modal.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/metrics/metrics.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/metrics/metrics-modal.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/metrics/metrics.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/user-management/user-management.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/user-management/user-management.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/user-management/user-management-edit.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/user-management/user-management-edit.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/user-management/user-management.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/user-management/user-management-view.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/admin/user-management/user-management-view.vue`,

        `${CLIENT_MAIN_SRC_DIR}app/components/home/home.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/home/home.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/jhi-footer/jhi-footer.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/jhi-footer/jhi-footer.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/jhi-navbar/jhi-navbar.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/jhi-navbar/jhi-navbar.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/components/ribbon/ribbon.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/components/ribbon/ribbon.vue`,

        `${CLIENT_MAIN_SRC_DIR}app/config/axios-interceptor.ts`,

        `${CLIENT_MAIN_SRC_DIR}app/locale/LanguageService.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/locale/translation.service.ts`,

        `${CLIENT_MAIN_SRC_DIR}app/router/index.ts`,

        `${CLIENT_MAIN_SRC_DIR}app/shared/data/DataUtilsService.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/date/filters.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/config.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shared/jhi-item-count.vue`,

        `${CLIENT_MAIN_SRC_DIR}app/app.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/app.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/constants.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/main.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/shims-vue.d.ts`
    ],

    test: [
        // `${CLIENT_TEST_SRC_DIR}jest.conf.js`,
    ],

    protractor: [
        `${CLIENT_TEST_SRC_DIR}e2e/modules/account/account.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}e2e/modules/administration/administration.spec.ts`,
        `${CLIENT_TEST_SRC_DIR}e2e/page-objects/base-component.ts`,
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

describe('VueJS JHipster blueprint', () => {
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
                    clientFramework: 'VueJS'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster client generator', () => {
            assert.file(expectedFiles.i18nJson);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.test);
            assert.noFile(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
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
                    clientFramework: 'VueJS'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster client generator', () => {
            assert.file(expectedFiles.i18nJson);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.test);
            assert.noFile(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
        });
    });
    describe('noi18n with Maven', () => {
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
                    enableTranslation: false,
                    nativeLanguage: 'en',
                    buildTool: 'maven',
                    clientFramework: 'VueJS'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster client generator', () => {
            assert.noFile(expectedFiles.i18nJson);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.test);
            assert.noFile(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
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
                    searchEngine: 'elasticsearch',
                    enableTranslation: true,
                    nativeLanguage: 'en',
                    languages: ['en', 'fr'],
                    testFrameworks: ['protractor'],
                    buildTool: 'maven',
                    clientFramework: 'VueJS'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster client generator', () => {
            assert.file(expectedFiles.i18nJson);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.test);
            assert.file(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
            assert.fileContent('package.json', '"vue"');
            assert.fileContent('package.json', '"vuex"');
            assert.fileContent('package.json', '"vuelidate"');
        });
    });
});
