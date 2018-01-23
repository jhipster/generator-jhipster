/* global describe, context, before, beforeEach, after, it */

const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');
const sinon = require('sinon');
const constants = require('../generators/generator-constants');
const ChildProcess = require('child_process');

const expectedFiles = {
    monolith: [
        'Procfile',
        `${constants.SERVER_MAIN_RES_DIR}/config/bootstrap-heroku.yml`,
        `${constants.SERVER_MAIN_RES_DIR}/config/application-heroku.yml`
    ]
};

describe('JHipster Heroku Sub Generator', () => {
    const herokuAppName = 'jhipster-test';
    let stub;

    before(() => {
        stub = sinon.stub(ChildProcess, 'exec');
        stub.withArgs('heroku --version').callsArgWith(1, false);
        stub.withArgs('heroku plugins').callsArgWith(1, false, 'heroku-cli-deploy');
        stub.withArgs('git init').yields([false, '', '']);
        stub.withArgs(`heroku addons:create jawsdb:kitefin --as DATABASE --app ${herokuAppName}`).callsArgWith(2, false, '', '');
    });

    describe('monolith application', () => {
        describe('in the US', () => {
            beforeEach((done) => {
                stub.withArgs(`heroku create ${herokuAppName}`).callsArgWith(2, false, '', '');
                helpers
                    .run(require.resolve('../generators/heroku'))
                    .inTmpDir((dir) => {
                        fse.copySync(path.join(__dirname, './templates/default/'), dir);
                    })
                    .withOptions({ skipBuild: true })
                    .withPrompts({
                        herokuAppName,
                        herokuRegion: 'us'
                    })
                    .on('end', done);
            });
            it('creates expected monolith files', () => {
                assert.file(expectedFiles.monolith);
            });
        });

        describe('in the EU', () => {
            beforeEach((done) => {
                stub.withArgs(`heroku create ${herokuAppName} --region eu`).callsArgWith(2, false, '', '');
                helpers
                    .run(require.resolve('../generators/heroku'))
                    .inTmpDir((dir) => {
                        fse.copySync(path.join(__dirname, './templates/default/'), dir);
                    })
                    .withOptions({ skipBuild: true })
                    .withPrompts({
                        herokuAppName,
                        herokuRegion: 'eu'
                    })
                    .on('end', done);
            });
            it('creates expected monolith files', () => {
                assert.file(expectedFiles.monolith);
            });
        });
    });

    after(() => {
        stub.restore();
    });
});
