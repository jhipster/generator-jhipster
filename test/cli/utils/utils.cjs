const crypto = require('crypto');
const path = require('path');
const os = require('os');
const fse = require('fs-extra');
const fs = require('fs');

const getPackageFilePath = (...filePath) => path.resolve(__dirname, '../../..', ...filePath);

const getTemplatePath = (...templatePath) => getPackageFilePath('test/templates', ...templatePath);

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
  const cmdPath = getPackageFilePath('dist/cli/jhipster.mjs');
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

function revertTempDir(dest = getPackageFilePath(), tempDir) {
  if (tempDir === undefined) {
    const cwd = process.cwd();
    if (cwd.includes(os.tmpdir())) {
      tempDir = cwd;
    }
  }
  process.chdir(dest);
  if (tempDir && dest !== tempDir) {
    fs.rmSync(tempDir, { recursive: true });
  }
}

function copyTemplateBlueprints(destDir, ...blueprintNames) {
  blueprintNames.forEach(blueprintName =>
    copyBlueprint(getTemplatePath(`blueprints/generator-jhipster-${blueprintName}`), destDir, blueprintName)
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
  copyBlueprint(getTemplatePath('blueprints/fake-blueprint'), destDir, ...blueprintName);
}

function lnYeoman(packagePath) {
  const nodeModulesPath = `${packagePath}/node_modules`;
  fse.ensureDirSync(nodeModulesPath);
  fs.symlinkSync(getPackageFilePath('node_modules/yeoman-generator/'), `${nodeModulesPath}/yeoman-generator`);
  fs.symlinkSync(getPackageFilePath('node_modules/yeoman-environment/'), `${nodeModulesPath}/yeoman-environment`);
}
