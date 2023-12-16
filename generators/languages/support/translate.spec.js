/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { beforeEach, it, describe, expect, esmocha } from 'esmocha';
import { createJhiTransformTranslateReplacer, createJhiTransformTranslateStringifyReplacer } from './translate.js';

describe('generator - languages - translate', () => {
  let getWebappTranslation;

  beforeEach(() => {
    let value = 0;
    getWebappTranslation = esmocha.fn().mockImplementation((key, interpolation = '') => {
      if (interpolation) {
        interpolation = `-${JSON.stringify(interpolation)}`;
      }
      return `${key}${interpolation}-translated-"-'-value-${value++}`;
    });
  });

  describe('jhiTransformTranslate', () => {
    let jhiTransformTranslate;

    beforeEach(() => {
      jhiTransformTranslate = createJhiTransformTranslateReplacer(getWebappTranslation);
    });

    it('should replace __jhiTransformTranslate__ function', () => {
      const body = `
__jhiTransformTranslate__('global')
`;
      expect(jhiTransformTranslate(body)).toMatchInlineSnapshot(`
"
global-translated-"-'-value-0
"
`);
    });

    it('should replace __jhiTransformTranslate__ function with interpolation', () => {
      const body = `
__jhiTransformTranslate__('global', { "min":20, "max": 50, "pattern": "^[a-zA-Z0-9]*$",
"anotherPattern": "^[a-zA-Z0-9]*$",
"dynamic": "exec()"
})
`;
      expect(jhiTransformTranslate(body)).toMatchInlineSnapshot(`
"
global-{"min":20,"max":50,"pattern":"^[a-zA-Z0-9]*$","anotherPattern":"^[a-zA-Z0-9]*$","dynamic":"exec()"}-translated-"-'-value-0
"
`);
    });
  });

  describe('jhiTransformTranslate with escapeHtml', () => {
    let jhiTransformTranslate;

    beforeEach(() => {
      jhiTransformTranslate = createJhiTransformTranslateReplacer(getWebappTranslation, { escapeHtml: true });
    });

    describe('with translation disabled', () => {
      describe('.tsx files', () => {
        it('should replace __jhiTransformTranslate__ function', () => {
          const body = `
__jhiTransformTranslate__('global')
`;
          expect(jhiTransformTranslate(body)).toMatchInlineSnapshot(`
"
global-translated-&quot;-&apos;-value-0
"
`);
        });

        it('should replace __jhiTransformTranslate__ function with interpolation', () => {
          const body = `
__jhiTransformTranslate__('global', { "min": 20, "max": 50, "pattern": "^[a-zA-Z0-9]*$",
  "anotherPattern": "^[a-zA-Z0-9]*$",
  "dynamic": "exec()"
})
`;
          expect(jhiTransformTranslate(body)).toMatchInlineSnapshot(`
"
global-{&quot;min&quot;:20,&quot;max&quot;:50,&quot;pattern&quot;:&quot;^[a-zA-Z0-9]*__jhiTransformTranslate__('global', { "min": 20, "max": 50, "pattern": "^[a-zA-Z0-9]*$",
  "anotherPattern": "^[a-zA-Z0-9]*$",
  "dynamic": "exec()"
})quot;,&quot;anotherPattern&quot;:&quot;^[a-zA-Z0-9]*__jhiTransformTranslate__('global', { "min": 20, "max": 50, "pattern": "^[a-zA-Z0-9]*$",
  "anotherPattern": "^[a-zA-Z0-9]*$",
  "dynamic": "exec()"
})quot;,&quot;dynamic&quot;:&quot;exec()&quot;}-translated-&quot;-&apos;-value-0
"
`);
        });
      });
    });
  });

  describe('jhiTransformTranslate with wrapTranslation', () => {
    let jhiTransformTranslate;

    beforeEach(() => {
      jhiTransformTranslate = createJhiTransformTranslateReplacer(getWebappTranslation, { wrapTranslation: '"' });
    });

    describe('with translation disabled', () => {
      describe('.tsx files', () => {
        it('should replace __jhiTransformTranslate__ function', () => {
          const body = `
__jhiTransformTranslate__('global')
`;
          expect(jhiTransformTranslate(body)).toMatchInlineSnapshot(`
"
"global-translated-"-'-value-0"
"
`);
        });

        it('should replace __jhiTransformTranslate__ function with interpolation', () => {
          const body = `
__jhiTransformTranslate__('global', { "min":20, "max": 50, "pattern": "^[a-zA-Z0-9]*$",
  "anotherPattern": "^[a-zA-Z0-9]*$",
  "dynamic": "exec()"
})
__jhiTransformTranslate__('logs.nbloggers', { "total": "{{ loggers.length }}" })

`;
          expect(jhiTransformTranslate(body)).toMatchInlineSnapshot(`
"
"global-{"min":20,"max":50,"pattern":"^[a-zA-Z0-9]*$","anotherPattern":"^[a-zA-Z0-9]*$","dynamic":"exec()"}-translated-"-'-value-0"
"logs.nbloggers-{"total":"{{ loggers.length }}"}-translated-"-'-value-1"

"
`);
        });
      });
    });
  });

  describe('jhiTransformTranslate', () => {
    let jhiTransformTranslateStringify;

    beforeEach(() => {
      jhiTransformTranslateStringify = createJhiTransformTranslateStringifyReplacer(getWebappTranslation);
    });

    it('should replace __jhiTransformTranslateStringify__ function', () => {
      const body = `
__jhiTransformTranslateStringify__('global')
`;
      expect(jhiTransformTranslateStringify(body)).toMatchInlineSnapshot(`
"
"global-translated-\\"-'-value-0"
"
`);
    });
  });
});
