import os from 'os';
import { exec } from 'child_process';
import { buildToolTypes } from '../../jdl/index.js';

const { GRADLE } = buildToolTypes;
const isWin32 = os.platform() === 'win32';

/**
 * build a generated application.
 *
 * @param {String} buildTool - maven | gradle
 * @param {String} profile - dev | prod
 * @param {Boolean} buildWar - build a war instead of a jar
 * @param {Function} cb - callback when build is complete
 * @returns {object} the command line and its result
 */
export const buildApplication = (buildTool, profile, buildWar, cb) => {
  let buildCmd = 'mvnw -ntp verify -B';

  if (buildTool === GRADLE) {
    buildCmd = 'gradlew';
    if (buildWar) {
      buildCmd += ' bootWar';
    } else {
      buildCmd += ' bootJar';
    }
  }
  if (buildWar) {
    buildCmd += ' -Pwar';
  }

  if (!isWin32) {
    buildCmd = `./${buildCmd}`;
  }
  buildCmd += ` -P${profile}`;
  return {
    stdout: exec(buildCmd, { maxBuffer: 1024 * 10000 }, cb).stdout,
    buildCmd,
  };
};
