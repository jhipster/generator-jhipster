const fail = require('chai').expect.fail;
const glob = require('glob'); // eslint-disable-line import/no-extraneous-dependencies
const CLIEngine = require('eslint').CLIEngine;

const paths = glob.sync('./+(lib|module|scripts|test)/**/*.js');
const engine = new CLIEngine({
  envs: ['node', 'mocha'],
  useEslintrc: true
});
const results = engine.executeOnFiles(paths).results;

describe.only('ESLint', () => {
  for (let i = 0; i < results.length; i++) {
    generateTest(results[i]);
  }
});

function generateTest(result) {
  it(`validates ${result.filePath}`, () => {
    if (result.filePath.indexOf('pegjs_parser.js') === -1 && result.messages.length > 0) {
      if (result.messages.length > 0) {
        fail('', '', formatMessages(result.messages));
      }
    }
  });
}

function formatMessages(messages) {
  const errors = messages.map((message) => {
    const lineAndColumn = message.line && message.column ? `${message.line}:${message.column}` : '';
    const ruleId = message.ruleId ? message.ruleId : '';
    return `${lineAndColumn} ${message.message.slice(0, -1)} - ${ruleId}\n`;
  });
  return `\n${errors.join('')}`;
}
