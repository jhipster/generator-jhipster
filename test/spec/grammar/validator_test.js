const expect = require('chai').expect;
const parse = require('../../../lib/dsl/api').parse;

describe('JDLSyntaxValidatorVisitor', () => {
  context('when declaring an application', () => {
    context('and using for applicationType', () => {
      context('a valid value', () => {
        it('does not report a syntax error for name', () => {
          expect(() => parse(`
            application {
              config {
                applicationType foo
              }
            }`)).to.not.throw();
        });
      });

      context('an invalid value', () => {
        context('such as a number', () => {
          it('will report a syntax error', () => {
            expect(() => parse(`
              application {
                config {
                  applicationType 666
                }
              }`)).to.throw('A name is expected, but found: "666"');
          });
        });

        context('such as an uppercase name', () => {
          it('will report a syntax error', () => {
            expect(() => parse(`
              application {
                config {
                  applicationType foo.bar
                }
              }`)).to.throw('A single name is expected, but found a fully qualified name');
          });
        });
      });
    });

    context('and using for packageName', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                packageName foo.bar
              }
            }`)).to.not.throw();
        });
      });

      context('an invalud value', () => {
        it('will report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                packageName "oops"
              }
            }`)).to.throw('A fully qualified name is expected, but found: ""oops""');
        });
      });
    });

    context('and using for languages', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                languages [a,b, c]
              }
            }`)).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                languages true
              }
            }`)).to.throw('An array of names is expected, but found: "true"');
        });
      });
    });

    context('and using for serverPort', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                serverPort 6666
              }
            }`)).to.not.throw();
        });
      });

      context('an invalid value', () => {
        context('such as letters', () => {
          it('will report a syntax error', () => {
            expect(() => parse(`
              application {
                config {
                  serverPort abc
                }
              }`)).to.throw('An integer literal is expected, but found: "abc"');
          });
        });
      });
    });

    /* TODO: remove the quotes. The test should fail.
    context('and using for uaaBaseName', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                uaaBaseName "bamba"
              }
            }`)).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                uaaBaseName abc
              }
            }`))
            .to.throw('A string literal is expected, but found: "abc"');
        });
      });
    }); */

    context('and using for enableHibernateCache', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                enableHibernateCache true
              }
            }`)).to.not.throw();
        });
      });


      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                enableHibernateCache 666
              }
            }`)).to.throw('A boolean literal is expected, but found: "666"');
        });
      });
    });
  });
});
