/**
 * Copyright 2013-2019 the original author or authors from the JHipster project.
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
const ObjectUtils = require('../../../lib/utils/object_utils');

describe('ObjectUtils', () => {
  describe('::merge', () => {
    const object1 = {
      a: 1,
      b: 2
    };

    const object2 = {
      b: 3,
      c: 4
    };

    context('when merging two object', () => {
      context('with the first being nil or empty', () => {
        it('returns the second', () => {
          const merged1 = ObjectUtils.merge(null, { a: 1 });
          const merged2 = ObjectUtils.merge({}, { a: 1 });
          expect(merged1).to.deep.eq({ a: 1 });
          expect(merged2).to.deep.eq({ a: 1 });
        });
      });
      context('with the second being nil or empty', () => {
        it('returns the first', () => {
          const merged1 = ObjectUtils.merge({ a: 1 }, null);
          const merged2 = ObjectUtils.merge({ a: 1 }, null);
          expect(merged1).to.deep.eq({ a: 1 });
          expect(merged2).to.deep.eq({ a: 1 });
        });
      });
      it('returns the merged object by merging the second into the first', () => {
        expect(ObjectUtils.merge(object1, object2)).to.deep.equal({ a: 1, b: 3, c: 4 });

        expect(ObjectUtils.merge(object2, object1)).to.deep.equal({ a: 1, b: 2, c: 4 });
      });

      it('does not modify any of the two objects', () => {
        ObjectUtils.merge(object1, object2);
        expect(object1).to.deep.equal({ a: 1, b: 2 });
        expect(object2).to.deep.equal({ b: 3, c: 4 });
      });
    });
  });
  describe('::areEntitiesEqual', () => {
    context('when comparing two equal objects', () => {
      context('as they are empty', () => {
        it('returns true', () => {
          const firstEmptyObject = {
            fields: [],
            relationships: []
          };
          const secondEmptyObject = {
            fields: [],
            relationships: []
          };
          expect(ObjectUtils.areEntitiesEqual(firstEmptyObject, secondEmptyObject)).to.be.true;
        });
      });
      context('they have no fields, but only relationships', () => {
        it('returns true', () => {
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.true;
        });
      });
      context('they have fields but no relationships', () => {
        it('returns true', () => {
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.true;
        });
      });
      context('they have both fields and relationships', () => {
        it('returns true', () => {
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.true;
        });
      });
      context('one object has key with undefined value, second object does not have this key', () => {
        it('returns true', () => {
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.true;
        });
      });
    });
    context('when comparing two unequal objects', () => {
      context('as one of them is not empty, the other is', () => {
        it('returns false', () => {
          let firstObject = {
            fields: [],
            relationships: []
          };
          let secondObject = {
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
          firstObject = {
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
          secondObject = {
            fields: [],
            relationships: []
          };
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      context('as both of them have different fields', () => {
        it('returns false', () => {
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      context('as both of them have different relationships', () => {
        it('returns false', () => {
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      context('as they do not possess the same number of fields', () => {
        it('returns false', () => {
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      context('as they do not have the same number of keys in fields', () => {
        it('returns false', () => {
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      context('as they do not possess the same number of relationships', () => {
        it('returns false', () => {
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
        context('as they do not have the same number of fields in a relationship', () => {
          it('returns false', () => {
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
            expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
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

          it('returns false', () => {
            expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
          });
        });
        context('when not having the same pagination option value', () => {
          before(() => {
            secondObject.pagination = 'pager';
          });
          after(() => {
            secondObject.pagination = 'no';
          });

          it('returns false', () => {
            expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
          });
        });
        context('when not having the same service option value', () => {
          before(() => {
            secondObject.service = 'serviceImpl';
          });
          after(() => {
            secondObject.service = 'no';
          });

          it('returns false', () => {
            expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
          });
        });
        context('when not having the same search engine', () => {
          before(() => {
            secondObject.searchEngine = 'elasticsearch';
          });
          after(() => {
            secondObject.searchEngine = 'no';
          });

          it('returns false', () => {
            expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
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

            it('returns true', () => {
              expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.true;
            });
          });
          context('when they have opposite values', () => {
            before(() => {
              secondObject.jpaMetamodelFiltering = true;
            });
            after(() => {
              secondObject.jpaMetamodelFiltering = false;
            });

            it('returns false', () => {
              expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
            });
          });
        });
      });
      context('as they do not have the same table name', () => {
        it('returns false', () => {
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
            pagination: 'pager',
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      context('as they do not have the same comments', () => {
        it('returns false', () => {
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
            pagination: 'pager',
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
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
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
            pagination: 'pager',
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

        it('returns false', () => {
          expect(ObjectUtils.areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
    });
  });
});
