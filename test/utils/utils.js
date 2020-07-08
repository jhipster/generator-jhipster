const path = require('path');
const os = require('os');
const shelljs = require('shelljs');
const assert = require('yeoman-assert');
const fse = require('fs-extra');
const fs = require('fs');

const Generator = require('../../generators/generator-base');
const constants = require('../../generators/generator-constants');

const DOCKER_DIR = constants.DOCKER_DIR;
const FAKE_BLUEPRINT_DIR = path.join(__dirname, '../templates/fake-blueprint');

module.exports = {
    getFilesForOptions,
    shouldBeV3DockerfileCompatible,
    getJHipsterCli,
    prepareTempDir,
    testInTempDir,
    revertTempDir,
    copyTemplateBlueprints,
    copyBlueprint,
    copyFakeBlueprint,
    lnYeoman,
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

function _prepareTempEnv() {
    const cwd = process.cwd();
    /* eslint-disable-next-line no-console */
    console.log(`current cwd: ${cwd}`);
    const tempDir = path.join(os.tmpdir(), 'jhitemp');
    process.chdir(os.tmpdir());
    shelljs.rm('-rf', tempDir);
    shelljs.mkdir('-p', tempDir);
    process.chdir(tempDir);
    /* eslint-disable-next-line no-console */
    console.log(`New cwd: ${process.cwd()}`);
    return { cwd, tempDir };
}

function prepareTempDir() {
    return _prepareTempEnv().cwd;
}

function testInTempDir(cb, keepInTestDir) {
    const preparedEnv = _prepareTempEnv();
    const cwd = preparedEnv.cwd;
    const cbReturn = cb(preparedEnv.tempDir);
    if (cbReturn instanceof Promise) {
        return cbReturn.then(() => {
            if (!keepInTestDir) {
                revertTempDir(cwd);
            }
            return cwd;
        });
    }
    if (!keepInTestDir) {
        revertTempDir(cwd);
    }
    return cwd;
}

function revertTempDir(cwd) {
    process.chdir(cwd);
    /* eslint-disable-next-line no-console */
    console.log(`reverted to cwd: ${process.cwd()}`);
}

function copyTemplateBlueprints(destDir, ...blueprintNames) {
    blueprintNames.forEach(blueprintName =>
        copyBlueprint(path.join(__dirname, `../templates/blueprints/generator-jhipster-${blueprintName}`), destDir, blueprintName)
    );
}

function copyBlueprint(sourceDir, destDir, ...blueprintNames) {
    const nodeModulesPath = `${destDir}/node_modules`;
    fse.ensureDirSync(nodeModulesPath);
    blueprintNames.forEach(blueprintName => {
        fse.copySync(sourceDir, `${nodeModulesPath}/generator-jhipster-${blueprintName}`);
    });
}

function copyFakeBlueprint(destDir, ...blueprintName) {
    copyBlueprint(FAKE_BLUEPRINT_DIR, destDir, ...blueprintName);
}

function lnYeoman(packagePath) {
    const nodeModulesPath = `${packagePath}/node_modules`;
    fse.ensureDirSync(nodeModulesPath);
    fs.symlinkSync(path.join(__dirname, '../../node_modules/yeoman-generator/'), `${nodeModulesPath}/yeoman-generator`);
    fs.symlinkSync(path.join(__dirname, '../../node_modules/yeoman-environment/'), `${nodeModulesPath}/yeoman-environment`);
}
