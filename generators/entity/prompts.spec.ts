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

import { defaultHelpers as helpers, runResult } from '#testing';

describe('generator - entity - prompts', () => {
  describe('with a relationship to the built-in User entity', () => {
    before(async () => {
      let relationshipAdded = false;
      await helpers
        .runJHipster('entity')
        .withJHipsterConfig()
        .withJHipsterContextOptions()
        .withAnswers(
          {
            fieldAdd: false,
            otherEntityName: 'User',
            relationshipName: 'user',
            relationshipType: 'many-to-one',
            bidirectional: true,
            otherEntityField: 'login',
            relationshipValidate: false,
            service: 'no',
            dto: 'no',
            pagination: 'no',
          },
          {
            callback: (answer, { question }) => {
              if (question.name !== 'relationshipAdd') return answer;
              const add = !relationshipAdded;
              relationshipAdded = true;
              return add;
            },
          },
        )
        .withArguments(['Foo'])
        .withSkipWritingPriorities()
        .withMockedSource();
    });

    it('should not ask for a bidirectional relationship', () => {
      const askedQuestionNames = runResult.askedQuestions.map(({ name }) => name);
      expect(askedQuestionNames).toContain('relationshipType');
      expect(askedQuestionNames).not.toContain('bidirectional');
    });
  });
});
