const path = require('path');
const os = require('os');
const shelljs = require('shelljs');
const assert = require('yeoman-assert');
const Generator = require('../../generators/generator-base');
const constants = require('../../generators/generator-constants');

const DOCKER_DIR = constants.DOCKER_DIR;

module.exports = {
    getFilesForOptions,
    shouldBeV3DockerfileCompatible,
    getJHipsterCli,
    createBlueprintMockForSubgen,
    testInTempDir
};

function getFilesForOptions(files, options, prefix, excludeFiles) {
    const generator = options;
    if (excludeFiles === undefined) {
        return Generator.prototype.writeFilesToDisk(files, generator, true, prefix);
    }
    return Generator.prototype.writeFilesToDisk(files, generator, true, prefix).filter(file => !excludeFiles.includes(file));
}

function shouldBeV3DockerfileCompatible(databaseType) {
    it('creates compose file without container_name, external_links, links', () => {
        assert.noFileContent(`${DOCKER_DIR}app.yml`, /container_name:/);
        assert.noFileContent(`${DOCKER_DIR}app.yml`, /external_links:/);
        assert.noFileContent(`${DOCKER_DIR}app.yml`, /links:/);
        assert.noFileContent(`${DOCKER_DIR + databaseType}.yml`, /container_name:/);
        assert.noFileContent(`${DOCKER_DIR + databaseType}.yml`, /external_links:/);
        assert.noFileContent(`${DOCKER_DIR + databaseType}.yml`, /links:/);
    });
}

function getJHipsterCli() {
    const cmdPath = path.join(__dirname, '../../cli/jhipster');
    let cmd = `node ${cmdPath} `;
    if (os.platform() === 'win32') {
        // corrected test for windows user
        cmd = cmd.replace(/\\/g, '/');
    }
    /* eslint-disable-next-line no-console */
    console.log(cmd);
    return cmd;
}

function testInTempDir(cb) {
    const cwd = process.cwd();
    /* eslint-disable-next-line no-console */
    console.log(`current cwd: ${cwd}`);
    const tempDir = path.join(os.tmpdir(), 'jhitemp');
    shelljs.rm('-rf', tempDir);
    shelljs.mkdir('-p', tempDir);
    process.chdir(tempDir);
    /* eslint-disable-next-line no-console */
    console.log(`New cwd: ${process.cwd()}`);
    cb(tempDir);
    process.chdir(cwd);
    /* eslint-disable-next-line no-console */
    console.log(`current cwd: ${process.cwd()}`);
}

function createBlueprintMockForSubgen(parentSubGenerator) {
    return class extends parentSubGenerator {
        constructor(args, opts) {
            super(args, { fromBlueprint: true, ...opts }); // fromBlueprint variable is important
            const jhContext = (this.jhipsterContext = this.options.jhipsterContext);
            if (!jhContext) {
                this.error("This is a JHipster blueprint and should be used only like 'jhipster --blueprint ...')}");
            }
            this.configOptions = jhContext.configOptions || {};
        }

        get initializing() {
            return super._initializing();
        }

        get prompting() {
            return super._prompting();
        }

        get configuring() {
            return super._configuring();
        }

        get default() {
            return super._default();
        }

        get writing() {
            return super._writing();
        }

        get install() {
            return super._install();
        }

        get end() {
            return super._end();
        }
    };
}
