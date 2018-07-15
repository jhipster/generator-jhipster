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
        context('such as an invalid character', () => {
          it('will report a syntax error', () => {
            expect(() => parse(`
              application {
                config {
                  applicationType -
                }
              }`)).to.throw('unexpected character: ->-<-');
          });
        });
        context('such as a capitalized letters', () => {
          it('will report a syntax error', () => {
            expect(() => parse(`
              application {
                config {
                  applicationType FOO
                }
              }`)).to.throw('The applicationType property name must match: /^[a-z]+$/');
          });
        });

        context('having illegal characters', () => {
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
    context('and using for authenticationType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                authenticationType jwt
              }
            }`)).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                authenticationType jwt42
              }
            }`)).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                authenticationType "jwt"
              }
            }`)).to.throw('A name is expected, but found: ""jwt""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                authenticationType 42
              }
            }`)).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for baseName', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                baseName mySuperApp
              }
            }`)).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                baseName mySuperApp42
              }
            }`)).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                baseName "mySuperApp"
              }
            }`)).to.throw('A name is expected, but found: ""mySuperApp""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                baseName 42
              }
            }`)).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for buildTool', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                buildTool maven
              }
            }`)).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                buildTool maven42
              }
            }`)).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                buildTool "maven"
              }
            }`)).to.throw('A name is expected, but found: ""maven""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                buildTool 42
              }
            }`)).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for cacheProvider', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                cacheProvider ehcache
              }
            }`)).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                cacheProvider ehcache42
              }
            }`)).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                cacheProvider "ehcache"
              }
            }`)).to.throw('A name is expected, but found: ""ehcache""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                cacheProvider 42
              }
            }`)).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for clientFramework', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                clientFramework angular
              }
            }`)).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                clientFramework angular42
              }
            }`)).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                clientFramework "react"
              }
            }`)).to.throw('A name is expected, but found: ""react""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                clientFramework 42
              }
            }`)).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for clientPackageManager', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                clientPackageManager yarn
              }
            }`)).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                clientPackageManager yarn42
              }
            }`)).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                clientPackageManager "yarn"
              }
            }`)).to.throw('A name is expected, but found: ""yarn""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                clientPackageManager 42
              }
            }`)).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for databaseType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                databaseType sql
              }
            }`)).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                databaseType sql42
              }
            }`)).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                databaseType "sql"
              }
            }`)).to.throw('A name is expected, but found: ""sql""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                databaseType 42
              }
            }`)).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for devDatabaseType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                devDatabaseType postgresql
              }
            }`)).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                devDatabaseType postgresql42
              }
            }`)).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                devDatabaseType "postgresql"
              }
            }`)).to.throw('A name is expected, but found: ""postgresql""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() => parse(`
            application {
              config {
                devDatabaseType 42
              }
            }`)).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
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
    context('and using for jhipsterVersion', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                jhipsterVersion "5.0.0"
              }
            }`)).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() => parse(`
            application {
              config {
                jhipsterVersion abc
              }
            }`)).to.throw('A string literal is expected, but found: "abc"\n\tat line: 4, column: 33');
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
        context('such as having numbers inside the list', () => {
          it('will report a syntax error', () => {
            expect(() => parse(`
            application {
              config {
                languages [fr, en, 42]
              }
            }`)).to.throw('MismatchedTokenException: Expecting token of type --> NAME <-- but found --> \'42\' <--');
          });
        });
        context('such as not a list', () => {
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

      context('an invalid value', () => {
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
    });
  });
});
