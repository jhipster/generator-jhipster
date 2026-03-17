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

import { createRuntime } from '../../runtime.ts';

const { lexer: JDLLexer } = createRuntime();

describe('jdl - JDLLexer', () => {
  describe('when passing a valid JDL input', () => {
    let lexingResult: ReturnType<typeof JDLLexer.tokenize>;

    before(() => {
      const input = `
   entity JobHistory {
     startDate ZonedDateTime,
     endDate ZonedDateTime,
     language Language,
     positionDuration Duration
   }`;
      lexingResult = JDLLexer.tokenize(input);
    });

    it('should not fail', () => {
      expect(lexingResult.errors).toHaveLength(0);
    });

    it('should lex a simple valid JDL text', () => {
      const tokens = lexingResult.tokens;
      expect(tokens.length).toBe(15);
      expect(tokens[0].image).toBe('entity');
      expect(tokens[1].image).toBe('JobHistory');
      expect(tokens[2].image).toBe('{');
      expect(tokens[3].image).toBe('startDate');
      expect(tokens[4].image).toBe('ZonedDateTime');
      expect(tokens[5].image).toBe(',');
      expect(tokens[6].image).toBe('endDate');
      expect(tokens[7].image).toBe('ZonedDateTime');
      expect(tokens[8].image).toBe(',');
      expect(tokens[9].image).toBe('language');
      expect(tokens[10].image).toBe('Language');
      expect(tokens[11].image).toBe(',');
      expect(tokens[12].image).toBe('positionDuration');
      expect(tokens[13].image).toBe('Duration');
      expect(tokens[14].image).toBe('}');
    });
  });

  describe('when passing an invalid JDL input', () => {
    let lexingResult: ReturnType<typeof JDLLexer.tokenize>;

    before(() => {
      const input = `
   entity JobHistory {
     startDate ZonedDateTime,
     ###
     endDate ZonedDateTime
   }`;
      lexingResult = JDLLexer.tokenize(input);
    });

    it('should report the errors', () => {
      const errors = lexingResult.errors;
      expect(errors).toHaveLength(1);
      expect(errors[0].line).toBe(4);
      expect(errors[0].column).toBe(6);
      expect(errors[0].message).toContain('#');
      expect(errors[0].message).toContain('skipped 3 characters');
    });

    it('should lex a simple invalid JDL text', () => {
      expect(lexingResult.tokens).toHaveLength(9);
    });
  });
});
