'use strict';

const expect = require('chai').expect,
    merge = require('../../../lib/utils/object_utils').merge;

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
});
