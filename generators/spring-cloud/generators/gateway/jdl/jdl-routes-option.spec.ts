import { before, describe, expect, it } from 'esmocha';
import type { ImportState } from '../../../../../lib/jdl/jdl-importer.js';
import { createImporterFromContent } from '../../../../../lib/jdl/jdl-importer.js';
import { convertSingleContentToJDL } from '../../../../../lib/jdl/converters/json-to-jdl-converter.js';

const optionName = 'routes';

describe('generators - spring-cloud:gateway - jdl', () => {
  it('should not accept route and port', () => {
    expect(() => createImporterFromContent(`application { config { ${optionName} ["blog:123"] } }`)).toThrow(
      /The routes property name must match:/,
    );
  });
  it('should not accept values starting with numbers', () => {
    expect(() => createImporterFromContent(`application { config { ${optionName} ["1foo"] } }`)).toThrow(
      /The routes property name must match:/,
    );
  });
  it('should not accept empty value', () => {
    expect(() => createImporterFromContent(`application { config { ${optionName} [""] } }`)).toThrow(
      /The routes property name must match:/,
    );
  });
  it('should not accept empty host', () => {
    expect(() => createImporterFromContent(`application { config { ${optionName} ["foo:"] } }`)).toThrow(
      /The routes property name must match:/,
    );
  });
  it('should not accept empty port', () => {
    expect(() => createImporterFromContent(`application { config { ${optionName} ["foo:foo_host:"] } }`)).toThrow(
      /The routes property name must match:/,
    );
  });
  it('should not accept non numeric port', () => {
    expect(() => createImporterFromContent(`application { config { ${optionName} ["foo:foo_host:1a"] } }`)).toThrow(
      /The routes property name must match:/,
    );
  });
  describe(`parsing ${optionName}`, () => {
    let state: ImportState;

    before(() => {
      const importer = createImporterFromContent(
        `application { config { ${optionName} ["blog:blog_host:123", "store:store_host", "notification"] } }`,
      );
      state = importer.import();
    });

    it('should set expected value', () => {
      expect(state.exportedApplicationsWithEntities.jhipster.config[optionName]).toEqual([
        'blog:blog_host:123',
        'store:store_host',
        'notification',
      ]);
    });
  });
  describe(`export ${optionName}`, () => {
    let jdl: string;

    before(() => {
      jdl = convertSingleContentToJDL({
        'generator-jhipster': { baseName: 'bar', [optionName]: ['blog:blog_host:123', 'store:store_host', 'notification'] },
      });
    });

    it('should set expected value', () => {
      expect(jdl).toEqual(`application {
  config {
    baseName bar
    routes ["blog:blog_host:123", "store:store_host", "notification"]
  }
}
`);
    });
  });
});
