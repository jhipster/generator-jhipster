import chalk from 'chalk';
import { execaCommandSync } from 'execa';

/**
 * Check if installed java version is compatible
 * @param {string[]} [javaCompatibleVersions]
 * @return {import('../../../base/api.mjs').CheckResult & { javaVersion?: string }}
 */
export default javaCompatibleVersions => {
  try {
    const { exitCode, stderr } = execaCommandSync('java -version', { stdio: 'pipe' });
    if (exitCode === 0 && stderr) {
      const matchResult = stderr.match(/(?:java|openjdk)(?: version)? "?(.*)"? /s);
      if (matchResult && matchResult.length > 0) {
        const javaVersion = matchResult[1];
        const info = `Detected java version ${javaVersion}`;
        if (javaCompatibleVersions && !javaVersion.match(new RegExp(`(${javaCompatibleVersions.map(ver => `^${ver}`).join('|')})`))) {
          const [latest, ...others] = javaCompatibleVersions.concat().reverse();
          const humanizedVersions = `${others.reverse().join(', ')} or ${latest}`;
          const warning = `Java ${humanizedVersions} are not found on your computer. Your Java version is: ${chalk.yellow(javaVersion)}`;
          return { info, warning, javaVersion };
        }
        return { info, javaVersion };
      }
    }
    return { error: `Error parsing Java version. Output: ${stderr}` };
  } catch (error) {
    return { error: `Java was not found on your computer (${error.message}).` };
  }
};
