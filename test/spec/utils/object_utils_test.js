'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  merge = require('../../../lib/utils/object_utils').merge,
  values = require('../../../lib/utils/object_utils').values,
  areEntitiesEqual = require('../../../lib/utils/object_utils').areEntitiesEqual;

describe('ObjectUtils', function () {
  describe('::merge', function () {
    var object1 = {
      a: 1,
      b: 2
    };

    var object2 = {
      b: 3,
      c: 4
    };

    describe('when merging two object', function () {
      describe('with the first being nil or empty', function () {
        it('returns the second', function () {
          var merged1 = merge(null, {a: 1});
          var merged2 = merge({}, {a: 1});
          expect(merged1).to.deep.eq({a: 1});
          expect(merged2).to.deep.eq({a: 1});
        });
      });
      describe('with the second being nil or empty', function () {
        it('returns the first', function () {
          var merged1 = merge({a: 1}, null);
          var merged2 = merge({a: 1}, null);
          expect(merged1).to.deep.eq({a: 1});
          expect(merged2).to.deep.eq({a: 1});
        });
      });
      it('returns the merged object by merging the second into the first', function () {
        expect(
          merge(object1, object2)
        ).to.deep.equal({a: 1, b: 3, c: 4});

        expect(
          merge(object2, object1)
        ).to.deep.equal({a: 1, b: 2, c: 4});
      });

      it('does not modify any of the two objects', function () {
        merge(object1, object2);
        expect(
          object1
        ).to.deep.equal({a: 1, b: 2});
        expect(
          object2
        ).to.deep.equal({b: 3, c: 4});
      });
    });
  });
  describe('::values', function () {
    describe('when passing a nil object', function () {
      it('fails', function () {
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
    describe('when passing a valid object', function () {
      it("returns its keys' values", function () {
        expect(values({
          a: 42,
          b: 'A string',
          c: [1, 2, 3, 4, 5],
          d: {d1: '', d2: 'something'}
        })).to.deep.eq([42, 'A string', [1, 2, 3, 4, 5], {
          d1: '',
          d2: 'something'
        }]);
      });
    });
  });
  describe('::areEntitiesEqual', function () {
    describe('when comparing two equal objects', function () {
      describe('as they are empty', function () {
        it('returns true', function () {
          var firstEmptyObject = {
            fields: [],
            relationships: []
          };
          var secondEmptyObject = {
            fields: [],
            relationships: []
          };
          expect(areEntitiesEqual(firstEmptyObject, secondEmptyObject)).to.be.true;
        });
      });
      describe('they have no fields, but only relationships', function () {
        it('returns true', function () {
          var firstObject = {
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
          var secondObject = {
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
      describe('they have fields but no relationships', function () {
        it('returns true', function () {
          var firstObject = {
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
          var secondObject = {
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
      describe('they have both fields and relationships', function () {
        it('returns true', function () {
          var firstObject = {
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
          var secondObject = {
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
    describe('when comparing two unequal objects', function () {
      describe('as one of them is not empty, the other is', function () {
        it('returns false', function () {
          var firstObject = {
            fields: [],
            relationships: []
          };
          var secondObject = {
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
      describe('as both of them have different fields', function () {
        it('returns false', function () {
          var firstObject = {
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
          var secondObject = {
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
      describe('as both of them have different relationships', function () {
        it('returns false', function () {
          var firstObject = {
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
          var secondObject = {
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
      describe('as they do not possess the same number of fields', function () {
        it('returns false', function () {
          var firstObject = {
            fields: [],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          var secondObject = {
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
      describe('as they do not have the same number of keys in fields', function () {
        it('returns false', function () {
          var firstObject = {
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
          var secondObject = {
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
      describe('as they do not possess the same number of relationships', function () {
        it('returns false', function () {
          var firstObject = {
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
          var secondObject = {
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
        describe('as they do not have the same number of fields in a relationship', function () {
          it('returns false', function () {
            var firstObject = {
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
            var secondObject = {
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
      describe('as they do not have the options', function () {
        it('returns false', function () {
          var firstObject = {
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
          var secondObject = {
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
      describe('as they do not have the same table name', function () {
        it('returns false', function () {
          var firstObject = {
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
          var secondObject = {
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
      describe('as they do not have the same comments', function () {
        it('returns false', function () {
          var firstObject = {
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
          var secondObject = {
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
