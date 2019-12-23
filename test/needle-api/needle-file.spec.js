const fs = require('fs');
const os = require('os');
const path = require('path');
const FileEditor = require('mem-fs-editor');
const assert = require('yeoman-assert');
const env = require('yeoman-environment');
const helpers = require('yeoman-test');

const NeedleFile = require('../../generators/needle-file');

const tmpdir = path.join(os.tmpdir(), 'needle-file');

function rm(filepath) {
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(path);
    }
}

describe('Unit tests for needle-file', () => {
    beforeEach(helpers.setUpTestDirectory(tmpdir));

    beforeEach(function() {
        this.beforeDir = process.cwd();
        this.filePath = path.join(tmpdir, 'test.html');
        this.memFs = env.createEnv().sharedFs;
        this.fs = FileEditor.create(this.memFs);
        this.needleFile = new NeedleFile(this.filePath, this.fs, true);
        this.writeNeedleFile = new NeedleFile(this.filePath, this.fs);
    });

    afterEach(function() {
        rm(this.filePath);
        process.chdir(this.beforeDir);
    });

    describe('Html', () => {
        it('#getNeedles()', function() {
            this.needleFile.write('<!-- jhipster-needle-start-some-name - xx xx --><!-- jhipster-needle-end-some-name -->');
            assert.equal(this.needleFile.getNeedles(), 'some-name');
        });

        it('multiline #getNeedles()', function() {
            this.needleFile.write(`<!-- jhipster-needle-start-some-name - xx xx --><!-- jhipster-needle-end-some-name -->
            <!-- jhipster-needle-start-some-name2 - xx xx --><!-- jhipster-needle-end-some-name2 -->`);
            assert.deepStrictEqual(this.needleFile.getNeedles(), ['some-name', 'some-name2']);
        });

        it('case insensitive #getNeedles()', function() {
            this.needleFile.write(`<!-- JHIPSTER-needle-start-some-name - xx xx --><!-- jhipster-needle-end-some-name -->

            <!-- jhipster-NEEDLE-start-some-name2 - xx xx --><!-- jhipster-needle-end-some-name2 -->`);
            assert.deepStrictEqual(this.needleFile.getNeedles(), ['some-name', 'some-name2']);
        });

        it('2 lines #getNeedles()', function() {
            this.needleFile.write(`<!-- jhipster-needle-start-some-name - xx xx -->
                    a 
                    <!-- jhipster-needle-end-some-name -->`);
            assert.deepStrictEqual(this.needleFile.getNeedles(), ['some-name']);
        });

        it('#getNeedle()', function() {
            this.needleFile.write('<!-- jhipster-needle-start-some-name - xx xx -->aaa<!-- jhipster-needle-end-some-name -->');
            assert.equal(this.needleFile.getNeedle('some-name'), 'aaa');
        });

        it('multiline #getNeedle()', function() {
            this.needleFile.write(`<!-- jhipster-needle-start-some-name - xx xx -->
            aaaa
            <!-- jhipster-needle-end-some-name -->`);
            assert.equal(
                this.needleFile.getNeedle('some-name'),
                `            aaaa
`
            );
        });

        it('#writeNeedle()', function() {
            this.needleFile.write(`<!-- jhipster-needle-start-some-name - xx xx -->
            a <$= value; $>
            <!-- jhipster-needle-end-some-name -->
            <!-- jhipster-needle-some-name - xx xx -->`);
            const content = this.needleFile.render('some-name', { value: 'test' });
            this.writeNeedleFile.writeNeedle('some-name', content);
            assert.equal(
                this.writeNeedleFile.read(),
                `<!-- jhipster-needle-start-some-name - xx xx -->
            a <$= value; $>
            <!-- jhipster-needle-end-some-name -->
            a test
            <!-- jhipster-needle-some-name - xx xx -->`
            );
        });

        it('#removeNeedles()', function() {
            this.needleFile.write(`<!-- jhipster-needle-start-some-name - xx xx -->
            a <$= value; $>
            <!-- jhipster-needle-end-some-name -->`);
            this.needleFile.removeNeedles();
            assert.equal(this.needleFile.read(), '');
        });

        it('leading white space #removeNeedles()', function() {
            this.needleFile.write(`   <!-- jhipster-needle-start-some-name - xx xx -->
            a <$= value; $>
            <!-- jhipster-needle-end-some-name -->`);
            this.needleFile.removeNeedles();
            assert.equal(this.needleFile.read(), '');
        });

        it('leading line #removeNeedles()', function() {
            this.needleFile.write(`
            <!-- jhipster-needle-start-some-name - xx xx -->
            a <$= value; $>
            <!-- jhipster-needle-end-some-name -->
            after`);
            this.needleFile.removeNeedles();
            assert.equal(this.needleFile.read(), '\n            after');
        });

        it('trailing new line #removeNeedles()', function() {
            this.needleFile.write(`<!-- jhipster-needle-start-some-name - xx xx -->
            a <$= value; $>
            <!-- jhipster-needle-end-some-name -->
`);
            this.needleFile.removeNeedles();
            assert.equal(this.needleFile.read(), '');
        });
    });
});
