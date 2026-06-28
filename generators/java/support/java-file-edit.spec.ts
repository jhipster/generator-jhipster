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
