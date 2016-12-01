'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    formatComment = require('../../../lib/utils/format_utils').formatComment;

describe('FormatUtils', function() {
  describe('::formatComment', function() {
    describe('when the comment is in the one-line form', function() {
      var oneLineComment1 = ' comment ';
      var oneLineComment2 = 'comment';
      var oneLineComment3 = ' * a one line comment. ';
      var oneLineComment4 = ' multi word\tcomment ';
      var oneLineComment5 = 'multi word\tcomment';
      var expectedResult1 = 'comment';
      var expectedResult2 = 'a one line comment.';
      var expectedResult3 = 'multi word\tcomment';

      describe(buildTestTitle(oneLineComment1), function() {
        it('returns ' + buildTestTitle(expectedResult1), function() {
          expect(formatComment(oneLineComment1)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(oneLineComment2), function() {
        it('returns ' + buildTestTitle(expectedResult1), function() {
          expect(formatComment(oneLineComment2)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(oneLineComment3), function() {
        it('returns ' + buildTestTitle(expectedResult2), function() {
          expect(formatComment(oneLineComment3)).to.eq(expectedResult2);
        });
      });
      describe(buildTestTitle(oneLineComment4), function() {
        it('returns ' + buildTestTitle(expectedResult3), function() {
          expect(formatComment(oneLineComment4)).to.eq(expectedResult3);
        });
      });
      describe(buildTestTitle(oneLineComment5), function() {
        it('returns ' + buildTestTitle(expectedResult3), function() {
          expect(formatComment(oneLineComment5)).to.eq(expectedResult3);
        });
      });
    });

    describe('when the comment is in the multi-line form', function() {
      var multiLineComment1 = '\n* <p>first line of comment</p><br/>\n*<p>second line</p>\n';
      var multiLineComment2 = '*** <p>first line of comment</p><br/>\n* *<p>second line</p>\n\n';
      var multiLineComment3 = '\n * abcde\n * fghij\n * nothing\n';
      var expectedResult1 = '<p>first line of comment</p><br/>\n<p>second line</p>';
      var expectedResult2 = '<p>first line of comment</p><br/>\n*<p>second line</p>';
      var expectedResult3 = 'abcde\nfghij\nnothing';

      describe(buildTestTitle(multiLineComment1), function() {
        it('returns ' + buildTestTitle(expectedResult1), function() {
          expect(formatComment(multiLineComment1)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(multiLineComment2), function() {
        it('returns ' + buildTestTitle(expectedResult2), function() {
          expect(formatComment(multiLineComment2)).to.eq(expectedResult2);
        });
      });
      describe(buildTestTitle(multiLineComment3), function() {
        it('returns ' + buildTestTitle(expectedResult3), function() {
          expect(formatComment(multiLineComment3)).to.eq(expectedResult3);
        });
      });
    });
  });
});

function buildTestTitle(comment) {
  return  `'${comment}'`;
}
