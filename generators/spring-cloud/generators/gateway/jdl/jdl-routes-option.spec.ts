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

import { convertSingleContentToJDL } from '../../../../../lib/jdl/converters/json-to-jdl-converter.ts';
import { type ImportState, createImporterFromContent } from '../../../../../lib/jdl/jdl-importer.ts';
import { getDefaultRuntime } from '../../../../../lib/jdl-config/jhipster-jdl-config.ts';

const optionName = 'routes';

describe('generators - spring-cloud:gateway - jdl', () => {
  const runtime = getDefaultRuntime();

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
      jdl = convertSingleContentToJDL(
        {
          'generator-jhipster': { baseName: 'bar', [optionName]: ['blog:blog_host:123', 'store:store_host', 'notification'] },
        },
        runtime,
      );
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
