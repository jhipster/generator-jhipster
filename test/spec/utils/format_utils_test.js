/**
 * Copyright 2013-2018 the original author or authors from the JHipster project.
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
const expect = require('chai').expect;
const FormatUtils = require('../../../lib/utils/format_utils');

const formatComment = FormatUtils.formatComment;
const dateFormatForLiquibase = FormatUtils.dateFormatForLiquibase;

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
        it(`returns ${buildTestTitle(expectedResult1)}`, () => {
          expect(formatComment(oneLineComment1)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(oneLineComment2), () => {
        it(`returns ${buildTestTitle(expectedResult1)}`, () => {
          expect(formatComment(oneLineComment2)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(oneLineComment3), () => {
        it(`returns ${buildTestTitle(expectedResult2)}`, () => {
          expect(formatComment(oneLineComment3)).to.eq(expectedResult2);
        });
      });
      describe(buildTestTitle(oneLineComment4), () => {
        it(`returns ${buildTestTitle(expectedResult3)}`, () => {
          expect(formatComment(oneLineComment4)).to.eq(expectedResult3);
        });
      });
      describe(buildTestTitle(oneLineComment5), () => {
        it(`returns ${buildTestTitle(expectedResult3)}`, () => {
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
        it(`returns ${buildTestTitle(expectedResult1)}`, () => {
          expect(formatComment(multiLineComment1)).to.eq(expectedResult1);
        });
      });
      describe(buildTestTitle(multiLineComment2), () => {
        it(`returns ${buildTestTitle(expectedResult2)}`, () => {
          expect(formatComment(multiLineComment2)).to.eq(expectedResult2);
        });
      });
      describe(buildTestTitle(multiLineComment3), () => {
        it(`returns ${buildTestTitle(expectedResult3)}`, () => {
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
          dateFormatForLiquibase({ date: now, increment });
        now.setSeconds(now.getUTCSeconds() + increment);
        const nowUtc = new Date(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes(),
          now.getUTCSeconds());
        const year = `${nowUtc.getFullYear()}`;
        let month = `${nowUtc.getMonth() + 1}`;
        if (month.length === 1) {
          month = `0${month}`;
        }
        let day = `${nowUtc.getDate()}`;
        if (day.length === 1) {
          day = `0${day}`;
        }
        let hour = `${nowUtc.getHours()}`;
        if (hour.length === 1) {
          hour = `0${hour}`;
        }
        let minute = `${nowUtc.getMinutes()}`;
        if (minute.length === 1) {
          minute = `0${minute}`;
        }
        let second = `${nowUtc.getSeconds()}`;
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
        const result = dateFormatForLiquibase({ date: now });
        const nowUtc = new Date(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          now.getUTCHours(),
          now.getUTCMinutes(),
          now.getUTCSeconds());
        const year = `${nowUtc.getFullYear()}`;
        let month = `${nowUtc.getMonth() + 1}`;
        if (month.length === 1) {
          month = `0${month}`;
        }
        let day = `${nowUtc.getDate()}`;
        if (day.length === 1) {
          day = `0${day}`;
        }
        let hour = `${nowUtc.getHours()}`;
        if (hour.length === 1) {
          hour = `0${hour}`;
        }
        let minute = `${nowUtc.getMinutes()}`;
        if (minute.length === 1) {
          minute = `0${minute}`;
        }
        let second = `${(nowUtc.getSeconds()) % 60}`;
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
