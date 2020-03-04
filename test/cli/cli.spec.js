/* eslint-disable no-unused-expressions, no-console */

const expect = require('chai').expect;
const exec = require('child_process').exec;
const path = require('path');

const { getJHipsterCli, testInTempDir, copyFakeBlueprint, copyBlueprint, lnYeoman } = require('../utils/utils');

describe('jhipster cli test', () => {
    const cmd = getJHipsterCli();

    it('verify correct cmd format', () => {
        expect(cmd).to.match(/node (.*)\/cli\/jhipster/g);
    });

    it('--help should run without errors', done => {
        exec(`${cmd} --help`, (error, stdout, stderr) => {
            expect(error).to.be.null;
            done();
        });
    });

    it('--version should run without errors', done => {
        exec(`${cmd} --version`, (error, stdout, stderr) => {
            expect(error).to.be.null;
            done();
        });
    });

    it('should return error on unknown command', function(done) {
        this.timeout(4000);

        exec(`${cmd} junkcmd`, (error, stdout, stderr) => {
            expect(error).to.not.be.null;
            expect(error.code).to.equal(1);
            expect(stderr.includes('is not a known command')).to.be.true;
            done();
        });
    });

    it('should delegate to blueprint on blueprint command but will not find it', function(done) {
        this.timeout(4000);

        testInTempDir(tmpdir => {
            copyFakeBlueprint(tmpdir, 'bar');
            exec(`${cmd} foo --blueprint bar`, (error, stdout, stderr) => {
                expect(error).to.not.be.null;
                expect(error.code).to.equal(1);
                /* eslint-disable prettier/prettier */
                expect(stdout.includes('No custom commands found within blueprint: generator-jhipster-bar')).to.be.true;
                expect(stderr.includes('foo is not a known command')).to.be.true;
                done();
            });
        });
    });

    it('should delegate to blueprint on multiple blueprints command but will not find it', function(done) {
        this.timeout(4000);

        testInTempDir(tmpdir => {
            copyFakeBlueprint(tmpdir, 'bar', 'baz');
            exec(`${cmd} foo --blueprints bar,baz`, (error, stdout, stderr) => {
                expect(error).to.not.be.null;
                expect(error.code).to.equal(1);
                /* eslint-disable prettier/prettier */
                expect(stdout.includes('No custom commands found within blueprint: generator-jhipster-bar')).to.be.true;
                expect(stdout.includes('No custom commands found within blueprint: generator-jhipster-baz')).to.be.true;
                expect(stderr.includes('foo is not a known command')).to.be.true;
                done();
            });
        });
    });

    it('should delegate to blueprint on multiple blueprints command with sharedOptions and find it', function(done) {
        this.timeout(4000);

        testInTempDir(tmpdir => {
            copyBlueprint(path.join(__dirname, '../templates/blueprint-cli'), tmpdir, 'cli');
            lnYeoman(tmpdir);
            exec(`${cmd} foo --blueprints cli`, (error, stdout, stderr) => {
                expect(stdout.includes('Running foo')).to.be.true;
                expect(stdout.includes('Running bar')).to.be.true;
                expect(stdout.includes('barValue')).to.be.true;
                expect(stdout.includes('foorValue')).to.be.false;
                done();
            });
        });
    });

    it('should delegate to blueprint on multiple blueprints command with multiple sharedOptions and find it', function(done) {
        this.timeout(4000);

        testInTempDir(tmpdir => {
            copyBlueprint(path.join(__dirname, '../templates/blueprint-cli'), tmpdir, 'cli');
            copyBlueprint(path.join(__dirname, '../templates/blueprint-cli-shared'), tmpdir, 'cli-shared');
            lnYeoman(tmpdir);
            exec(`${cmd} foo --blueprints cli,cli-shared`, (error, stdout, stderr) => {
                expect(stdout.includes('Running foo')).to.be.true;
                expect(stdout.includes('Running bar')).to.be.true;
                expect(stdout.includes('fooValue')).to.be.true;
                expect(stdout.includes('barValue')).to.be.true;
                done();
            });
        });
    });
});
