/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
