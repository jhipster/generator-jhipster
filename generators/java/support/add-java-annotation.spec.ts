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

import { addJavaAnnotation, addJavaImport, parseJavaAnnotation } from './add-java-annotation.ts';

describe('generator > java', () => {
  describe('addJavaImport', () => {
    describe('not passing content', () => {
      it('should return a function', () => {
        expect(typeof addJavaImport('foo') === 'function').toBe(true);
      });
    });

    describe('passing content', () => {
      it('should add the import', () => {
        expect(
          addJavaImport(
            `package com.mycompany.myapp;
`,
            'com.mycompany.myapp.Foo',
          ),
        ).toBe(`package com.mycompany.myapp;
import com.mycompany.myapp.Foo;
`);
      });

      it('should add the import after a blank line', () => {
        expect(
          addJavaImport(
            `package com.mycompany.myapp;

`,
            'com.mycompany.myapp.Foo',
          ),
        ).toBe(`package com.mycompany.myapp;

import com.mycompany.myapp.Foo;
`);
      });

      it('should add the static import', () => {
        expect(
          addJavaImport(
            `package com.mycompany.myapp;
`,
            'com.mycompany.myapp.Foo',
            { staticImport: true },
          ),
        ).toBe(`package com.mycompany.myapp;
import static com.mycompany.myapp.Foo;
`);
      });
    });
  });

  describe('addJavaAnnotation', () => {
    describe('not passing content', () => {
      it('should return a function', () => {
        expect(typeof addJavaAnnotation({ annotation: 'Foo' }) === 'function').toBe(true);
      });
    });

    describe('passing content', () => {
      it('should add the annotation', () => {
        expect(
          addJavaAnnotation(
            `package com.mycompany.myapp;

public class MyTest {}`,
            { annotation: 'Foo' },
          ),
        ).toBe(`package com.mycompany.myapp;

@Foo
public class MyTest {}`);
      });

      it('should add the annotation and import', () => {
        expect(
          addJavaAnnotation(
            `package com.mycompany.myapp;

public class MyTest {}`,
            { annotation: 'Foo', package: 'com.mycompany.myapp' },
          ),
        ).toBe(`package com.mycompany.myapp;

import com.mycompany.myapp.Foo;
@Foo
public class MyTest {}`);
      });

      it('should add the annotation with parameter and import', () => {
        expect(
          addJavaAnnotation(
            `package com.mycompany.myapp;

public class MyTest {}`,
            { annotation: 'Foo', package: 'com.mycompany.myapp', parameters: () => 'bar="baz"' },
          ),
        ).toBe(`package com.mycompany.myapp;

import com.mycompany.myapp.Foo;
@Foo(bar="baz")
public class MyTest {}`);
      });

      it('should add the annotation with object parameter and import', () => {
        expect(
          addJavaAnnotation(
            `package com.mycompany.myapp;

public class MyTest {}`,
            { annotation: 'Foo', package: 'com.mycompany.myapp', parameters: () => ({ value: 'bar="baz"' }) },
          ),
        ).toBe(`package com.mycompany.myapp;

import com.mycompany.myapp.Foo;
@Foo(bar="baz")
public class MyTest {}`);
      });

      it('should add the annotation with parameter using callback and import', () => {
        expect(
          addJavaAnnotation(
            `package com.mycompany.myapp;

public class MyTest {}`,
            { annotation: 'Foo', package: 'com.mycompany.myapp', parameters: (_, cb) => cb.setKeyValue('value', '"baz"') },
          ),
        ).toBe(`package com.mycompany.myapp;

import com.mycompany.myapp.Foo;
@Foo("baz")
public class MyTest {}`);
      });

      it('should add the annotation with array parameter using callback and import', () => {
        expect(
          addJavaAnnotation(
            `package com.mycompany.myapp;

public class MyTest {}`,
            { annotation: 'Foo', package: 'com.mycompany.myapp', parameters: (_, cb) => cb.addKeyValue('value', '"baz"') },
          ),
        ).toBe(`package com.mycompany.myapp;

import com.mycompany.myapp.Foo;
@Foo("baz")
public class MyTest {}`);
      });

      it('should add the annotation with array parameter using callback and import', () => {
        expect(
          addJavaAnnotation(
            `package com.mycompany.myapp;

public class MyTest {}`,
            {
              annotation: 'Foo',
              package: 'com.mycompany.myapp',
              parameters: (_, cb) => {
                cb.addKeyValue('value', '"baz"');
                cb.addKeyValue('value', '"baz"');
              },
            },
          ),
        ).toBe(`package com.mycompany.myapp;

import com.mycompany.myapp.Foo;
@Foo({"baz", "baz"})
public class MyTest {}`);
      });

      it('should add the annotation with multiple parameters using callback and import', () => {
        expect(
          addJavaAnnotation(
            `package com.mycompany.myapp;

public class MyTest {}`,
            {
              annotation: 'Foo',
              package: 'com.mycompany.myapp',
              parameters: (_, cb) => {
                cb.addKeyValue('value', '"baz"');
                cb.addKeyValue('classes', '"baz"');
              },
            },
          ),
        ).toBe(`package com.mycompany.myapp;

import com.mycompany.myapp.Foo;
@Foo(value = "baz", classes = "baz")
public class MyTest {}`);
      });

      it('should not add the annotation to inner class', () => {
        expect(
          addJavaAnnotation(
            `package com.mycompany.myapp;

public class MyTest {
    public static class Inner {

    }
}`,
            { annotation: 'Foo' },
          ),
        ).toBe(`package com.mycompany.myapp;

@Foo
public class MyTest {
    public static class Inner {

    }
}`);
      });
    });
  });

  describe('parseJavaAnnotation', () => {
    it('should parse simple single parameters', () => {
      const input = 'name="John Doe"';
      const result = parseJavaAnnotation(input);
      expect(result).toEqual({ name: 'John Doe' });
    });

    it('should parse multiple primitive parameters', () => {
      const input = 'name="users", schema="public", version=1';
      const result = parseJavaAnnotation(input);
      expect(result).toEqual({
        name: 'users',
        schema: 'public',
        version: '1',
      });
    });

    it('should parse Java array values correctly', () => {
      const input = 'value={"ADMIN", "USER"}, count=2';
      const result = parseJavaAnnotation(input);
      expect(result.value).toEqual(['ADMIN', 'USER']);
      expect(result.count).toBe('2');
    });

    for (const [input, expected] of [
      ['', { value: '' }],
      ['"value"', { value: '"value"' }],
      [' a = "b" ', { a: 'b' }],
    ]) {
      it(`should handle edge case: ${input}`, () => {
        const result = parseJavaAnnotation(input as string);
        expect(result).toEqual(expected);
      });
    }
  });
});
