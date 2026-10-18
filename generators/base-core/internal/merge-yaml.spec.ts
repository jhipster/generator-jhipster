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
import { describe, expect, it } from 'expect-node';

import { mergeYamlContent } from './merge-yaml.ts';

describe('generator - base-core - internal - mergeYamlContent', () => {
  const content = `# A comment of the file
name: jhipster
services:
  app:
    image: jhipster
    environment:
      - A=b
    # A comment of the healthcheck
    healthcheck:
      test: ['CMD-SHELL', 'a command that is longer than eighty characters, which must not be folded by the merge']
`;

  it('should add the keys and keep the rest as written', () => {
    expect(
      mergeYamlContent(content, {
        services: {
          app: { depends_on: { db: { condition: 'service_healthy' } }, environment: ['C=d'] },
          db: { extends: { file: './db.yml', service: 'db' } },
        },
      }),
    ).toMatchInlineSnapshot(`
"# A comment of the file
name: jhipster
services:
  app:
    image: jhipster
    environment:
      - A=b
      - C=d
    # A comment of the healthcheck
    healthcheck:
      test: [ 'CMD-SHELL', 'a command that is longer than eighty characters, which must not be folded by the merge' ]
    depends_on:
      db:
        condition: service_healthy
  db:
    extends:
      file: ./db.yml
      service: db
"
`);
  });

  it('should replace a value', () => {
    expect(mergeYamlContent('name: jhipster\n', { name: 'other' })).toBe('name: other\n');
  });

  it('should merge into an empty content', () => {
    expect(mergeYamlContent('', { services: { app: { image: 'jhipster' } } })).toBe('services:\n  app:\n    image: jhipster\n');
  });
});
