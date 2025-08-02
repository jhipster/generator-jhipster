import { describe, expect, it } from 'esmocha';

import formatAsLiquibaseRemarks from './formatting.ts';

describe('generator - liquibase - support - formatting', () => {
  describe('formatAsLiquibaseRemarks', () => {
    describe('when formatting a nil text', () => {
      it('returns it', () => {
        // @ts-expect-error
        expect(formatAsLiquibaseRemarks()).toEqual(undefined);
      });
    });
    describe('when formatting an empty text', () => {
      it('returns it', () => {
        expect(formatAsLiquibaseRemarks('')).toEqual('');
      });
    });
    describe('when formatting normal texts', () => {
      describe('when having empty lines', () => {
        it('discards them', () => {
          expect(formatAsLiquibaseRemarks('First line\n \nSecond line\n\nThird line')).toEqual('First line Second line Third line');
        });
      });
      describe('when having a plain text', () => {
        it('puts a space before each line', () => {
          expect(formatAsLiquibaseRemarks('JHipster is\na great generator')).toEqual('JHipster is a great generator');
        });
      });
      describe('when having ampersand', () => {
        it('formats the text to escape it', () => {
          expect(formatAsLiquibaseRemarks('JHipster uses Spring & Hibernate')).toEqual('JHipster uses Spring &amp; Hibernate');
        });
      });
      describe('when having quotes', () => {
        it('formats the text to escape it', () => {
          expect(formatAsLiquibaseRemarks('JHipster is "the" best')).toEqual('JHipster is &quot;the&quot; best');
        });
      });
      describe('when having apostrophe', () => {
        it('formats the text to escape it', () => {
          expect(formatAsLiquibaseRemarks("JHipster is 'the' best")).toEqual('JHipster is &apos;the&apos; best');
        });
      });
      describe('when having HTML tags < and >', () => {
        it('formats the text to escape it', () => {
          expect(formatAsLiquibaseRemarks('Not boldy\n<b>boldy</b>')).toEqual('Not boldy&lt;b&gt;boldy&lt;/b&gt;');
        });
      });
    });
  });
});
