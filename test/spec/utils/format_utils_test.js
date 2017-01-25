'use strict';

const expect = require('chai').expect,
  FormatUtils = require('../../../lib/utils/format_utils'),
  formatComment = FormatUtils.formatComment,
  dateFormatForLiquibase = FormatUtils.dateFormatForLiquibase;

describe('FormatUtils', function () {
  describe('::formatComment', function () {
    describe('when the comment is in the one-line form', function () {
      var oneLineComment1 = ' comment ';
      var oneLineComment2 = 'comment';
      var oneLineComment3 = ' * a one line comment. ';
      var oneLineComment4 = ' multi word\tcomment ';
      var oneLineComment5 = 'multi word\tcomment';
      var expectedResult1 = 'comment';
      var expectedResult2 = 'a one line comment.';
      var expectedResult3 = 'multi word\tcomment';

      describe(buildTestTitle(oneLineComment1), function () {
        it('returns ' + buildTestTitle(expectedResult1), function () {
          expect(formatComment(oneLineComment1)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(oneLineComment2), function () {
        it('returns ' + buildTestTitle(expectedResult1), function () {
          expect(formatComment(oneLineComment2)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(oneLineComment3), function () {
        it('returns ' + buildTestTitle(expectedResult2), function () {
          expect(formatComment(oneLineComment3)).to.eq(expectedResult2);
        });
      });
      describe(buildTestTitle(oneLineComment4), function () {
        it('returns ' + buildTestTitle(expectedResult3), function () {
          expect(formatComment(oneLineComment4)).to.eq(expectedResult3);
        });
      });
      describe(buildTestTitle(oneLineComment5), function () {
        it('returns ' + buildTestTitle(expectedResult3), function () {
          expect(formatComment(oneLineComment5)).to.eq(expectedResult3);
        });
      });
    });

    describe('when the comment is in the multi-line form', function () {
      var multiLineComment1 = '\n* <p>first line of comment</p><br/>\n*<p>second line</p>\n';
      var multiLineComment2 = '*** <p>first line of comment</p><br/>\n* *<p>second line</p>\n\n';
      var multiLineComment3 = '\n * abcde\n * fghij\n * nothing\n';
      var expectedResult1 = '<p>first line of comment</p><br/>\n<p>second line</p>';
      var expectedResult2 = '<p>first line of comment</p><br/>\n*<p>second line</p>';
      var expectedResult3 = 'abcde\nfghij\nnothing';

      describe(buildTestTitle(multiLineComment1), function () {
        it('returns ' + buildTestTitle(expectedResult1), function () {
          expect(formatComment(multiLineComment1)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(multiLineComment2), function () {
        it('returns ' + buildTestTitle(expectedResult2), function () {
          expect(formatComment(multiLineComment2)).to.eq(expectedResult2);
        });
      });
      describe(buildTestTitle(multiLineComment3), function () {
        it('returns ' + buildTestTitle(expectedResult3), function () {
          expect(formatComment(multiLineComment3)).to.eq(expectedResult3);
        });
      });
    });
  });
  describe('::dateFormatForLiquibase', () => {
    describe('when passing both arguments', () => {
      it('uses the increment with the passed date', () => {
        const now = new Date();
        const increment = 1000042;
        const result =
          dateFormatForLiquibase({date: now, increment: increment});
        now.setSeconds(now.getUTCSeconds() + increment);
        const now_utc = new Date(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes(),
          now.getUTCSeconds());
        const year = `${now_utc.getFullYear()}`;
        let month = `${now_utc.getMonth() + 1}`;
        if (month.length === 1) {
          month = `0${month}`;
        }
        let day = `${now_utc.getDate()}`;
        if (day.length === 1) {
          day = `0${day}`;
        }
        let hour = `${now_utc.getHours()}`;
        if (hour.length === 1) {
          hour = `0${hour}`;
        }
        let minute = `${now_utc.getMinutes()}`;
        if (minute.length === 1) {
          minute = `0${minute}`;
        }
        let second = `${now_utc.getSeconds()}`;
        if (second.length === 1) {
          second = `0${second}`;
        }
        expect(
          result
        ).to.equal(`${year}${month}${day}${hour}${minute}${second}`);
      });
    });
    describe('when not passing the date', () => {
      it('does not fail', () => {
        expect(dateFormatForLiquibase().length).to.equal(14);
      });
    });
    describe('when not passing the increment', () => {
      it('formats the current time for liquibase with no increment', () => {
        const now = new Date();
        const result = dateFormatForLiquibase({date: now});
        const now_utc = new Date(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes(),
          now.getUTCSeconds());
        const year = `${now_utc.getFullYear()}`;
        let month = `${now_utc.getMonth() + 1}`;
        if (month.length === 1) {
          month = `0${month}`;
        }
        let day = `${now_utc.getDate()}`;
        if (day.length === 1) {
          day = `0${day}`;
        }
        let hour = `${now_utc.getHours()}`;
        if (hour.length === 1) {
          hour = `0${hour}`;
        }
        let minute = `${now_utc.getMinutes()}`;
        if (minute.length === 1) {
          minute = `0${minute}`;
        }
        let second = `${(now_utc.getSeconds()) % 60}`;
        if (second.length === 1) {
          second = `0${second}`;
        }
        expect(
          result
        ).to.equal(`${year}${month}${day}${hour}${minute}${second}`);
      });
    });
  });
});

function buildTestTitle(comment) {
  return `'${comment}'`;
}
