/**
 * Copyright 2013-2022 the original author or authors from the JHipster project.
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
import { expect } from 'expect';
import jest from 'jest-mock';

import { replaceAngularTranslations } from './transform-angular.cjs';

describe('Angular transform', () => {
  describe('replaceAngularTranslations', () => {
    let generator;
    let enableTranslation;

    beforeEach(() => {
      let value = 0;
      generator = {
        _getClientTranslation: jest.fn().mockImplementation(key => `translated-value-${key}-${value++}`),
        enableTranslation,
      };
    });

    describe('with translation enabled', () => {
      before(() => {
        enableTranslation = true;
      });

      it('should return the original body', () => {
        const body = `
<h1 jhiTranslate="activate.title">activate.title</h1>
<h1 [translateValues]="{ max: 50 }">translate-values1</h1>
`;
        expect(replaceAngularTranslations.call(generator, body)).toBe(body);
      });
    });

    describe('with translation enabled', () => {
      before(() => {
        enableTranslation = false;
      });

      describe('.html files', () => {
        const extension = '.html';

        it('should replace jhiTranslate attribute', () => {
          const body = `
<h1 jhiTranslate="activate.title1">activate.title1</h1>
<h1 jhiTranslate="activate.title2">activate.title2</h1>
`;
          expect(replaceAngularTranslations.call(generator, body, extension)).toMatchInlineSnapshot(`
"
<h1>activate.title1</h1>
<h1>activate.title2</h1>
"
`);
        });

        it('should replace [translateValues] attribute', () => {
          const body = `
<h1 [translateValues]="{ max: 50 }">translate-values1</h1>
<h1 [translateValues]="{ max: 50 }">translate-values2</h1>
`;
          expect(replaceAngularTranslations.call(generator, body, extension)).toMatchInlineSnapshot(`
"
<h1>translate-values1</h1>
<h1>translate-values2</h1>
"
`);
        });

        it('should replace neasted [translateValues] attribute', () => {
          const body = `
<h1 [translateValues]="{ max: 50 }"><span [translateValues]="{ max: 50 }">translate-values1</span></h1>
<h1 [translateValues]="{ max: 50 }"><span [translateValues]="{ max: 50 }">translate-values2</span></h1>
`;
          expect(replaceAngularTranslations.call(generator, body, extension)).toMatchInlineSnapshot(`
"
<h1><span>translate-values1</span></h1>
<h1><span>translate-values2</span></h1>
"
`);
        });

        it('should replace [translateValues] attribute with any character', () => {
          const body = `
<h1 [translateValues]="{  %79kma#@ }">translate-values1</h1>
<h1 [translateValues]="{  %79kma#@ }">translate-values2</h1>
`;
          expect(replaceAngularTranslations.call(generator, body, extension)).toMatchInlineSnapshot(`
"
<h1>translate-values1</h1>
<h1>translate-values2</h1>
"
`);
        });

        it('should replace neasted [translateValues] attribute', () => {
          const body = `
<h1 [translateValues]="{ max: 50 }"><span [translateValues]="{ max: 50 }">translate-values1</span></h1>
<h1 [translateValues]="{ max: 20 }"><span [translateValues]="{ max: 20 }">translate-values2</span></h1>
`;
          expect(replaceAngularTranslations.call(generator, body, extension)).toMatchInlineSnapshot(`
"
<h1><span>translate-values1</span></h1>
<h1><span>translate-values2</span></h1>
"
`);
        });

        it('should replace placeholder attribute value with translated value', () => {
          const body = `
<input placeholder="{{ 'global.form.currentpassword.placeholder1' | translate }}"/>
<input placeholder="{{ 'global.form.currentpassword.placeholder2' | translate }}"/>
`;
          expect(replaceAngularTranslations.call(generator, body, extension)).toMatchInlineSnapshot(`
"
<input placeholder=\\"translated-value-global.form.currentpassword.placeholder1-0\\"/>
<input placeholder=\\"translated-value-global.form.currentpassword.placeholder2-1\\"/>
"
`);
        });

        it('should replace title attribute value with translated value', () => {
          const body = `
<input title="{{ 'global.form.currentpassword.title1' | translate }}"/>
<input title="{{ 'global.form.currentpassword.title2' | translate }}"/>
`;
          expect(replaceAngularTranslations.call(generator, body, extension)).toMatchInlineSnapshot(`
"
<input title=\\"translated-value-global.form.currentpassword.title1-0\\"/>
<input title=\\"translated-value-global.form.currentpassword.title2-1\\"/>
"
`);
        });
      });

      describe('.route.ts files', () => {
        const extension = '.route.ts';

        it('should replace pageTitle fields with translation values', () => {
          const body = `
pageTitle: 'activate.title1',
pageTitle: 'activate.title2',
`;
          expect(replaceAngularTranslations.call(generator, body, extension)).toMatchInlineSnapshot(`
"
pageTitle: 'translated-value-activate.title1-0',
pageTitle: 'translated-value-activate.title2-1',
"
`);
        });
      });

      describe('.module.ts files', () => {
        const extension = '.module.ts';

        it('should replace pageTitle fields with translation values', () => {
          const body = `
pageTitle: 'activate.title1',
pageTitle: 'activate.title2',
`;
          expect(replaceAngularTranslations.call(generator, body, extension)).toMatchInlineSnapshot(`
"
pageTitle: 'translated-value-activate.title1-0',
pageTitle: 'translated-value-activate.title2-1',
"
`);
        });
      });

      describe('.error.route.ts files', () => {
        const extension = '.error.route.ts';

        it('should replace pageTitle fields with translation values', () => {
          const body = `
errorMessage: 'activate.title1',
errorMessage: 'activate.title2',
`;
          expect(replaceAngularTranslations.call(generator, body, extension)).toMatchInlineSnapshot(`
"
errorMessage: 'translated-value-activate.title1-0',
errorMessage: 'translated-value-activate.title2-1',
"
`);
        });
      });
    });
  });
});
