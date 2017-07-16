

const fail = require('chai').expect;
const glob = require('glob'); // eslint-disable-line import/no-extraneous-dependencies
const CLIEngine = require('eslint').CLIEngine;

const paths = glob.sync('./+(lib|module|scripts|test)/**/*.js');
const engine = new CLIEngine({
  envs: ['node', 'mocha'],
  useEslintrc: true
});
const results = engine.executeOnFiles(paths).results;

describe('ESLint', () => {
  for (let i = 0; i < results.length; i++) {
    generateTest(results[i]);
  }
});

function generateTest(result) {
  it(`validates ${result.filePath}`, () => {
    if (result.messages.length > 0) {
      fail(formatMessages(result.messages));
    }
  });
}

function formatMessages(messages) {
  const errors = messages.map(message => `${message.line}:${message.column} ${message.message.slice(0, -1)} - ${message.ruleId}\n`);
  return `\n${errors.join('')}`;
}
