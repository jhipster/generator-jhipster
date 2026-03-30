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

import { before, describe, expect, it } from 'esmocha';

import { createRuntime } from '../runtime.ts';

import { parse } from './api.ts';

describe('jdl - JDL DSL API', () => {
  const jdlRuntime = createRuntime();

  describe('when wanting an AST', () => {
    describe('with a valid input', () => {
      let ast: any;

      before(() => {
        ast = parse('@service(serviceClass) entity A {@Id field String}', jdlRuntime);
      });

      it('should return an AST', () => {
        expect(ast.entities).toHaveLength(1);
        expect(ast.entities[0]).toEqual({
          name: 'A',
          tableName: undefined,
          annotations: [{ optionName: 'service', optionValue: 'serviceClass', type: 'BINARY' }],
          body: [
            {
              name: 'field',
              type: 'String',
              validations: [],
              documentation: null,
              annotations: [{ optionName: 'Id', type: 'UNARY' }],
            },
          ],
          documentation: null,
        });
      });
    });

    describe('with a lexing error', () => {
      let parseInvalidToken: () => any;

      before(() => {
        parseInvalidToken = () => parse('entity ± {', jdlRuntime);
      });

      it('should throw an error with the offset information', () => {
        expect(parseInvalidToken).toThrow('offset: 7');
      });

      it('should throw an error with the unexpected character', () => {
        expect(parseInvalidToken).toThrow('±');
      });
    });

    describe('with a parsing error', () => {
      describe('with an unexpected token', () => {
        let parseWrongClosingBraces: () => any;

        before(() => {
          parseWrongClosingBraces = () => parse('entity Person { ]', jdlRuntime);
        });

        it('should throw an error with position information', () => {
          let errorMessage = '';
          try {
            parseWrongClosingBraces();
          } catch (error: any) {
            errorMessage = error?.message ?? '';
          }
          expect(errorMessage).toContain('line: 1');
          expect(errorMessage).toContain('column: 17');
        });

        it('should throw an error with typeof MismatchTokenException', () => {
          expect(parseWrongClosingBraces).toThrow('MismatchedTokenException');
        });
      });

      describe('with a missing token at EOF', () => {
        let parseMissingClosingBraces: () => any;

        before(() => {
          parseMissingClosingBraces = () => parse('entity Person {', jdlRuntime);
        });

        it('should throw an error with typeof MismatchTokenException', () => {
          expect(parseMissingClosingBraces).toThrow('MismatchedTokenException');
        });

        it('should throw an error without any location information', () => {
          // The 'EOF' token that is found instead of the expected '}' is a virtual token
          // It has no location information to report, An error (api.js) handler may choose
          // to manually add the last line/column in that case.
          expect(parseMissingClosingBraces).not.toThrow('line: 1');
        });
      });
    });

    describe('with a semantic validation error', () => {
      it('should throw an error', () => {
        // lower case entityName first char
        const invalidInput = 'entity person { }';
        expect(() => parse(invalidInput, jdlRuntime)).toThrow(/.+\/\^\[A-Z][^]+line: 1.+column: 8/);
      });
    });
  });
});
