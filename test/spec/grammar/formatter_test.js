/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;
const parse = require('../../../lib/dsl/poc/api').parse;
const formatJDL = require('../../../lib/dsl/poc/formatter').formatJDL;

describe('JDL Formatter poc', () => {
  it('can format a simple entity', () => {
    //                -->ERR<-- too many spaces between "entity" and "person"
    const input = 'entity   Person { name string }';
    const parseResult = parse(input);
    expect(parseResult.lexErrors).to.be.empty;
    expect(parseResult.parseErrors).to.be.empty;

    const formattedOutput = formatJDL(parseResult.cst, input);
    expect(formattedOutput).to.equal('entity Person { name string }');
  });

  it('can format a simple entity with many fields', () => {
    const input = 'entity Person {' +
      ' name string   ,' +
      ' age integer ,' + // the commas should appear immediately after the type
      ' image blob' +
      '}';
    const parseResult = parse(input);
    expect(parseResult.lexErrors).to.be.empty;
    expect(parseResult.parseErrors).to.be.empty;

    const formattedOutput = formatJDL(parseResult.cst, input);
    expect(formattedOutput).to.equal('entity Person {' +
      ' name string,' +
      ' age integer,' +
      ' image blob' +
      '}');
  });
});
