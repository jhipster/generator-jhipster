/* global describe, it */
/* eslint-disable no-unused-expressions, no-console */

const expect = require('chai').expect;
const assert = require('chai').assert;
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const path = require('path');

describe('jhipster cli test', () => {
    const cmdPath = path.join(__dirname, '../cli/jhipster');
    const cmd = `node ${cmdPath} `;
    console.log(cmd);

    it('verify correct cmd format', () => {
        expect(cmd).to.match(/node \/(.*)generator-jhipster\/cli\/jhipster/g);
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

    it('should run default command', function (done) {
        this.timeout(4000);
        const out = spawn('node', [cmdPath]);
        let count = 0;
        out.stdout.on('data', (data) => {
            expect(data).to.not.be.null;
            expect(data.includes('Using JHipster version installed globally') ||
                data.inclues('Running default command') ||
                data.includes('Executing jhipster:app')).to.be.true;
            if (count === 2) done();
            count++;
        });
        out.stderr.on('data', (data) => {
            console.log(`stderr: ${data.toString()}`);
            assert.equal(true, false, 'Command failed with error'); // fail the test
            done();
        });
        out.on('exit', (code) => {
            console.log(`child process exited with code ${code.toString()}`);
            assert.equal(true, false, 'Command failed with error'); // fail the test
            done();
        });
        out.on('error', (code) => {
            console.log(`child process failed with code ${code.toString()}`);
            assert.equal(true, false, 'Command failed with error'); // fail the test
            done();
        });
    });
});
