const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

describe('JHipster generator export jdl', () => {
    describe('exports entities to a JDL file without argument', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/export-jdl'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/export-jdl'), dir);
                })
                .on('end', done);
        });

        it('creates the jdl file based on app name', () => {
            assert.file('standard.jdl');
        });
    });

    describe('exports entities to a JDL file with file argument', () => {
        before(done => {
            helpers
                .run(require.resolve('../generators/export-jdl'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, '../test/templates/export-jdl'), dir);
                })
                .withArguments('custom-app.jdl')
                .on('end', done);
        });

        it('creates the jdl file', () => {
            assert.file('custom-app.jdl');
        });
    });
});
