import { describe, expect, it } from 'esmocha';

import { injectJavaConstructorParam, injectJavaConstructorSetter, injectJavaField } from './java-file-edit.ts';

describe('generator > java', () => {
  describe('injectJavaConstructorParam', () => {
    describe('not passing content', () => {
      it('should return a function', () => {
        expect(typeof injectJavaConstructorParam({ className: 'Foo', param: 'Bar' }) === 'function').toBe(true);
      });
    });
    describe('passing a valid constructor', () => {
      it('should add param to empty params', () => {
        expect(
          injectJavaConstructorParam(
            `
  Foo() {}`,
            { className: 'Foo', param: 'String bar' },
          ),
        ).toBe(`
  Foo(String bar) {}`);
      });
      it('should append param', () => {
        expect(
          injectJavaConstructorParam(
            `
  Foo(String foo) {}`,
            { className: 'Foo', param: 'String bar' },
          ),
        ).toBe(`
  Foo(String foo, String bar) {}`);
      });
      it('should add param to params', () => {
        expect(
          injectJavaConstructorParam(
            `
  Foo(
    String foo
  ) {}`,
            { className: 'Foo', param: 'String bar' },
          ),
        ).toBe(`
  Foo(
    String foo
  , String bar) {}`);
      });
      it('should not append if param exists', () => {
        expect(
          injectJavaConstructorParam(
            `
  Foo(String bar) {}`,
            { className: 'Foo', param: 'String bar' },
          ),
        ).toBe(`
  Foo(String bar) {}`);
      });
    });
  });

  describe('injectJavaField', () => {
    describe('not passing content', () => {
      it('should return a function', () => {
        expect(typeof injectJavaField({ className: 'Foo', field: 'bar' }) === 'function').toBe(true);
      });
    });
    describe('passing a valid constructor', () => {
      it('should add field to class', () => {
        expect(
          injectJavaField(
            `
  Foo() {}`,
            { className: 'Foo', field: 'String bar;' },
          ),
        ).toBe(`
  String bar;

  Foo() {}`);
      });
      it('should not add if field exists', () => {
        expect(
          injectJavaField(
            `
  String bar;
  Foo(String bar) {}`,
            { className: 'Foo', field: 'String bar;' },
          ),
        ).toBe(`
  String bar;
  Foo(String bar) {}`);
      });
    });
  });

  describe('injectJavaConstructorSetter', () => {
    describe('not passing content', () => {
      it('should return a function', () => {
        expect(typeof injectJavaConstructorSetter({ className: 'Foo', setter: 'this.foo = foo;' }) === 'function').toBe(true);
      });
    });
    describe('passing a valid constructor', () => {
      it('should add setter to empty block', () => {
        expect(
          injectJavaConstructorSetter(
            `
  Foo() {}`,
            { className: 'Foo', setter: 'this.foo = foo;' },
          ),
        ).toBe(`
  Foo() {
    this.foo = foo;
}`);
      });
      it('should not inject if setter exists', () => {
        expect(
          injectJavaConstructorSetter(
            `
  Foo(String bar) {
    this.foo = foo;
  }`,
            { className: 'Foo', setter: 'this.foo = foo;' },
          ),
        ).toBe(`
  Foo(String bar) {
    this.foo = foo;
  }`);
      });
    });
  });
});
