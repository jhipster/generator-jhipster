'use strict';

const spawn = require('child_process').spawn,
  chalk = require('chalk');

const WIN_PLATFORM = process.platform === 'win32';

const command = WIN_PLATFORM
  ? (process.env.comspec || 'cmd.exe')
  : 'npm';
const args = WIN_PLATFORM
  ? ['/s', '/c', 'npm outdated', '--json']
  : ['npm', 'outdated', '--json'];

const outDatedCommand = spawn(command, args);

outDatedCommand.stdout.on('data', (data) => {
  const dependencies = JSON.parse(data);
  const dependenciesToUpdate = Object.keys(dependencies).sort();
  if (dependenciesToUpdate.length === 0) {
    console.info(chalk.green('There is no dependency to update.'));
  }
  console.info(`There ${dependenciesToUpdate.length === 1 ? 'is' : 'are'} ${dependenciesToUpdate.length} dependenc${dependenciesToUpdate.length === 1 ? 'y' : 'ies'} to update:`);
  for (let dependency of dependenciesToUpdate) {
    console.info(`\t${dependency} to v${dependencies[dependency].latest}`);
  }
});

outDatedCommand.stderr.on('data', (data) => {
  console.error(
    chalk.red(
      `Oops. Something went wrong with this script.\nHere is the error: ${data}`
    )
  );
});
