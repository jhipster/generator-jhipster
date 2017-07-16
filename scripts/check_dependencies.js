

const spawn = require('child_process').spawn;
const chalk = require('chalk'); // eslint-disable-line import/no-extraneous-dependencies, no-console

const WIN_PLATFORM = process.platform === 'win32';

const command = WIN_PLATFORM
  ? (process.env.comspec || 'cmd.exe')
  : 'npm';
const args = WIN_PLATFORM
  ? ['/s', '/c', 'npm outdated', '--json']
  : ['outdated', '--json'];

const outDatedCommand = spawn(command, args);

outDatedCommand.stdout.on('data', (data) => {
  const dependencies = JSON.parse(data || {});
  const dependenciesToUpdate = Object.keys(dependencies).sort();
  console.info(`There ${dependenciesToUpdate.length === 1 ? 'is' : 'are'} ${dependenciesToUpdate.length} dependenc${dependenciesToUpdate.length === 1 ? 'y' : 'ies'} to update:`);
  dependenciesToUpdate.forEach((dependency) => {
    console.info(`\t${dependency} to v${dependencies[dependency].latest}`);
  });
});

outDatedCommand.stderr.on('data', (data) => {
  console.error(
    chalk.red(
      `Oops. Something went wrong with this script.\nHere is the error: ${data}`
    )
  );
});
