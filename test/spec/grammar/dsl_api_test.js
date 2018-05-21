const expect = require('chai').expect;
const tokens = require('../../../lib/dsl/lexer').tokens;
const getSyntacticAutoCompleteSuggestions = require('../../../lib/dsl/api').getSyntacticAutoCompleteSuggestions;
const parse = require('../../../lib/dsl/api').parse;

describe('JDL DSL API', () => {
  describe('when wanting an AST', () => {
    describe('with a valid input', () => {
      it('returns an AST', () => {
        const ast = parse('entity A {field String}');
        expect(ast.entities).to.have.lengthOf(1);
        expect(ast.entities[0]).to.deep.eql({
          name: 'A',
          tableName: 'A',
          body: [
            {
              name: 'field',
              type: 'String',
              validations: [],
              javadoc: null
            }
          ],
          javadoc: null
        });
      });
    });

    describe('with a lexing error', () => {
      let parseInvalidToken;
      before(() => {
        // '±' is not a valid token in JDL
        parseInvalidToken = () => parse('entity ± {');
      });

      it('throws an error with offset information', () => {
        expect(parseInvalidToken).to
          .throw('offset: 7');
      });

      it('throws an error with unexpected character', () => {
        expect(parseInvalidToken).to
          .throw('±');
      });
    });

    describe('with a Parsing error', () => {
      describe('with an unexpected token', () => {
        let parseWrongClosingBraces;

        before(() => {
          // wrong type of closing parenthesis ']'
          parseWrongClosingBraces = () => parse('entity Person { ]');
        });

        it('throws an error with position information', () => {
          expect(parseWrongClosingBraces).to
            .throw()
            .and.to.have.property('message')
          // chain assertions to avoid assuming the order of the position information text.
            .that.includes('line: 1')
            .that.includes('column: 17');
        });

        it('throws an error with typeof MismatchTokenException', () => {
          expect(parseWrongClosingBraces).to
            .throw('MismatchedTokenException');
        });
      });

      describe('with a missing token at EOF', () => {
        let parseMissingClosingBraces;

        before(() => {
          // No Closing parenthesis
          parseMissingClosingBraces = () => parse('entity Person {');
        });

        it('throws an error with typeof MismatchTokenException', () => {
          expect(parseMissingClosingBraces).to
            .throw('MismatchedTokenException');
        });

        it('throws an error without any location information', () => {
          // The 'EOF' token that is found instead of the expected '}' is a virtual token
          // It has no location information to report, An error (api.js) handler may choose
          // to manually add the last line/column in that case.
          expect(parseMissingClosingBraces).to.not.throw('line: 1');
        });
      });
    });

    describe('with a semantic validation error', () => {
      it('throws an error', () => {
        // lower case entityName first char
        const invalidInput = 'entity person { }';
        expect(() => parse(invalidInput)).to
          .throw(/.+\/\^\[A-Z][^]+line: 1.+column: 8/);
      });
    });
  });

  describe('when wanting an auto-completion', () => {
    describe('with an empty text', () => {
      it('provides suggestions', () => {
        const input = '';
        const result = getSyntacticAutoCompleteSuggestions(input);
        expect(result).to.have.lengthOf(17);
        expect(result).to.have.members([
          tokens.APPLICATION,
          tokens.NAME,
          tokens.ENTITY,
          tokens.RELATIONSHIP,
          tokens.ENUM,
          tokens.DTO,
          tokens.SERVICE,
          tokens.SEARCH,
          tokens.MICROSERVICE,
          tokens.COMMENT,
          tokens.PAGINATE,
          tokens.SKIP_CLIENT,
          tokens.SKIP_SERVER,
          tokens.NO_FLUENT_METHOD,
          tokens.ANGULAR_SUFFIX,
          tokens.FILTER,
          tokens.CLIENT_ROOT_FOLDER
        ]);
      });
    });
    describe('with a custom start rule', () => {
      it('provides suggestions', () => {
        const input = 'lastName string ';
        const result = getSyntacticAutoCompleteSuggestions(
          input,
          'fieldDeclaration'
        );
        expect(result).to.have.lengthOf(4);
        // Note that because we are using token Inheritance with the MIN_MAX_KEYWORD an auto-complete provider would have
        // to translate this to concrete tokens (MIN/MAX/MAX_BYTES/MIN_BYTES/...)
        expect(result).to.have.members([
          tokens.REQUIRED,
          tokens.MIN_MAX_KEYWORD,
          tokens.PATTERN,
          tokens.COMMENT
        ]);
      });
    });
    describe('with a default start rule', () => {
      it('provides suggestions', () => {
        const input = `
            entity person {
            lastName string `;

        const result = getSyntacticAutoCompleteSuggestions(input);
        expect(result).to.have.lengthOf(7);
        expect(result).to.have.members([
          tokens.REQUIRED,
          tokens.MIN_MAX_KEYWORD,
          tokens.PATTERN,
          // Note that this will have more suggestions than the previous spec as there is a deeper rule stack.
          tokens.COMMA,
          tokens.RCURLY,
          tokens.COMMENT,
          tokens.NAME
        ]);
      });
    });
  });
});
