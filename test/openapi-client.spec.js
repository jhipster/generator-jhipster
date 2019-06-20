const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const basePackage = 'src/main/java/com/mycompany/myapp';
const expectedFiles = {
    generatedJava: [
        `${basePackage}/client/petstore/ApiKeyRequestInterceptor.java`,
        `${basePackage}/client/petstore/ClientConfiguration.java`
    ]
};

describe('JHipster OpenAPI Client Sub Generator', () => {
    //--------------------------------------------------
    // Jenkins tests
    //--------------------------------------------------
    describe('Spring: microservice petstore openapi 3 ', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/openapi-client'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/openapi-client/microservice-simple'), dir);
                    fse.copySync(path.join(__dirname, './templates/openapi-client'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    action: 'new',
                    specOrigin: 'custom-endpoint',
                    customEndpoint: 'petstore-openapi-3.yml',
                    cliName: 'petstore'
                })
                .on('end', done);
        });
        it('creates java supporting files', () => {
            assert.file(expectedFiles.generatedJava);
        });
        it('does not generate useless supporting files', () => {
            assert.noFile('.openapi-generator/VERSION');
        });
        it('does not override README.md file', () => {
            assert.fileContent('README.md', /www\.jhipster\.tech/);
        });
    });
});
