const crypto = require('crypto');
const path = require('path');
const os = require('os');
const fse = require('fs-extra');
const fs = require('fs');

const FAKE_BLUEPRINT_DIR = path.join(__dirname, '../templates/fake-blueprint');

const getTemplatePath = (...templatePath) => path.resolve(__dirname, '../templates', ...templatePath);

module.exports = {
  getJHipsterCli,
  prepareTempDir,
  testInTempDir,
  revertTempDir,
  copyTemplateBlueprints,
  copyBlueprint,
  copyFakeBlueprint,
  lnYeoman,
  getTemplatePath,
};

function getJHipsterCli() {
  const cmdPath = path.join(__dirname, '../../dist/cli/jhipster.mjs');
  let cmd = `node ${cmdPath} `;
  if (os.platform() === 'win32') {
    // corrected test for windows user
    cmd = cmd.replace(/\\/g, '/');
  }
  return cmd;
}

function _prepareTempEnv() {
  const cwd = process.cwd();
  const tempDir = path.join(os.tmpdir(), crypto.randomBytes(20).toString('hex'));
  process.chdir(os.tmpdir());
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });
  process.chdir(tempDir);
  return { cwd, tempDir: process.cwd() };
}

/**
 * Creates a temporary dir.
 * @return {function} callback to cleanup the test dir.
 */
function prepareTempDir() {
  const testEnv = _prepareTempEnv();
  return () => {
    revertTempDir(testEnv.cwd, testEnv.tempDir);
  };
}

function testInTempDir(cb) {
  const preparedEnv = _prepareTempEnv();
  const cwd = preparedEnv.cwd;
  const cbReturn = cb(preparedEnv.tempDir);
  if (cbReturn instanceof Promise) {
    return cbReturn.then(() => {
      return cwd;
    });
  }
  return cwd;
}

function revertTempDir(dest = path.join(__dirname, '..', '..'), tempDir) {
  if (tempDir === undefined) {
    const cwd = process.cwd();
    if (cwd.includes(os.tmpdir())) {
      tempDir = cwd;
    }
  }
  if (tempDir && dest !== tempDir) {
    fs.rmSync(tempDir, { recursive: true });
  }
  process.chdir(dest);
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
