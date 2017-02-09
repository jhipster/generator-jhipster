'use strict';

const expect = require('chai').expect,
  FormatUtils = require('../../../lib/utils/format_utils'),
  formatComment = FormatUtils.formatComment,
  dateFormatForLiquibase = FormatUtils.dateFormatForLiquibase;

describe('FormatUtils', () => {
  describe('::formatComment', () => {
    describe('when the comment is in the one-line form', () => {
      const oneLineComment1 = ' comment ';
      const oneLineComment2 = 'comment';
      const oneLineComment3 = ' * a one line comment. ';
      const oneLineComment4 = ' multi word\tcomment ';
      const oneLineComment5 = 'multi word\tcomment';
      const expectedResult1 = 'comment';
      const expectedResult2 = 'a one line comment.';
      const expectedResult3 = 'multi word\tcomment';

      describe(buildTestTitle(oneLineComment1), () => {
        it('returns ' + buildTestTitle(expectedResult1), () => {
          expect(formatComment(oneLineComment1)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(oneLineComment2), () => {
        it('returns ' + buildTestTitle(expectedResult1), () => {
          expect(formatComment(oneLineComment2)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(oneLineComment3), () => {
        it('returns ' + buildTestTitle(expectedResult2), () => {
          expect(formatComment(oneLineComment3)).to.eq(expectedResult2);
        });
      });
      describe(buildTestTitle(oneLineComment4), () => {
        it('returns ' + buildTestTitle(expectedResult3), () => {
          expect(formatComment(oneLineComment4)).to.eq(expectedResult3);
        });
      });
      describe(buildTestTitle(oneLineComment5), () => {
        it('returns ' + buildTestTitle(expectedResult3), () => {
          expect(formatComment(oneLineComment5)).to.eq(expectedResult3);
        });
      });
    });

    describe('when the comment is in the multi-line form', () => {
      const multiLineComment1 = '\n* <p>first line of comment</p><br/>\n*<p>second line</p>\n';
      const multiLineComment2 = '*** <p>first line of comment</p><br/>\n* *<p>second line</p>\n\n';
      const multiLineComment3 = '\n * abcde\n * fghij\n * nothing\n';
      const expectedResult1 = '<p>first line of comment</p><br/>\n<p>second line</p>';
      const expectedResult2 = '<p>first line of comment</p><br/>\n*<p>second line</p>';
      const expectedResult3 = 'abcde\nfghij\nnothing';

      describe(buildTestTitle(multiLineComment1), () => {
        it('returns ' + buildTestTitle(expectedResult1), () => {
          expect(formatComment(multiLineComment1)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(multiLineComment2), () => {
        it('returns ' + buildTestTitle(expectedResult2), () => {
          expect(formatComment(multiLineComment2)).to.eq(expectedResult2);
        });
      });
      describe(buildTestTitle(multiLineComment3), () => {
        it('returns ' + buildTestTitle(expectedResult3), () => {
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
