const path = require('path');
const os = require('os');
const shelljs = require('shelljs');
const assert = require('yeoman-assert');
const fse = require('fs-extra');
const fs = require('fs');
const Environment = require('yeoman-environment');
const helpers = require('yeoman-test');

const cliUtils = require('../../cli/utils');
const Generator = require('../../generators/generator-base');
const constants = require('../../generators/generator-constants');

const DOCKER_DIR = constants.DOCKER_DIR;
const FAKE_BLUEPRINT_DIR = path.join(__dirname, '../templates/fake-blueprint');

module.exports = {
    getFilesForOptions,
    shouldBeV3DockerfileCompatible,
    getJHipsterCli,
    testInTempDir,
    revertTempDir,
    copyBlueprint,
    copyFakeBlueprint,
    lnYeoman,
    runWithJHipster,
};

function getFilesForOptions(files, options, prefix, excludeFiles) {
    const generator = options;
    generator.debug = () => {};
    const outputPathCustomizer = generator.outputPathCustomizer || (file => file);

    const destFiles = Generator.prototype.writeFilesToDisk.call(generator, files, undefined, true, prefix).map(outputPathCustomizer);
    if (excludeFiles === undefined) {
        return destFiles;
    }
    return destFiles.filter(file => !excludeFiles.includes(file));
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

function testInTempDir(cb, keepInTestDir) {
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
    if (!keepInTestDir) {
        revertTempDir(cwd);
    }
    return cwd;
}

function revertTempDir(cwd) {
    process.chdir(cwd);
    /* eslint-disable-next-line no-console */
    console.log(`current cwd: ${process.cwd()}`);
}

function copyBlueprint(sourceDir, packagePath, ...blueprintNames) {
    const nodeModulesPath = `${packagePath}/node_modules`;
    fse.ensureDirSync(nodeModulesPath);
    blueprintNames.forEach(blueprintName => {
        fse.copySync(sourceDir, `${nodeModulesPath}/generator-jhipster-${blueprintName}`);
    });
}

function copyFakeBlueprint(packagePath, ...blueprintName) {
    copyBlueprint(FAKE_BLUEPRINT_DIR, packagePath, ...blueprintName);
}

function lnYeoman(packagePath) {
    const nodeModulesPath = `${packagePath}/node_modules`;
    fse.ensureDirSync(nodeModulesPath);
    fs.symlinkSync(path.join(__dirname, '../../node_modules/yeoman-generator/'), `${nodeModulesPath}/yeoman-generator`);
    fs.symlinkSync(path.join(__dirname, '../../node_modules/yeoman-environment/'), `${nodeModulesPath}/yeoman-environment`);
}

function runWithJHipster(GeneratorOrNamespace, options) {
    const runContext = helpers.run(GeneratorOrNamespace, options).withEnvironment(() => {
        // Create a new test environment with local version.
        const env = helpers.createTestEnv(Environment.createEnv);
        // Skip checks by default.
        Object.assign(env.sharedOptions, {
            skipGit: true,
            'skip-git': true,
            skipChecks: true,
            'skip-checks': true,
        });

        // Setup jhipster environment.
        return cliUtils.setupEnvironment(env);
    });
    runContext.copyFile = function (source, dest) {
        this.doInDir(targetDirectory => {
            const targetFile = path.join(targetDirectory, dest);
            const targetDir = path.dirname(targetFile);
            fse.ensureDirSync(targetDir);
            const sourceFile = path.join(__dirname, '../../', source);
            fse.copySync(sourceFile, targetFile);
        });
        return this;
    };
    runContext.copyTestTemplate = function (source, dest = source) {
        return this.copyFile(path.join('test/templates', source), dest);
    };
    runContext.copyITTemplate = function (source, dest = source) {
        return this.copyFile(path.join('test-integration/samples', source), dest);
    };
    return runContext;
}
