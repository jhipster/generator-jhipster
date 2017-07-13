/* global describe, it */

const assert = require('assert');
const exec = require('child_process').exec;
const path = require('path');

describe('jhipster cli test', () => {
    const cmd = `node ${path.join(__dirname, '../cli/jhipster')} `;
    console.log(cmd); // eslint-disable-line

    it('--help should run without errors', (done) => {
        exec(`${cmd} --help`, (error, stdout, stderr) => {
            assert(!error);
            done();
        });
    });

    it('--version should run without errors', (done) => {
        exec(`${cmd} --version`, (error, stdout, stderr) => {
            assert(!error);
            done();
        });
    });

    it('should return error on unknown command', function (done) {
        this.timeout(4000);

        exec(`${cmd} junkcmd`, (error, stdout, stderr) => {
            assert(error);
            assert.equal(error.code, 1);
            assert.equal(stderr.includes('is not a known command'), true);
            done();
        });
    });
});
