/**
 * Copyright 2013-2020 the original author or authors from the JHipster project.
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
/* eslint-disable no-useless-escape */

const { expect } = require('chai');
const parse = require('../../../lib/dsl/api').parse;

describe('JDLSyntaxValidatorVisitor', () => {
  context('when declaring an application', () => {
    context('and using for applicationType', () => {
      context('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(`
            application {
              config {
                applicationType foo
              }
            }`)
          ).not.to.throw();
        });
      });
      context('an invalid value', () => {
        context('such as a number', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  applicationType 666
                }
              }`)
            ).to.throw(new RegExp('^A name is expected, but found: "666"'));
          });
        });
        context('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  applicationType -
                }
              }`)
            ).to.throw(new RegExp('^unexpected character: ->-<-'));
          });
        });
        context('such as a capitalized letters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  applicationType FOO
                }
              }`)
            ).to.throw(new RegExp('^The applicationType property name must match: '));
          });
        });

        context('having illegal characters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  applicationType foo.bar
                }
              }`)
            ).to.throw(new RegExp('^A single name is expected, but found a fully qualified name'));
          });
        });
      });
    });
    context('and using for authenticationType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                authenticationType jwt
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                authenticationType jwt42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                authenticationType "jwt"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""jwt""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                authenticationType 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for baseName', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                baseName mySuperApp
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                baseName mySuperApp42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                baseName "mySuperApp"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""mySuperApp""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                baseName 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for blueprints', () => {
      context('an empty blueprint name', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [, generator-jhipster-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name with uppercase letters', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [Generator-JHipster-Super-Blueprint]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name starting with .', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [.generator-jhipster-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name starting with _', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [_generator-jhipster-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name with a whitespace inside', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [generator -jhipster-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name containing ~', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [generator-jh~ipster-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name containing ~', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [generator-jh~ipster-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name containing \\', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [generator-jh\\ipster-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context("a blueprint name containing '", () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [generator-'jhipster-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name containing !', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [generator-jhipster!-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name containing (', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [generator-(jhipster-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name containing )', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [generator-jhipster)-vuejs]
  }
}`)
          ).to.throw();
        });
      });
      context('a blueprint name containing *', () => {
        it('should fail', () => {
          expect(() =>
            parse(`application {
  config {
    blueprints [generator-jhipster-vue*js]
  }
}`)
          ).to.throw();
        });
      });
    });
    context('and using for buildTool', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                buildTool maven
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                buildTool maven42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                buildTool "maven"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""maven""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                buildTool 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for cacheProvider', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                cacheProvider ehcache
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                cacheProvider ehcache42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                cacheProvider "ehcache"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""ehcache""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                cacheProvider 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for clientFramework', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientFramework angular
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientFramework angular42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientFramework "react"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""react""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientFramework 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for clientPackageManager', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientPackageManager yarn
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientPackageManager yarn42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientPackageManager "yarn"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""yarn""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                clientPackageManager 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for databaseType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                databaseType sql
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                databaseType sql42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                databaseType "sql"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""sql""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                databaseType 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for devDatabaseType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                devDatabaseType postgresql
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                devDatabaseType postgresql42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                devDatabaseType "postgresql"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""postgresql""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                devDatabaseType 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for enableHibernateCache', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableHibernateCache true
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableHibernateCache 666
              }
            }`)
          ).to.throw(new RegExp('^A boolean literal is expected, but found: "666"'));
        });
      });
    });
    context('and using for enableSwaggerCodegen', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableSwaggerCodegen true
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableSwaggerCodegen 666
              }
            }`)
          ).to.throw(new RegExp('^A boolean literal is expected, but found: "666"'));
        });
      });
    });
    context('and using for enableTranslation', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableTranslation true
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                enableTranslation 666
              }
            }`)
          ).to.throw(new RegExp('^A boolean literal is expected, but found: "666"'));
        });
      });
    });
    context('and using for frontendBuilder', () => {
      context('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(`
            application {
              config {
                frontendBuilder fooBar
              }
            }`)
          ).not.to.throw();
        });
      });
      context('an invalid value', () => {
        context('such as a number', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  frontendBuilder 666
                }
              }`)
            ).to.throw(new RegExp('^A name is expected, but found: "666"'));
          });
        });
        context('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  frontendBuilder -
                }
              }`)
            ).to.throw(new RegExp('^unexpected character: ->-<-'));
          });
        });

        context('having illegal characters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  frontendBuilder foo.bar
                }
              }`)
            ).to.throw(new RegExp('^A single name is expected, but found a fully qualified name'));
          });
        });
      });
    });
    context('and using for jhipsterVersion', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                jhipsterVersion "5.0.0"
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                jhipsterVersion abc
              }
            }`)
          ).to.throw(new RegExp('^A string literal is expected, but found: "abc"\\n\\tat line: 4, column: 33'));
        });
      });
    });
    context('and using for jhiPrefix', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                jhiPrefix abcD42-_f
              }
            }`)
          ).not.to.throw();
        });
      });
      context('an invalid value', () => {
        context('when the prefix begins by a digit', () => {
          it('should fail', () => {
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
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                jhiPrefix -abc
              }
            }`)
            ).to.throw(new RegExp('^unexpected character: ->-<-'));
          });
        });
      });
    });
    context('and using for languages', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                languages [ab,bc, cd, zh-cn]
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        context('such as having numbers inside the list', () => {
          it('should report a syntax error', () => {
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
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                languages true
              }
            }`)
            ).to.throw(new RegExp('^An array of names is expected, but found: "true"'));
          });
        });
      });
    });
    context('and using for messageBroker', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                messageBroker ehcache
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                messageBroker ehcache42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                messageBroker "ehcache"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""ehcache""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                messageBroker 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for nativeLanguage', () => {
      context('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(`
            application {
              config {
                nativeLanguage foo
              }
            }`)
          ).not.to.throw();
        });
      });
      context('an invalid value', () => {
        context('such as a number', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  nativeLanguage 666
                }
              }`)
            ).to.throw(new RegExp('^A name is expected, but found: "666"'));
          });
        });
        context('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  nativeLanguage -
                }
              }`)
            ).to.throw(new RegExp('^unexpected character: ->-<-'));
          });
        });
        context('such as a capitalized letters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  nativeLanguage FOO
                }
              }`)
            ).to.throw(new RegExp('^The nativeLanguage property name must match: '));
          });
        });

        context('having illegal characters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  nativeLanguage foo.bar
                }
              }`)
            ).to.throw(new RegExp('^A single name is expected, but found a fully qualified name'));
          });
        });
      });
    });
    context('and using for packageName', () => {
      context('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(`
            application {
              config {
                packageName foo
              }
            }`)
          ).not.to.throw();
        });
      });
      context('an invalid value', () => {
        context('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  packageName -
                }
              }`)
            ).to.throw(new RegExp('^unexpected character: ->-<-'));
          });
        });
        context('such as a capitalized letters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  packageName FOO
                }
              }`)
            ).to.throw(new RegExp('^The packageName property name must match: '));
          });
        });
      });
    });
    context('and using for prodDatabaseType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                prodDatabaseType ehcache
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                prodDatabaseType ehcache42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                prodDatabaseType "ehcache"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""ehcache""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                prodDatabaseType 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for searchEngine', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                searchEngine ehcache
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                searchEngine ehcache42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                searchEngine "ehcache"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""ehcache""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                searchEngine 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for serverPort', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                serverPort 6666
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        context('such as letters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              application {
                config {
                  serverPort abc
                }
              }`)
            ).to.throw(new RegExp('^An integer literal is expected, but found: "abc"'));
          });
        });
      });
    });
    context('and using for serviceDiscoveryType', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                serviceDiscoveryType ehcache
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                serviceDiscoveryType "ehcache"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""ehcache""'));
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                serviceDiscoveryType eHcache42
              }
            }`)
            ).to.throw(new RegExp('^The serviceDiscoveryType property name must match: '));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                serviceDiscoveryType 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
    context('and using for skipClient', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipClient true
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipClient 666
              }
            }`)
          ).to.throw(new RegExp('^A boolean literal is expected, but found: "666"'));
        });
      });
    });
    context('and using for skipServer', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipServer true
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipServer 666
              }
            }`)
          ).to.throw(new RegExp('^A boolean literal is expected, but found: "666"'));
        });
      });
    });
    context('and using for skipUserManagement', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipUserManagement true
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                skipUserManagement 666
              }
            }`)
          ).to.throw(new RegExp('^A boolean literal is expected, but found: "666"'));
        });
      });
    });
    context('and using for testFrameworks', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                testFrameworks [a,b, c]
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        context('such as having numbers inside the list', () => {
          it('should report a syntax error', () => {
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
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                testFrameworks true
              }
            }`)
            ).to.throw(new RegExp('^An array of names is expected, but found: "true"'));
          });
        });
      });
    });
    context('and using for uaaBaseName', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                uaaBaseName "bamba"
              }
            }`)
          ).not.to.throw();
        });
      });
      context('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                uaaBaseName abc
              }
            }`)
          ).to.throw(new RegExp('^A string literal is expected, but found: "abc"'));
        });
      });
    });
    context('and using for useSass', () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                useSass true
              }
            }`)
          ).not.to.throw();
        });
      });

      context('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(`
            application {
              config {
                useSass 666
              }
            }`)
          ).to.throw(new RegExp('^A boolean literal is expected, but found: "666"'));
        });
      });
    });
    context('and using for websocket', () => {
      context('a valid value', () => {
        context('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                websocket ehcache-
              }
            }`)
            ).not.to.throw();
          });
        });
        context('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            application {
              config {
                websocket ehcache42
              }
            }`)
            ).not.to.throw();
          });
        });
      });
      context('an invalid value', () => {
        context('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                websocket "ehcache"
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: ""ehcache""'));
          });
        });
        context('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(`
            application {
              config {
                websocket 42
              }
            }`)
            ).to.throw(new RegExp('^A name is expected, but found: "42"'));
          });
        });
      });
    });
  });
  context('when declaring a deployment', () => {
    context('and using for deploymentType', () => {
      context('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(`
            deployment {
              deploymentType docker-compose
            }`)
          ).not.to.throw();
        });
      });
      context('an invalid value', () => {
        context('such as a number', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              deployment {
                deploymentType 666
              }`)
            ).to.throw(new RegExp('^A name is expected, but found: "666"'));
          });
        });
        context('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
            deployment {
              deploymentType -
            }`)
            ).to.throw(new RegExp('^unexpected character: ->-<-'));
          });
        });
        context('such as a capitalized letters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              deployment {
                deploymentType FOO
              }`)
            ).to.throw(new RegExp('^The deploymentType property name must match: '));
          });
        });

        context('having illegal characters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              deployment {
                deploymentType foo.bar
              }`)
            ).to.throw(new RegExp('^A single name is expected, but found a fully qualified name'));
          });
        });
      });
    });
    const ALPHABETIC_LOWER = ['gatewayType', 'monitoring', 'consoleOptions', 'serviceDiscoveryType', 'storageType'];
    ALPHABETIC_LOWER.forEach(type => {
      context(`and using for ${type}`, () => {
        context('a valid value', () => {
          it('should not report a syntax error for name', () => {
            expect(() =>
              parse(`
              deployment {
                ${type} valid
              }`)
            ).not.to.throw();
          });
        });
        context('an invalid value', () => {
          context('such as a number', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} 666
                }`)
              ).to.throw(new RegExp('^A name is expected, but found: "666"'));
            });
          });
          context('such as an invalid character', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
              deployment {
                ${type} -
              }`)
              ).to.throw(new RegExp('^unexpected character: ->-<-'));
            });
          });
          context('such as a capitalized letters', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} FOO
                }`)
              ).to.throw(new RegExp(`^The ${type} property name must match: `));
            });
          });

          context('having illegal characters', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} foo.bar
                }`)
              ).to.throw(new RegExp('^A single name is expected, but found a fully qualified name'));
            });
          });
        });
      });
    });
    context('and using for directoryPath', () => {
      context('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(`
            deployment {
              directoryPath "../"
            }`)
          ).not.to.throw();
        });
      });
      context('an invalid value', () => {
        context('such as a number', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              deployment {
                directoryPath 666
              }`)
            ).to.throw(new RegExp('^A string literal is expected, but found: "666"'));
          });
        });
        context('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
            deployment {
              directoryPath -
            }`)
            ).to.throw(new RegExp('^unexpected character: ->-<-'));
          });
        });
        context('such as a invalid pattern', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              deployment {
                directoryPath "/test"
              }`)
            ).to.throw(new RegExp('^The directoryPath property name must match: '));
          });
        });

        context('having illegal characters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              deployment {
                directoryPath foo.bar
              }`)
            ).to.throw(new RegExp('^A string literal is expected, but found: "foo"'));
          });
        });
      });
    });
    const ALPHANUMERIC_LIST = ['appsFolders', 'clusteredDbApps'];

    ALPHANUMERIC_LIST.forEach(type => {
      context(`and using for ${type}`, () => {
        context('a valid value', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            deployment {
              ${type} [test, test2,fooBar]
            }`)
            ).not.to.throw();
          });
        });

        context('an invalid value', () => {
          context('such as having special character inside the list', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} [fr, en, @123]
              }`)
              ).to.throw("MismatchedTokenException: Expecting token of type --> NAME <-- but found --> '@' <--");
            });
          });
          context('such as not a list', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} true
              }`)
              ).to.throw(new RegExp('^An array of names is expected, but found: "true"'));
            });
          });
        });
      });
    });
    const ALPHANUMERIC_NAME = ['kubernetesServiceType'];

    ALPHANUMERIC_NAME.forEach(type => {
      context(`and using for ${type}`, () => {
        context('a valid value', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            deployment {
              ${type} test23
            }`)
            ).not.to.throw();
          });
        });

        context('an invalid value', () => {
          context('such as having special character', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} test-123
              }`)
              ).to.throw(new RegExp(`^The ${type} property name must match: `));
            });
          });
          context('such as not a name', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} "true"
              }`)
              ).to.throw(new RegExp('^A name is expected, but found: ""true""'));
            });
          });
        });
      });
    });
    const ALPHANUMERIC_DASH_NAME = ['kubernetesNamespace', 'openshiftNamespace'];

    ALPHANUMERIC_DASH_NAME.forEach(type => {
      context(`and using for ${type}`, () => {
        context('a valid value', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            deployment {
              ${type} test-23
            }`)
            ).not.to.throw();
          });
        });

        context('an invalid value', () => {
          context('such as having special character', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} test_123
              }`)
              ).to.throw(new RegExp(`^The ${type} property name must match: `));
            });
          });
          context('such as not a name', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} "true"
              }`)
              ).to.throw(new RegExp('^A name is expected, but found: ""true""'));
            });
          });
        });
      });
    });

    const URL_TYPE = ['ingressDomain', 'dockerRepositoryName'];
    URL_TYPE.forEach(type => {
      context(`and using for ${type}`, () => {
        context('a valid value', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(`
            deployment {
              ${type} "gcr.io/test"
            }
            deployment {
              ${type} "gcr.io.192.120.0.0.io"
            }`)
            ).not.to.throw();
            expect(() =>
              parse(`
            deployment {
              ${type} "test105"
            }`)
            ).not.to.throw();
          });
        });

        context('an invalid value', () => {
          context('such as having invalid url', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} "test 123"
              }`)
              ).to.throw(
                `The ${type} property name must match: /^"((?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w.-]+)+[\\w\\-._~:\\/?#[\\]@!$&'()*+,;=]+|[a-zA-Z0-9]+)"$/`
              );
            });
          });
          context('such as not a name', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(`
                deployment {
                  ${type} true
              }`)
              ).to.throw(new RegExp('^A string literal is expected, but found: "true"'));
            });
          });
        });
      });
    });
    context('such as having special chars', () => {
      it('should report a syntax error', () => {
        expect(() =>
          parse(`
              deployment {
                dockerPushCommand "test@123"
            }`)
        ).to.throw(new RegExp('^The dockerPushCommand property name must match:'));
      });
    });
    context(`and using for dockerPushCommand`, () => {
      context('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(`
          deployment {
            dockerPushCommand "docker push"
          }`)
          ).not.to.throw();
        });
      });
      context('an invalid value', () => {
        context('such as not a name', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(`
              deployment {
                dockerPushCommand true
            }`)
            ).to.throw(new RegExp('^A string literal is expected, but found: "true"'));
          });
        });
      });
    });
  });
  context('when declaring an enum', () => {
    context('with specific values', () => {
      context('that contain whitespaces', () => {
        it('should not fail', () => {
          expect(() =>
            parse(`enum MyEnum {
  FRANCE ("stinky but good cheese country"),
  ENGLAND ("tea country")
}`)
          ).not.to.throw();
        });
      });
      context('that contain quotes', () => {
        it('should fail', () => {
          expect(() =>
            parse(`enum MyEnum {
  FRANCE ("stinky but g"ood cheese country")
}`)
          ).to.throw(/^unexpected character: ->"<-/);
        });
      });
    });
  });
});
