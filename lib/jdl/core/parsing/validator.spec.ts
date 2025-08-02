/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { describe, it } from 'esmocha';
import { expect } from 'chai';
import { createRuntime } from '../../core/runtime.ts';
import { parse } from './api.ts';

describe('jdl - JDLSyntaxValidatorVisitor', () => {
  const jdlRuntime = createRuntime();
  describe('when declaring an application', () => {
    for (const booleanOption of ['microfrontend']) {
      describe(`and using for ${booleanOption}`, () => {
        describe('a valid value', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  ${booleanOption} true
                }
              }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('an invalid value', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  ${booleanOption} 666
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A boolean literal is expected, but found: "666"/);
          });
        });
      });
    }
    for (const integerOption of ['gatewayServerPort']) {
      describe(`and using for ${integerOption}`, () => {
        describe('a valid value', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                ${integerOption} 6666
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });

        describe('an invalid value', () => {
          describe('such as letters', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
              application {
                config {
                  ${integerOption} abc
                }
              }`,
                  jdlRuntime,
                ),
              ).to.throw(/^An integer literal is expected, but found: "abc"/);
            });
          });
        });
      });
    }

    describe('and using for applicationType', () => {
      describe('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                applicationType foo
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
      describe('an invalid value', () => {
        describe('such as a number', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  applicationType 666
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "666"/);
          });
        });
        describe('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  applicationType -
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^unexpected character: ->-<-/);
          });
        });
        describe('such as a capitalized letters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  applicationType FOO
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^The applicationType property name must match: /);
          });
        });

        describe('having illegal characters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  applicationType foo.bar
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A single name is expected, but found a fully qualified name/);
          });
        });
      });
    });
    describe('and using for authenticationType', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                authenticationType jwt
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                authenticationType jwt42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                authenticationType "jwt"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""jwt""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                authenticationType 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for baseName', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                baseName mySuperApp
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                baseName mySuperApp42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                baseName "mySuperApp"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""mySuperApp""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                baseName 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for blueprints', () => {
      describe('an empty blueprint name', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [, generator-jhipster-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name with uppercase letters', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [Generator-JHipster-Super-Blueprint]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name starting with .', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [.generator-jhipster-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name starting with _', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [_generator-jhipster-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name with a whitespace inside', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [generator -jhipster-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name containing ~', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [generator-jh~ipster-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name containing ~', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [generator-jh~ipster-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name containing \\', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [generator-jh\\ipster-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe("a blueprint name containing '", () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [generator-'jhipster-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name containing !', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [generator-jhipster!-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name containing (', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [generator-(jhipster-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name containing )', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [generator-jhipster)-vuejs]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
      describe('a blueprint name containing *', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `application {
  config {
    blueprints [generator-jhipster-vue*js]
  }
}`,
              jdlRuntime,
            ),
          ).to.throw();
        });
      });
    });
    describe('and using for buildTool', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                buildTool maven
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                buildTool maven42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                buildTool "maven"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""maven""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                buildTool 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for cacheProvider', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                cacheProvider ehcache
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                cacheProvider ehcache42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                cacheProvider "ehcache"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""ehcache""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                cacheProvider 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for clientFramework', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                clientFramework angular
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                clientFramework angular42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                clientFramework "react"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""react""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                clientFramework 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for withAdminUi', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                withAdminUi true
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                withAdminUi 666
              }
            }`,
              jdlRuntime,
            ),
          ).to.throw(/^A boolean literal is expected, but found: "666"/);
        });
      });
    });
    describe('and using for clientPackageManager', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                clientPackageManager npm
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                clientPackageManager npm42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                clientPackageManager "npm"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""npm""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                clientPackageManager 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for databaseType', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                databaseType sql
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                databaseType sql42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                databaseType "sql"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""sql""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                databaseType 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for devDatabaseType', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                devDatabaseType postgresql
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                devDatabaseType postgresql42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                devDatabaseType "postgresql"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""postgresql""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                devDatabaseType 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for enableHibernateCache', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                enableHibernateCache true
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                enableHibernateCache 666
              }
            }`,
              jdlRuntime,
            ),
          ).to.throw(/^A boolean literal is expected, but found: "666"/);
        });
      });
    });
    describe('and using for enableSwaggerCodegen', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                enableSwaggerCodegen true
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                enableSwaggerCodegen 666
              }
            }`,
              jdlRuntime,
            ),
          ).to.throw(/^A boolean literal is expected, but found: "666"/);
        });
      });
    });
    describe('and using for enableTranslation', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                enableTranslation true
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                enableTranslation 666
              }
            }`,
              jdlRuntime,
            ),
          ).to.throw(/^A boolean literal is expected, but found: "666"/);
        });
      });
    });
    describe('and using for frontendBuilder', () => {
      describe('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                frontendBuilder fooBar
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
      describe('an invalid value', () => {
        describe('such as a number', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  frontendBuilder 666
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "666"/);
          });
        });
        describe('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  frontendBuilder -
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^unexpected character: ->-<-/);
          });
        });

        describe('having illegal characters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  frontendBuilder foo.bar
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A single name is expected, but found a fully qualified name/);
          });
        });
      });
    });
    describe('and using for jhipsterVersion', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                jhipsterVersion "5.0.0"
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                jhipsterVersion abc
              }
            }`,
              jdlRuntime,
            ),
          ).to.throw(/^A string literal is expected, but found: "abc"\n\tat line: 4, column: 33/);
        });
      });
    });
    describe('and using for jhiPrefix', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                jhiPrefix abcD42-_f
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
      describe('an invalid value', () => {
        describe('when the prefix begins by a digit', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                jhiPrefix 42abc
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw("MismatchedTokenException: Found an invalid token 'abc', at line: 4 and column: 29.");
          });
        });
        describe('when the prefix begins by a dash', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                jhiPrefix -abc
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^unexpected character: ->-<-/);
          });
        });
      });
    });
    describe('and using for languages', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                languages [ab,bc, cd, zh-cn]
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        describe('such as having numbers inside the list', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                languages [fr, en, 42]
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^MismatchedTokenException: Found an invalid token '42', at line: \d+ and column: \d+\./);
          });
        });
        describe('such as not a list', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                languages true
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^An array of names is expected, but found: "true"/);
          });
        });
      });
    });
    describe('and using for microfrontends', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                microfrontends [mf_1,mf, mf123, mf]
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        describe('such as having numbers inside the list', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                microfrontends [mf_1, en, mf-1]
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^The microfrontends property name must match: (.*), got mf-1.\n(.*)at line: (\d*), column: (\d*)/);
          });
        });
        describe('such as not a list', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                microfrontends true
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^An array of names is expected, but found: "true"/);
          });
        });
      });
    });
    describe('and using for nativeLanguage', () => {
      describe('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                nativeLanguage foo
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
      describe('an invalid value', () => {
        describe('such as a number', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  nativeLanguage 666
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "666"/);
          });
        });
        describe('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  nativeLanguage -
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^unexpected character: ->-<-/);
          });
        });
        describe('such as a capitalized letters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  nativeLanguage FOO
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^The nativeLanguage property name must match: /);
          });
        });

        describe('having illegal characters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  nativeLanguage foo.bar
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A single name is expected, but found a fully qualified name/);
          });
        });
      });
    });
    describe('and using for packageName', () => {
      describe('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                packageName foo
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
      describe('an invalid value', () => {
        describe('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  packageName -
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^unexpected character: ->-<-/);
          });
        });
        describe('such as a capitalized letters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  packageName FOO
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^The packageName property name must match: /);
          });
        });
      });
    });
    describe('and using for prodDatabaseType', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                prodDatabaseType ehcache
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                prodDatabaseType ehcache42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                prodDatabaseType "ehcache"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""ehcache""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                prodDatabaseType 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for rememberMeKey', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                rememberMeKey "1want4b33randap1zz4"
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
    });
    describe('and using for searchEngine', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                searchEngine ehcache
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                searchEngine ehcache42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                searchEngine "ehcache"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""ehcache""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                searchEngine 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for serverPort', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                serverPort 6666
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        describe('such as letters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              application {
                config {
                  serverPort abc
                }
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^An integer literal is expected, but found: "abc"/);
          });
        });
      });
    });
    describe('and using for serviceDiscoveryType', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                serviceDiscoveryType ehcache
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                serviceDiscoveryType "ehcache"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""ehcache""/);
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                serviceDiscoveryType eHcache42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^The serviceDiscoveryType property name must match: /);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                serviceDiscoveryType 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
    describe('and using for skipClient', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                skipClient true
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                skipClient 666
              }
            }`,
              jdlRuntime,
            ),
          ).to.throw(/^A boolean literal is expected, but found: "666"/);
        });
      });
    });
    describe('and using for skipServer', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                skipServer true
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                skipServer 666
              }
            }`,
              jdlRuntime,
            ),
          ).to.throw(/^A boolean literal is expected, but found: "666"/);
        });
      });
    });
    describe('and using for skipUserManagement', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                skipUserManagement true
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        it('should report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                skipUserManagement 666
              }
            }`,
              jdlRuntime,
            ),
          ).to.throw(/^A boolean literal is expected, but found: "666"/);
        });
      });
    });
    describe('and using for testFrameworks', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
            application {
              config {
                testFrameworks [a,b, c]
              }
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });

      describe('an invalid value', () => {
        describe('such as having numbers inside the list', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                testFrameworks [fr, en, 42]
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^MismatchedTokenException: Found an invalid token '42', at line: \d+ and column: \d+\./);
          });
        });
        describe('such as not a list', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                testFrameworks true
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^An array of names is expected, but found: "true"/);
          });
        });
      });
    });
    describe('and using for websocket', () => {
      describe('a valid value', () => {
        describe('with only letters', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                websocket ehcache-
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('with both letters and numbers', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                websocket ehcache42
              }
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
      });
      describe('an invalid value', () => {
        describe('such as quotes', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                websocket "ehcache"
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: ""ehcache""/);
          });
        });
        describe('such as numbers', () => {
          it('should fail', () => {
            expect(() =>
              parse(
                `
            application {
              config {
                websocket 42
              }
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "42"/);
          });
        });
      });
    });
  });
  describe('when declaring a deployment', () => {
    describe('and using for deploymentType', () => {
      describe('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(
              `
            deployment {
              deploymentType docker-compose
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
      describe('an invalid value', () => {
        describe('such as a number', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              deployment {
                deploymentType 666
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A name is expected, but found: "666"/);
          });
        });
        describe('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
            deployment {
              deploymentType -
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^unexpected character: ->-<-/);
          });
        });
        describe('such as a capitalized letters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              deployment {
                deploymentType FOO
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^The deploymentType property name must match: /);
          });
        });

        describe('having illegal characters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              deployment {
                deploymentType foo.bar
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A single name is expected, but found a fully qualified name/);
          });
        });
      });
    });
    const ALPHABETIC_LOWER = ['monitoring', 'serviceDiscoveryType', 'storageType'];
    ALPHABETIC_LOWER.forEach(type => {
      describe(`and using for ${type}`, () => {
        describe('a valid value', () => {
          it('should not report a syntax error for name', () => {
            expect(() =>
              parse(
                `
              deployment {
                ${type} valid
              }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });
        describe('an invalid value', () => {
          describe('such as a number', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} 666
                }`,
                  jdlRuntime,
                ),
              ).to.throw(/^A name is expected, but found: "666"/);
            });
          });
          describe('such as an invalid character', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
              deployment {
                ${type} -
              }`,
                  jdlRuntime,
                ),
              ).to.throw(/^unexpected character: ->-<-/);
            });
          });
          describe('such as a capitalized letters', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} FOO
                }`,
                  jdlRuntime,
                ),
              ).to.throw(new RegExp(`^The ${type} property name must match: `));
            });
          });

          describe('having illegal characters', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} foo.bar
                }`,
                  jdlRuntime,
                ),
              ).to.throw(/^A single name is expected, but found a fully qualified name/);
            });
          });
        });
      });
    });
    describe('and using for directoryPath', () => {
      describe('a valid value', () => {
        it('should not report a syntax error for name', () => {
          expect(() =>
            parse(
              `
            deployment {
              directoryPath "../"
            }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
      describe('an invalid value', () => {
        describe('such as a number', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              deployment {
                directoryPath 666
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A string literal is expected, but found: "666"/);
          });
        });
        describe('such as an invalid character', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
            deployment {
              directoryPath -
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^unexpected character: ->-<-/);
          });
        });
        describe('such as a invalid pattern', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              deployment {
                directoryPath "/test"
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^The directoryPath property name must match: /);
          });
        });

        describe('having illegal characters', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              deployment {
                directoryPath foo.bar
              }`,
                jdlRuntime,
              ),
            ).to.throw(/^A string literal is expected, but found: "foo"/);
          });
        });
      });
    });
    const ALPHANUMERIC_LIST = ['appsFolders', 'clusteredDbApps'];

    ALPHANUMERIC_LIST.forEach(type => {
      describe(`and using for ${type}`, () => {
        describe('a valid value', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            deployment {
              ${type} [test, test2,fooBar]
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });

        describe('an invalid value', () => {
          describe('such as having special character inside the list', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} [fr, en, @123]
              }`,
                  jdlRuntime,
                ),
              ).to.throw(/^MismatchedTokenException: Found an invalid token '@', at line: \d+ and column: \d+\./);
            });
          });
          describe('such as not a list', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} true
              }`,
                  jdlRuntime,
                ),
              ).to.throw(/^An array of names is expected, but found: "true"/);
            });
          });
        });
      });
    });
    const ALPHANUMERIC_NAME = ['gatewayType', 'kubernetesServiceType'];

    ALPHANUMERIC_NAME.forEach(type => {
      describe(`and using for ${type}`, () => {
        describe('a valid value', () => {
          describe('a valid value for gatewayType', () => {
            it('should not report a syntax error', () => {
              expect(() =>
                parse(
                  `
              deployment {
                ${type} SpringCloudGateway
              }`,
                  jdlRuntime,
                ),
              ).not.to.throw();
            });
          });
          describe('a valid value for kubernetesServiceType', () => {
            it('should not report a syntax error', () => {
              expect(() =>
                parse(
                  `
              deployment {
                ${type} NodePort
              }`,
                  jdlRuntime,
                ),
              ).not.to.throw();
            });
          });
        });
        describe('an invalid value', () => {
          describe('an invalid value', () => {
            it('should not report a syntax error', () => {
              expect(() =>
                parse(
                  `
              deployment {
                ${type} test23
              }`,
                  jdlRuntime,
                ),
              ).to.throw(new RegExp(`^The ${type} property name must match: `));
            });
          });
          describe('such as having special character', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} test-123
              }`,
                  jdlRuntime,
                ),
              ).to.throw(new RegExp(`^The ${type} property name must match: `));
            });
          });
          describe('such as not a name', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} "true"
              }`,
                  jdlRuntime,
                ),
              ).to.throw(/^A name is expected, but found: ""true""/);
            });
          });
        });
      });
    });
    const ALPHANUMERIC_DASH_NAME = ['kubernetesNamespace'];

    ALPHANUMERIC_DASH_NAME.forEach(type => {
      describe(`and using for ${type}`, () => {
        describe('a valid value', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            deployment {
              ${type} test-23
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });

        describe('an invalid value', () => {
          describe('such as having special character', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} test_123
              }`,
                  jdlRuntime,
                ),
              ).to.throw(new RegExp(`^The ${type} property name must match: `));
            });
          });
          describe('such as not a name', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} "true"
              }`,
                  jdlRuntime,
                ),
              ).to.throw(/^A name is expected, but found: ""true""/);
            });
          });
        });
      });
    });

    const URL_TYPE = ['ingressDomain', 'dockerRepositoryName'];
    URL_TYPE.forEach(type => {
      describe(`and using for ${type}`, () => {
        describe('a valid value', () => {
          it('should not report a syntax error', () => {
            expect(() =>
              parse(
                `
            deployment {
              ${type} "gcr.io/test"
            }
            deployment {
              ${type} "gcr.io.192.120.0.0.io"
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
            expect(() =>
              parse(
                `
            deployment {
              ${type} "test105"
            }`,
                jdlRuntime,
              ),
            ).not.to.throw();
          });
        });

        describe('an invalid value', () => {
          describe('such as having invalid url', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} "test 123"
              }`,
                  jdlRuntime,
                ),
              ).to.throw(
                `The ${type} property name must match: /^"((?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w.-]+)+[\\w\\-._~:\\/?#[\\]@!$&'()*+,;=]+|[a-zA-Z0-9]+)"$/`,
              );
            });
          });
          describe('such as not a name', () => {
            it('should report a syntax error', () => {
              expect(() =>
                parse(
                  `
                deployment {
                  ${type} true
              }`,
                  jdlRuntime,
                ),
              ).to.throw(/^A string literal is expected, but found: "true"/);
            });
          });
        });
      });
    });
    describe('such as having special chars', () => {
      it('should report a syntax error', () => {
        expect(() =>
          parse(
            `
              deployment {
                dockerPushCommand "test@123"
            }`,
            jdlRuntime,
          ),
        ).to.throw(/^The dockerPushCommand property name must match:/);
      });
    });
    describe('and using for dockerPushCommand', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
          deployment {
            dockerPushCommand "docker push"
          }`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
      describe('an invalid value', () => {
        describe('such as not a name', () => {
          it('should report a syntax error', () => {
            expect(() =>
              parse(
                `
              deployment {
                dockerPushCommand true
            }`,
                jdlRuntime,
              ),
            ).to.throw(/^A string literal is expected, but found: "true"/);
          });
        });
      });
    });
    describe('and using for ingressType', () => {
      describe('a valid value', () => {
        it('should not report a syntax error', () => {
          expect(() =>
            parse(
              `
          deployment {
ingressType nginx
}`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
    });
  });
  describe('when declaring an enum', () => {
    describe('with specific values', () => {
      describe('that contain whitespaces', () => {
        it('should not fail', () => {
          expect(() =>
            parse(
              `enum MyEnum {
  FRANCE ("stinky but good cheese country"),
  ENGLAND ("tea country")
}`,
              jdlRuntime,
            ),
          ).not.to.throw();
        });
      });
      describe('that contain quotes', () => {
        it('should fail', () => {
          expect(() =>
            parse(
              `enum MyEnum {
  FRANCE ("stinky but g"ood cheese country")
}`,
              jdlRuntime,
            ),
          ).to.throw(/^unexpected character: ->"<-/);
        });
      });
    });
  });
});
