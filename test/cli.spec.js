/* global describe, it */
/* eslint-disable no-unused-expressions, no-console */

const expect = require('chai').expect;
// const assert = require('chai').assert;
const exec = require('child_process').exec;
const path = require('path');
const os = require('os');


describe('jhipster cli test', () => {
    const cmdPath = path.join(__dirname, '../cli/jhipster');
    let cmd = `node ${cmdPath} `;
    console.log(cmd);

    it('verify correct cmd format', () => {
        if (os.platform() === 'win32') {
            // corrected test for windows user
            cmd = cmd.replace(/\\/g, '/');
        }
        expect(cmd).to.match(/node (.*)generator-jhipster\/cli\/jhipster/g);
    });

    it('--help should run without errors', (done) => {
        exec(`${cmd} --help`, (error, stdout, stderr) => {
            expect(error).to.be.null;
            done();
        });
    });

    it('--version should run without errors', (done) => {
        exec(`${cmd} --version`, (error, stdout, stderr) => {
            expect(error).to.be.null;
            done();
        });
    });

    it('should return error on unknown command', function (done) {
        this.timeout(4000);

        exec(`${cmd} junkcmd`, (error, stdout, stderr) => {
            expect(error).to.not.be.null;
            expect(error.code).to.equal(1);
            expect(stderr.includes('is not a known command')).to.be.true;
            done();
        });
    });
});
