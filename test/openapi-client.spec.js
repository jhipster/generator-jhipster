const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const basePackage = 'src/main/java/com/mycompany/myapp';
const expectedFiles = {
    petstoreClientFiles: [
        `${basePackage}/client/petstore/ApiKeyRequestInterceptor.java`,
        `${basePackage}/client/petstore/ClientConfiguration.java`,
        `${basePackage}/client/petstore/api/PetsApi.java`,
        `${basePackage}/client/petstore/api/PetsApiClient.java`,
        `${basePackage}/client/petstore/model/Error.java`,
        `${basePackage}/client/petstore/model/Pet.java`
    ]
};

describe('JHipster OpenAPI Client Sub Generator', () => {
    //--------------------------------------------------
    // Spring Cloud Client tests
    //--------------------------------------------------
    describe('Spring: microservice petstore custom endpoint ', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/openapi-client'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/openapi-client/microservice-simple'), dir);
                    fse.copySync(path.join(__dirname, './templates/openapi-client'), dir);
                    fse.copySync(path.join(__dirname, '../node_modules/@openapitools'), `${dir}/node_modules/@openapitools`);
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
        it('creates java client files', () => {
            assert.file(expectedFiles.petstoreClientFiles);
        });
        it('generates file for component scan exclusion', () => {
            assert.file(`${basePackage}/client/ExcludeFromComponentScan.java`);
        });
        it('does not override Jhipster files ', () => {
            assert.noFile('README.md');
            assert.noFile('pom.xml');
        });
    });

    describe('Spring: microservice petstore regenerate ', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/openapi-client'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/openapi-client/microservice-with-client'), dir);
                    fse.copySync(path.join(__dirname, './templates/openapi-client'), dir);
                    fse.copySync(path.join(__dirname, '../node_modules/@openapitools'), `${dir}/node_modules/@openapitools`);
                })
                .withOptions({ skipChecks: true, regen: true })
                .on('end', done);
        });
        it('regenerates java client files', () => {
            assert.file(expectedFiles.petstoreClientFiles);
        });

        it('has removed old client file', () => {
            assert.noFile(`${basePackage}/client/petstore/api/PetsApiClientOld.java`);
        });
    });

    describe('Spring: microservice regenerate no clients ', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/openapi-client'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/openapi-client/microservice-simple'), dir);
                    fse.copySync(path.join(__dirname, './templates/openapi-client'), dir);
                    fse.copySync(path.join(__dirname, '../node_modules/@openapitools'), `${dir}/node_modules/@openapitools`);
                })
                .withOptions({ skipChecks: true, regen: true })
                .on('end', done);
        });
        it('does not generate java client if no client configured', () => {
            assert.noFile(expectedFiles.petstoreClientFiles);
        });
    });
});
