const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const constants = require('generator-jhipster/generators/generator-constants');

const CLIENT_MAIN_SRC_DIR = constants.CLIENT_MAIN_SRC_DIR;
const CLIENT_TEST_SRC_DIR = constants.CLIENT_TEST_SRC_DIR;
const CLIENT_SPEC_SRC_DIR = `${CLIENT_TEST_SRC_DIR}spec/`;
const pageName = 'MyTestPage';
const pageFolderName = 'mytestpage';
const pageInstance = 'myTestPage';

describe('Subgenerator page of Vue.js JHipster blueprint', () => {
    describe('Create page', () => {
        before((done) => {
            helpers
                .run(require.resolve('../generators/page'))
                .inTmpDir((dir) => {
                    fse.copySync(path.join(__dirname, '../test/templates/vuejs-default'), dir);
                })
                .withOptions({
                    'from-cli': true,
                    skipInstall: true,
                    blueprint: 'vuejs',
                    skipChecks: true
                })
                .withPrompts({
                    pageName
                })
                .on('end', done);
        });

        it('creates expected files', () => {
            assert.file([
                `${CLIENT_MAIN_SRC_DIR}app/pages/${pageFolderName}/${pageFolderName}.vue`,
                `${CLIENT_MAIN_SRC_DIR}app/pages/${pageFolderName}/${pageFolderName}.service.ts`,
                `${CLIENT_MAIN_SRC_DIR}app/pages/${pageFolderName}/${pageFolderName}.component.ts`,
                `${CLIENT_SPEC_SRC_DIR}app/pages/${pageFolderName}/${pageFolderName}.component.spec.ts`,
                `${CLIENT_SPEC_SRC_DIR}app/pages/${pageFolderName}/${pageFolderName}.service.spec.ts`,
                `${CLIENT_TEST_SRC_DIR}e2e/pages/${pageFolderName}/${pageFolderName}.page-object.ts`,
                `${CLIENT_TEST_SRC_DIR}e2e/pages/${pageFolderName}/${pageFolderName}.spec.ts`
            ]);
        });
        it('add page path, service and protractor config', () => {
            assert.fileContent(
                `${CLIENT_MAIN_SRC_DIR}/app/router/index.ts`,
                `const ${pageName} = () => import('../pages/${pageFolderName}/${pageFolderName}.vue');`
            );
            assert.fileContent(
                `${CLIENT_MAIN_SRC_DIR}/app/router/index.ts`,
                `path: '/pages/${pageFolderName}',`
            );
            assert.fileContent(
                `${CLIENT_MAIN_SRC_DIR}/app/main.ts`,
                `import ${pageName}Service from '@/pages/${pageFolderName}/${pageFolderName}.service';`
            );
            assert.fileContent(
                `${CLIENT_MAIN_SRC_DIR}/app/main.ts`,
                `${pageInstance}Service: () => new ${pageName}Service(),`
            );
            assert.fileContent(
                `${CLIENT_TEST_SRC_DIR}/protractor.conf.js`,
                '\'./e2e/pages/**/*.spec.ts\','
            );
        });
    });
});
