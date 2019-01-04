const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('generator-jhipster/generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const CLIENT_SPEC_SRC_DIR = `${CLIENT_TEST_SRC_DIR}/spec/`;
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
    ],

    app: [
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
        `${CLIENT_MAIN_SRC_DIR}app/account/reset-password/reset-password.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/reset-password/reset-password.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/account/settings/settings.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/settings/settings.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/account/login-modal.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/account/principal.ts`,

        `${CLIENT_SPEC_SRC_DIR}app/account/change-password/change-password.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/account/login-form/login-form.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/account/activate/activate.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/account/register/register.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/account/register/register.service.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/account/reset-password/reset-password.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/account/settings/settings.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/account/login-modal.service.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/account/principal.spec.ts`,

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
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-edit.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-edit.vue`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-view.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/user-management/user-management-view.vue`,

        `${CLIENT_SPEC_SRC_DIR}app/admin/audits/audits.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/admin/audits/audits.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/configuration/configuration.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/admin/configuration/configuration.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/docs/docs.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/health/health.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/admin/health/health-modal.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/health/health.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/logs/logs.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/admin/logs/logs.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/metrics/metrics.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/metrics/metrics-modal.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/admin/metrics/metrics.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/user-management/user-management.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/user-management/user-management-edit.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/admin/user-management/user-management.service.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/user-management/user-management-view.component.spec.ts`,

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

        // `${CLIENT_SPEC_SRC_DIR}app/core/home/home.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/core/jhi-footer/jhi-footer.component.spec.ts`,
        // `${CLIENT_SPEC_SRC_DIR}app/core/jhi-navbar/jhi-navbar.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/core/ribbon/ribbon.component.spec.ts`,

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
        `${CLIENT_MAIN_SRC_DIR}app/shims-vue.d.ts`
    ],

    websocket: [
        `${CLIENT_MAIN_SRC_DIR}app/admin/tracker/tracker.component.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/tracker/tracker.service.ts`,
        `${CLIENT_MAIN_SRC_DIR}app/admin/tracker/tracker.vue`,

        `${CLIENT_SPEC_SRC_DIR}app/admin/tracker/tracker.component.spec.ts`,
        `${CLIENT_SPEC_SRC_DIR}app/admin/tracker/tracker.service.spec.ts`
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
                    clientFramework: 'Vue.js'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.file(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.test);
            assert.noFile(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
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
                    clientFramework: 'Vue.js'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.file(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.test);
            assert.noFile(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
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
                    enableTranslation: false,
                    nativeLanguage: 'en',
                    buildTool: 'maven',
                    clientFramework: 'Vue.js'
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.noFile(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.test);
            assert.noFile(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
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
                    serverSideOptions: ['searchEngine:elasticsearch']
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.file(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
            assert.file(expectedFiles.test);
            assert.file(expectedFiles.protractor);
            assert.file(expectedFiles.webpack);
        });
        it('contains the specific change added by the blueprint', () => {
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
                    packageName: 'io.github.jhipster',
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
                    serverSideOptions: ['websocket:spring-websocket']
                })
                .on('end', done);
        });
        it('creates expected files from jhipster vue.js generator', () => {
            assert.file(expectedFiles.i18n);
            assert.file(expectedFiles.common);
            assert.file(expectedFiles.app);
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
            assert.fileContent('.editorconfig', '[*.{ts,tsx,js,json,css,scss,sql,ejs}]\n'
                + 'indent_style = space\n'
                + 'indent_size = 2');
        });
        it('uses correct prettier formatting', () => {
            // tabWidth = 2 (see generators/common/templates/.prettierrc.ejs)
            assert.fileContent('webpack/webpack.dev.js', / {2}devtool:/);
            assert.fileContent('tsconfig.json', / {2}"compilerOptions":/);
        });
    });
});
