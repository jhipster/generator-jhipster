'use strict';

const checkDependencies = require('check-dependencies'),
  chalk = require('chalk');

checkDependencies().then((output) => {
  if (output.status === 0) {
    console.info(chalk.green("Everything's OK, nothing to update!"));
    process.exit(0);
  }
  console.error(
    chalk.red(
      `${output.error.length - 1} ${output.error.length - 1 === 1 ? 'lib needs' : 'libs need'} an update:`));
  for (let i = 0; i < output.error.length - 1; i++) {
    console.error(`\t${output.error[i]}`);
  }
});
