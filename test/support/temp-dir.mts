import crypto from 'crypto';
import path, { dirname } from 'path';
import os from 'os';
import fse from 'fs-extra';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { getTemplatePath } from './get-template-path.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getPackageFilePath = (...filePath: string[]) => path.resolve(__dirname, '../..', ...filePath);

export function getJHipsterCli() {
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
export function prepareTempDir(): () => void {
  const testEnv = _prepareTempEnv();
  return () => {
    revertTempDir(testEnv.cwd, testEnv.tempDir);
  };
}

export function testInTempDir(cb: (tempDir: string) => any): string | Promise<string> {
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

export function revertTempDir(dest: string = getPackageFilePath(), tempDir?: string) {
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

export function copyTemplateBlueprints(destDir: string, ...blueprintNames: string[]) {
  blueprintNames.forEach(blueprintName =>
    copyBlueprint(getTemplatePath(`blueprints/generator-jhipster-${blueprintName}`), destDir, blueprintName)
  );
}

export function copyBlueprint(sourceDir: string, destDir: string, ...blueprintNames: string[]) {
  const nodeModulesPath = `${destDir}/node_modules`;
  fse.ensureDirSync(nodeModulesPath);
  blueprintNames.forEach(blueprintName => {
    fse.copySync(sourceDir, `${nodeModulesPath}/generator-jhipster-${blueprintName}`);
  });
}

export function copyFakeBlueprint(destDir: string, ...blueprintName: string[]) {
  copyBlueprint(getTemplatePath('blueprints/fake-blueprint'), destDir, ...blueprintName);
}

export function lnYeoman(packagePath: string) {
  const nodeModulesPath = `${packagePath}/node_modules`;
  fse.ensureDirSync(nodeModulesPath);
  fs.symlinkSync(getPackageFilePath('node_modules/yeoman-generator/'), `${nodeModulesPath}/yeoman-generator`);
  fs.symlinkSync(getPackageFilePath('node_modules/yeoman-environment/'), `${nodeModulesPath}/yeoman-environment`);
}
