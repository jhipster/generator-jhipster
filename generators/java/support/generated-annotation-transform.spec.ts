import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { describe, expect, it } from 'esmocha';
import generatedAnnotationTransform from './generated-annotation-transform.ts';

describe('generators - java - generated-annotation-transform', () => {
  it('should add GeneratedByJHipster to interface', async () => {
    const file = {
      contents: Buffer.from(`package package.name;

interface Foo {
}`),
      path: 'foo.java',
    };
    await pipeline(Readable.from([file]), generatedAnnotationTransform('generated.by.package'));
    expect(file.contents.toString()).toMatchInlineSnapshot(`
"package package.name;

import generated.by.package.GeneratedByJHipster;
@GeneratedByJHipster
interface Foo {
}"
`);
  });

  it('should add GeneratedByJHipster to @interface', async () => {
    const file = {
      contents: Buffer.from(`package package.name;

@interface Foo {
}`),
      path: 'foo.java',
    };
    await pipeline(Readable.from([file]), generatedAnnotationTransform('generated.by.package'));
    expect(file.contents.toString()).toMatchInlineSnapshot(`
"package package.name;

import generated.by.package.GeneratedByJHipster;
@GeneratedByJHipster
@interface Foo {
}"
`);
  });
});
