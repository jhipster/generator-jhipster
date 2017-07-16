

/* eslint-disable no-new, no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const merge = require('../../../lib/utils/object_utils').merge;
const values = require('../../../lib/utils/object_utils').values;
const areEntitiesEqual = require('../../../lib/utils/object_utils').areEntitiesEqual;

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

    describe('when merging two object', () => {
      describe('with the first being nil or empty', () => {
        it('returns the second', () => {
          const merged1 = merge(null, { a: 1 });
          const merged2 = merge({}, { a: 1 });
          expect(merged1).to.deep.eq({ a: 1 });
          expect(merged2).to.deep.eq({ a: 1 });
        });
      });
      describe('with the second being nil or empty', () => {
        it('returns the first', () => {
          const merged1 = merge({ a: 1 }, null);
          const merged2 = merge({ a: 1 }, null);
          expect(merged1).to.deep.eq({ a: 1 });
          expect(merged2).to.deep.eq({ a: 1 });
        });
      });
      it('returns the merged object by merging the second into the first', () => {
        expect(
          merge(object1, object2)
        ).to.deep.equal({ a: 1, b: 3, c: 4 });

        expect(
          merge(object2, object1)
        ).to.deep.equal({ a: 1, b: 2, c: 4 });
      });

      it('does not modify any of the two objects', () => {
        merge(object1, object2);
        expect(
          object1
        ).to.deep.equal({ a: 1, b: 2 });
        expect(
          object2
        ).to.deep.equal({ b: 3, c: 4 });
      });
    });
  });
  describe('::values', () => {
    describe('when passing a nil object', () => {
      it('fails', () => {
        try {
          values(null);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
        try {
          values(undefined);
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a valid object', () => {
      it('returns its keys\' values', () => {
        expect(values({
          a: 42,
          b: 'A string',
          c: [1, 2, 3, 4, 5],
          d: { d1: '', d2: 'something' }
        })).to.deep.eq([42, 'A string', [1, 2, 3, 4, 5], {
          d1: '',
          d2: 'something'
        }]);
      });
    });
  });
  describe('::areEntitiesEqual', () => {
    describe('when comparing two equal objects', () => {
      describe('as they are empty', () => {
        it('returns true', () => {
          const firstEmptyObject = {
            fields: [],
            relationships: []
          };
          const secondEmptyObject = {
            fields: [],
            relationships: []
          };
          expect(areEntitiesEqual(firstEmptyObject, secondEmptyObject)).to.be.true;
        });
      });
      describe('they have no fields, but only relationships', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.true;
        });
      });
      describe('they have fields but no relationships', () => {
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
                notTheAnswer: 43
              }
            ],
            relationships: []
          };
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.true;
        });
      });
      describe('they have both fields and relationships', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.true;
        });
      });
    });
    describe('when comparing two unequal objects', () => {
      describe('as one of them is not empty, the other is', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as both of them have different fields', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as both of them have different relationships', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as they do not possess the same number of fields', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as they do not have the same number of keys in fields', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as they do not possess the same number of relationships', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
        describe('as they do not have the same number of fields in a relationship', () => {
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
            expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
          });
        });
      });
      describe('as they do not have the options', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as they do not have the same table name', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as they do not have the same comments', () => {
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
          expect(areEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
    });
  });
});
