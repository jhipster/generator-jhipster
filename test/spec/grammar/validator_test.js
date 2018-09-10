/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const expect = require('chai').expect;
const parse = require('../../../lib/dsl/api').parse;

describe('JDLSyntaxValidatorVisitor', () => {
  context('when declaring an application', () => {
    context('and using for applicationType', () => {
      context('a valid value', () => {
        it('does not report a syntax error for name', () => {
          expect(() =>
            parse(`
            application {
              config {
                applicationType foo
              }
            }`)
          ).to.not.throw();
        });
      });
      context('an invalid value', () => {
        context('such as a number', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  applicationType 666
                }
              }`)
            ).to.throw('A name is expected, but found: "666"');
          });
        });
        context('such as an invalid character', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  applicationType -
                }
              }`)
            ).to.throw('unexpected character: ->-<-');
          });
        });
        context('such as a capitalized letters', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  applicationType FOO
                }
              }`)
            ).to.throw('The applicationType property name must match: /^[a-z]+$/');
          });
        });

        context('having illegal characters', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  applicationType foo.bar
                }
              }`)
            ).to.throw('A single name is expected, but found a fully qualified name');
          });
        });
      });
    });
    context('and using for authenticationType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                authenticationType jwt
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                authenticationType jwt42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                authenticationType "jwt"
              }
            }`)
            ).to.throw('A name is expected, but found: ""jwt""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                authenticationType 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for baseName', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                baseName mySuperApp
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                baseName mySuperApp42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                baseName "mySuperApp"
              }
            }`)
            ).to.throw('A name is expected, but found: ""mySuperApp""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                baseName 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for buildTool', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                buildTool maven
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                buildTool maven42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                buildTool "maven"
              }
            }`)
            ).to.throw('A name is expected, but found: ""maven""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                buildTool 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for cacheProvider', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                cacheProvider ehcache
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                cacheProvider ehcache42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                cacheProvider "ehcache"
              }
            }`)
            ).to.throw('A name is expected, but found: ""ehcache""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                cacheProvider 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for clientFramework', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientFramework angular
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientFramework angular42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientFramework "react"
              }
            }`)
            ).to.throw('A name is expected, but found: ""react""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientFramework 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for clientPackageManager', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientPackageManager yarn
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientPackageManager yarn42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientPackageManager "yarn"
              }
            }`)
            ).to.throw('A name is expected, but found: ""yarn""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientPackageManager 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for databaseType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                databaseType sql
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                databaseType sql42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                databaseType "sql"
              }
            }`)
            ).to.throw('A name is expected, but found: ""sql""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                databaseType 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for devDatabaseType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                devDatabaseType postgresql
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                devDatabaseType postgresql42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                devDatabaseType "postgresql"
              }
            }`)
            ).to.throw('A name is expected, but found: ""postgresql""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                devDatabaseType 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for enableHibernateCache', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableHibernateCache true
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableHibernateCache 666
              }
            }`)
          ).to.throw('A boolean literal is expected, but found: "666"');
        });
      });
    });
    context('and using for enableSwaggerCodegen', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableSwaggerCodegen true
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableSwaggerCodegen 666
              }
            }`)
          ).to.throw('A boolean literal is expected, but found: "666"');
        });
      });
    });
    context('and using for enableTranslation', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableTranslation true
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableTranslation 666
              }
            }`)
          ).to.throw('A boolean literal is expected, but found: "666"');
        });
      });
    });
    context('and using for frontendBuilder', () => {
      context('a valid value', () => {
        it('does not report a syntax error for name', () => {
          expect(() =>
            parse(`
            application {
              config {
                frontendBuilder fooBar
              }
            }`)
          ).to.not.throw();
        });
      });
      context('an invalid value', () => {
        context('such as a number', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  frontendBuilder 666
                }
              }`)
            ).to.throw('A name is expected, but found: "666"');
          });
        });
        context('such as an invalid character', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  frontendBuilder -
                }
              }`)
            ).to.throw('unexpected character: ->-<-');
          });
        });

        context('having illegal characters', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  frontendBuilder foo.bar
                }
              }`)
            ).to.throw('A single name is expected, but found a fully qualified name');
          });
        });
      });
    });
    context('and using for jhipsterVersion', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                jhipsterVersion "5.0.0"
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                jhipsterVersion abc
              }
            }`)
          ).to.throw('A string literal is expected, but found: "abc"\n\tat line: 4, column: 33');
        });
      });
    });
    context('and using for jhiPrefix', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                jhiPrefix abcD42-_f
              }
            }`)
          ).to.not.throw();
        });
      });
      context('an invalid value', () => {
        context('when the prefix begins by a digit', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                jhiPrefix 42abc
              }
            }`)
            ).to.throw("Exception: Expecting --> '}' <-- but found --> 'abc'");
          });
        });
        context('when the prefix begins by a dash', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                jhiPrefix -abc
              }
            }`)
            ).to.throw('unexpected character: ->-<-');
          });
        });
      });
    });
    context('and using for languages', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                languages [ab,bc, cd, zh-cn]
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        context('such as having numbers inside the list', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                languages [fr, en, 42]
              }
            }`)
            ).to.throw("MismatchedTokenException: Expecting token of type --> NAME <-- but found --> '42' <--");
          });
        });
        context('such as not a list', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                languages true
              }
            }`)
            ).to.throw('An array of names is expected, but found: "true"');
          });
        });
      });
    });
    context('and using for messageBroker', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                messageBroker ehcache
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                messageBroker ehcache42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                messageBroker "ehcache"
              }
            }`)
            ).to.throw('A name is expected, but found: ""ehcache""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                messageBroker 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for nativeLanguage', () => {
      context('a valid value', () => {
        it('does not report a syntax error for name', () => {
          expect(() =>
            parse(`
            application {
              config {
                nativeLanguage foo
              }
            }`)
          ).to.not.throw();
        });
      });
      context('an invalid value', () => {
        context('such as a number', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  nativeLanguage 666
                }
              }`)
            ).to.throw('A name is expected, but found: "666"');
          });
        });
        context('such as an invalid character', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  nativeLanguage -
                }
              }`)
            ).to.throw('unexpected character: ->-<-');
          });
        });
        context('such as a capitalized letters', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  nativeLanguage FOO
                }
              }`)
            ).to.throw('The nativeLanguage property name must match: /^[a-z]+(-[A-Za-z0-9]+)*$/');
          });
        });

        context('having illegal characters', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  nativeLanguage foo.bar
                }
              }`)
            ).to.throw('A single name is expected, but found a fully qualified name');
          });
        });
      });
    });
    context('and using for packageName', () => {
      context('a valid value', () => {
        it('does not report a syntax error for name', () => {
          expect(() =>
            parse(`
            application {
              config {
                packageName foo
              }
            }`)
          ).to.not.throw();
        });
      });
      context('an invalid value', () => {
        context('such as an invalid character', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  packageName -
                }
              }`)
            ).to.throw('unexpected character: ->-<-');
          });
        });
        context('such as a capitalized letters', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  packageName FOO
                }
              }`)
            ).to.throw('The packageName property name must match: /^[a-z]+$/');
          });
        });
      });
    });
    context('and using for prodDatabaseType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                prodDatabaseType ehcache
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                prodDatabaseType ehcache42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                prodDatabaseType "ehcache"
              }
            }`)
            ).to.throw('A name is expected, but found: ""ehcache""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                prodDatabaseType 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for searchEngine', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                searchEngine ehcache
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                searchEngine ehcache42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                searchEngine "ehcache"
              }
            }`)
            ).to.throw('A name is expected, but found: ""ehcache""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                searchEngine 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for serverPort', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                serverPort 6666
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        context('such as letters', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  serverPort abc
                }
              }`)
            ).to.throw('An integer literal is expected, but found: "abc"');
          });
        });
      });
    });
    context('and using for serviceDiscoveryType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                serviceDiscoveryType ehcache
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                serviceDiscoveryType ehcache42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                serviceDiscoveryType "ehcache"
              }
            }`)
            ).to.throw('A name is expected, but found: ""ehcache""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                serviceDiscoveryType 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
    context('and using for skipClient', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipClient true
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipClient 666
              }
            }`)
          ).to.throw('A boolean literal is expected, but found: "666"');
        });
      });
    });
    context('and using for skipServer', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipServer true
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipServer 666
              }
            }`)
          ).to.throw('A boolean literal is expected, but found: "666"');
        });
      });
    });
    context('and using for skipUserManagement', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipUserManagement true
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipUserManagement 666
              }
            }`)
          ).to.throw('A boolean literal is expected, but found: "666"');
        });
      });
    });
    context('and using for testFrameworks', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                testFrameworks [a,b, c]
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        context('such as having numbers inside the list', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                testFrameworks [fr, en, 42]
              }
            }`)
            ).to.throw("MismatchedTokenException: Expecting token of type --> NAME <-- but found --> '42' <--");
          });
        });
        context('such as not a list', () => {
          it('will report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                testFrameworks true
              }
            }`)
            ).to.throw('An array of names is expected, but found: "true"');
          });
        });
      });
    });
    context('and using for uaaBaseName', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                uaaBaseName "bamba"
              }
            }`)
          ).to.not.throw();
        });
      });
      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                uaaBaseName abc
              }
            }`)
          ).to.throw('A string literal is expected, but found: "abc"');
        });
      });
    });
    context('and using for useSass', () => {
      context('a valid value', () => {
        it('does not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                useSass true
              }
            }`)
          ).to.not.throw();
        });
      });

      context('an invalid value', () => {
        it('will report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                useSass 666
              }
            }`)
          ).to.throw('A boolean literal is expected, but found: "666"');
        });
      });
    });
    context('and using for websocket', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                websocket ehcache-
              }
            }`)
            ).to.not.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('does not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                websocket ehcache42
              }
            }`)
            ).to.not.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                websocket "ehcache"
              }
            }`)
            ).to.throw('A name is expected, but found: ""ehcache""');
          });
        });
        context('such as numbers', () => {
          it('fails', () => {
            expect(() =>
              parse(`
            application {
              config {
                websocket 42
              }
            }`)
            ).to.throw('A name is expected, but found: "42"');
          });
        });
      });
    });
  });
});
