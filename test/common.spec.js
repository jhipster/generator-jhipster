const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const expectedFiles = require('./utils/expected-files');

describe('JHipster generator common', () => {
    before(done => {
        helpers
            .run(require.resolve('../generators/common'))
            .inTmpDir(dir => {
                fse.copySync(path.join(__dirname, '../test/templates/default'), dir);
            })
            .withOptions({
                'from-cli': true,
                skipInstall: true,
                skipChecks: true
            })
            .on('end', done);
    });

    it('creates common files', () => {
        assert.file(expectedFiles.common);
    });
});
