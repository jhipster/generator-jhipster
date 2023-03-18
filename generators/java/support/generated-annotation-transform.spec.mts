import { jestExpect as expect } from 'mocha-expect-snapshot';
import { passthrough, pipeline } from 'p-transform';

import generatedAnnotationTransform from './generated-annotation-transform.mjs';

describe('generators - java - generated-annotation-transform', () => {
  it('should add GeneratedByJHipster to interface', async () => {
    const source = passthrough();
    const file = {
      contents: Buffer.from(`package package.name;

interface Foo {
}`),
      path: 'foo.java',
    };
    setImmediate(() => {
      source.write(file);
      source.end();
    });
    await pipeline(source, generatedAnnotationTransform('generated.by.package'));
    expect(file.contents.toString()).toMatchInlineSnapshot(`
"package package.name;
import generated.by.package.GeneratedByJHipster;

@GeneratedByJHipster
interface Foo {
}"
`);
  });

  it('should add GeneratedByJHipster to @interface', async () => {
    const source = passthrough();
    const file = {
      contents: Buffer.from(`package package.name;

@interface Foo {
}`),
      path: 'foo.java',
    };
    setImmediate(() => {
      source.write(file);
      source.end();
    });
    await pipeline(source, generatedAnnotationTransform('generated.by.package'));
    expect(file.contents.toString()).toMatchInlineSnapshot(`
"package package.name;
import generated.by.package.GeneratedByJHipster;

@GeneratedByJHipster
@interface Foo {
}"
`);
  });
});
