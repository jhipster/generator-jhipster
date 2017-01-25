'use strict';

const fail = require('chai').expect,
  glob = require('glob'),
  CLIEngine = require('eslint').CLIEngine;

const paths = glob.sync('./+(lib|module|test)/**/*.js');
const engine = new CLIEngine({
  envs: ['node', 'mocha'],
  useEslintrc: true
});
const results = engine.executeOnFiles(paths).results;

describe('ESLint', () => {
  results.forEach((result) => generateTest(result));
});

function generateTest(result) {
  const {filePath, messages} = result;
  it(`validates ${filePath}`, function () {
    if (messages.length > 0) {
      fail(formatMessages(messages));
    }
  });
}

function formatMessages(messages) {
  const errors = messages.map((message) => {
    return `${message.line}:${message.column} ${message.message.slice(0, -1)} - ${message.ruleId}\n`;
  });
  return `\n${errors.join('')}`;
}
