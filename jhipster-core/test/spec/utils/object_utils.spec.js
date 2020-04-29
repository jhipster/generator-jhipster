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

/* eslint-disable no-new, no-unused-expressions */
const { expect } = require('chai');
const { areEntitiesEqual, merge } = require('../../../lib/utils/object_utils');

describe('ObjectUtils', () => {
  describe('merge', () => {
    context('when merging a nil object with a not-empty one', () => {
      let merged;

      before(() => {
        merged = merge(null, { a: 1 });
      });

      it('should return the second one', () => {
        expect(merged).to.deep.equal({ a: 1 });
      });
    });
    context('when merging a not-empty object with a nil one', () => {
      let merged;

      before(() => {
        merged = merge({}, { a: 1 });
      });

      it('should return the first one', () => {
        expect(merged).to.deep.equal({ a: 1 });
      });
    });
    context('when merging two not-empty objects', () => {
      let merged;

      before(() => {
        const object1 = {
          a: 1,
          b: 2
        };
        const object2 = {
          b: 3,
          c: 4
        };
        merged = merge(object1, object2);
      });

      it('should merge them', () => {
        expect(merged).to.deep.equal({ a: 1, b: 3, c: 4 });
      });
    });
  });
  describe('areEntitiesEqual', () => {
    context('when comparing two equal objects', () => {
      context('as they are empty', () => {
        let result;

        before(() => {
          const firstEmptyObject = {
            fields: [],
            relationships: []
          };
          const secondEmptyObject = {
            fields: [],
            relationships: []
          };
          result = areEntitiesEqual(firstEmptyObject, secondEmptyObject);
        });

        it('should return true', () => {
          expect(result).to.be.true;
        });
      });
      context('as they have no fields, but only relationships', () => {
        let result;

        before(() => {
          const firstObject = {
            fields: [],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          const secondObject = {
            fields: [],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return true', () => {
          expect(result).to.be.true;
        });
      });
      context('as they have fields but no relationships', () => {
        let result;

        before(() => {
          const firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42,
                arrayThing: [42]
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: []
          };
          const secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42,
                arrayThing: [42]
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: []
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return true', () => {
          expect(result).to.be.true;
        });
      });
      context('they have both fields and relationships', () => {
        let result;

        before(() => {
          const firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          const secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return true', () => {
          expect(result).to.be.true;
        });
      });
      context('when one attribute in the object is missing from the other', () => {
        let result;

        before(() => {
          const firstObject = {
            name: 'MyEntity',
            fields: [],
            relationships: [],
            javadoc: undefined
          };
          const secondObject = {
            name: 'MyEntity',
            fields: [],
            relationships: []
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return true', () => {
          expect(result).to.be.true;
        });
      });
    });
    context('when comparing two unequal objects', () => {
      context('as one of them is not empty', () => {
        let result;

        before(() => {
          const firstObject = {
            fields: [],
            relationships: []
          };
          const secondObject = {
            fields: [],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return false', () => {
          expect(result).to.be.false;
        });
      });
      context('as both of them have different fields', () => {
        let result;

        before(() => {
          const firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: []
          };
          const secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 44
              }
            ],
            relationships: []
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return false', () => {
          expect(result).to.be.false;
        });
      });
      context('as both of them have different relationships', () => {
        let result;

        before(() => {
          const firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 2,
                anotherField: 44
              }
            ]
          };
          const secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return false', () => {
          expect(result).to.be.false;
        });
      });
      context('as they do not possess the same number of fields', () => {
        let result;

        before(() => {
          const firstObject = {
            fields: [],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          const secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return false', () => {
          expect(result).to.be.false;
        });
      });
      context('as they do not have the same number of keys in fields', () => {
        let result;

        before(() => {
          const firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42,
                yetAnother: false
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          const secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return false', () => {
          expect(result).to.be.false;
        });
      });
      context('as they do not possess the same number of relationships', () => {
        let result;

        before(() => {
          const firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          const secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              },
              {
                id: 2,
                anotherField: 44
              }
            ]
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return false', () => {
          expect(result).to.be.false;
        });
        context('as they do not have the same number of fields in a relationship', () => {
          let result;

          before(() => {
            const firstObject = {
              fields: [
                {
                  id: 1,
                  theAnswer: 42
                },
                {
                  id: 2,
                  notTheAnswer: 43
                }
              ],
              relationships: [
                {
                  id: 1,
                  anotherField: 44
                }
              ]
            };
            const secondObject = {
              fields: [
                {
                  id: 1,
                  theAnswer: 42
                },
                {
                  id: 2,
                  notTheAnswer: 43
                }
              ],
              relationships: [
                {
                  id: 1,
                  anotherField: 44,
                  yetAnother: false
                }
              ]
            };
            result = areEntitiesEqual(firstObject, secondObject);
          });

          it('should return false', () => {
            expect(result).to.be.false;
          });
        });
      });
      context('as they do not have the options', () => {
        const firstObject = {
          fields: [{ id: 1, theAnswer: 42 }],
          relationships: [{ id: 1, anotherField: 44 }],
          dto: 'no',
          pagination: 'no',
          service: 'no',
          searchEngine: 'no',
          jpaMetamodelFiltering: 'no'
        };
        const secondObject = {
          fields: [{ id: 1, theAnswer: 42 }],
          relationships: [{ id: 1, anotherField: 44 }],
          dto: 'no',
          pagination: 'no',
          service: 'no',
          searchEngine: 'no',
          jpaMetamodelFiltering: 'no'
        };

        context('when not having the same DTO option value', () => {
          before(() => {
            secondObject.dto = 'mapstruct';
          });
          after(() => {
            secondObject.dto = 'no';
          });

          it('should return false', () => {
            expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
          });
        });
        context('when not having the same pagination option value', () => {
          before(() => {
            secondObject.pagination = 'pagination';
          });
          after(() => {
            secondObject.pagination = 'no';
          });

          it('should return false', () => {
            expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
          });
        });
        context('when not having the same service option value', () => {
          before(() => {
            secondObject.service = 'serviceImpl';
          });
          after(() => {
            secondObject.service = 'no';
          });

          it('should return false', () => {
            expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
          });
        });
        context('when not having the same search engine', () => {
          before(() => {
            secondObject.searchEngine = 'elasticsearch';
          });
          after(() => {
            secondObject.searchEngine = 'no';
          });

          it('should return false', () => {
            expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
          });
        });
        context('when not having the same jpaMetamodelFiltering option value', () => {
          context("when one entity has 'no' and the other has 'false'", () => {
            before(() => {
              secondObject.jpaMetamodelFiltering = false;
            });
            after(() => {
              secondObject.jpaMetamodelFiltering = 'no';
            });

            it('should return true', () => {
              expect(areEntitiesEqual(firstObject, secondObject)).to.be.true;
            });
          });
          context('when they have opposite values', () => {
            before(() => {
              secondObject.jpaMetamodelFiltering = true;
            });
            after(() => {
              secondObject.jpaMetamodelFiltering = false;
            });

            it('should return false', () => {
              expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
            });
          });
        });
      });
      context('as they do not have the same table name', () => {
        let result;

        before(() => {
          const firstObject = {
            entityTableName: 'first',
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              },
              {
                id: 2,
                anotherField: 44
              }
            ],
            dto: 'mapstruct',
            pagination: 'pagination',
            service: 'no'
          };
          const secondObject = {
            entityTableName: 'second',
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              },
              {
                id: 2,
                anotherField: 44
              }
            ],
            dto: 'mapstruct',
            pagination: 'no',
            service: 'no'
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return false', () => {
          expect(result).to.be.false;
        });
      });
      context('as they do not have the same comments', () => {
        let result;

        before(() => {
          const firstObject = {
            javadoc: 'My first comment',
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              },
              {
                id: 2,
                anotherField: 44
              }
            ],
            dto: 'mapstruct',
            pagination: 'pagination',
            service: 'no'
          };
          const secondObject = {
            javadoc: 'My Second Comment',
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              },
              {
                id: 2,
                anotherField: 44
              }
            ],
            dto: 'mapstruct',
            pagination: 'no',
            service: 'no'
          };
          result = areEntitiesEqual(firstObject, secondObject);
        });

        it('should return false', () => {
          expect(result).to.be.false;
        });
      });
      context('as they do not have the same number of attributes', () => {
        let firstObject;
        let secondObject;

        before(() => {
          firstObject = {
            javadoc: 'My first comment',
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              },
              {
                id: 2,
                anotherField: 44
              }
            ],
            dto: 'mapstruct',
            pagination: 'pagination',
            service: 'no'
          };
          secondObject = {
            javadoc: 'My first comment',
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              },
              {
                id: 2,
                anotherField: 44
              }
            ],
            dto: 'mapstruct',
            pagination: 'no',
            service: 'no',
            custom: true
          };
        });

        it('should return false', () => {
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
    });
  });
});
