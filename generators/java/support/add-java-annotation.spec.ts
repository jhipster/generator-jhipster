import { describe, expect, it } from 'esmocha';

import { addJavaAnnotation, addJavaImport } from './add-java-annotation.ts';

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

      it('should add the annotation and import', () => {
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
});
