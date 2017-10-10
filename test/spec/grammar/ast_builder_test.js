/* eslint-disable key-spacing, no-unused-expressions */
const expect = require('chai').expect;
const parse = require('../../../lib/dsl/poc/api').parse;
const buildAst = require('../../../lib/dsl/poc/ast_builder').buildAst;

describe('ASTBuilder', () => {
  it('can build an ast for a simple entity', () => {
    const input = 'entity Person { name string }';
    const parseResult = parse(input);
    expect(parseResult.lexErrors).to.be.empty;
    expect(parseResult.parseErrors).to.be.empty;

    const ast = buildAst(parseResult.cst);
    expect(ast).to.deep.equal({
      constants: [],
      entities:  [
        {
          fields:    [
            {
              name:        'name',
              type:        'string',
              validations: []
            }
          ],
          name:      'Person',
          tableName: undefined
        }
      ]
    });
  });

  it('can build an ast for a complex JDL', () => {
    const input = `
    entity Person (HRXD1)
    { 
      name string, 
      age number max(max_age)
    }
    
    max_age = 120
    
    entity Job 
    { 
        address string required
    }  
      `;
    const parseResult = parse(input);
    expect(parseResult.lexErrors).to.be.empty;
    expect(parseResult.parseErrors).to.be.empty;

    const ast = buildAst(parseResult.cst);
    expect(ast).to.deep.equal({
      entities:  [
        {
          name:      'Person',
          tableName: 'HRXD1',
          fields:    [
            {
              name:        'name',
              type:        'string',
              validations: []
            },
            {
              name:        'age',
              type:        'number',
              validations: [
                {
                  limit:          'max_age',
                  validationType: 'max'
                }]
            }]
        },
        {
          name:   'Job',
          tableName: undefined,
          fields: [
            {
              name:        'address',
              type:        'string',
              validations: [
                {
                  validationType: 'required'
                }]
            }]
        }
      ],
      constants: [
        {
          name:  'max_age',
          value: 120
        }
      ]
    });
  });
});
