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
import { readFile } from 'node:fs/promises';

import { getPackageRoot } from '../../../lib/index.ts';
import { YO_RC_FILE } from '../../generator-constants.ts';

import { extractDataFromInfo, filterData } from './extract-info.ts';
import { markdownDetails } from './markdown-content.ts';

describe('extract-info', () => {
  describe('extractDataFromInfo', () => {
    it('should extract empty object from the jhipster info template', async () => {
      expect(extractDataFromInfo((await readFile(getPackageRoot('.github/ISSUE_TEMPLATE/BUG_REPORT.md'))).toString()))
        .toMatchInlineSnapshot(`
{
  "files": [],
  "yoRcBlank": true,
}
`);
    });

    it('should extract info from jhipster info', () => {
      expect(
        extractDataFromInfo(
          markdownDetails({
            title: `${YO_RC_FILE} file`,
            content: '{ "generator-jhipster": { "clientFramework": "angular" } }',
          }),
        ),
      ).toMatchInlineSnapshot(`
{
  "files": [
    {
      "content": "{ "generator-jhipster": { "clientFramework": "angular" } }",
      "filename": ".yo-rc.json",
      "type": "yo-rc",
    },
  ],
  "yoRcBlank": false,
  "yoRcContent": "{"generator-jhipster":{"clientFramework":"angular"}}",
  "yoRcValid": true,
}
`);
    });

    it('should extract info from jhipster info with 2 .yo-rc files', () => {
      expect(
        extractDataFromInfo(
          markdownDetails({
            title: `${YO_RC_FILE} file`,
            content: '{ "generator-jhipster": { } }',
          }) +
            markdownDetails({
              title: `${YO_RC_FILE} file for app`,
              content: '{ "generator-jhipster": { "clientFramework": "angular" } }',
            }),
        ),
      ).toMatchInlineSnapshot(`
{
  "files": [
    {
      "content": "{ "generator-jhipster": { } }",
      "filename": ".yo-rc.json",
      "type": "yo-rc",
    },
  ],
  "yoRcBlank": false,
  "yoRcContent": "{"generator-jhipster":{}}",
  "yoRcValid": true,
}
`);
    });

    it('should extract empty object from the jdl template', async () => {
      expect(extractDataFromInfo((await readFile(getPackageRoot('.github/ISSUE_TEMPLATE/BUG_REPORT_JDL.md'))).toString()))
        .toMatchInlineSnapshot(`
{
  "files": [],
  "yoRcBlank": true,
}
`);
    });

    it('should extract empty from non-jdl JDL definitions', () => {
      expect(extractDataFromInfo(markdownDetails({ title: 'JDL definitions', content: 'foo' }))).toMatchInlineSnapshot(`
{
  "files": [],
  "yoRcBlank": true,
}
`);
    });

    it('should extract application from JDL definitions', () => {
      expect(extractDataFromInfo(markdownDetails({ title: 'JDL definitions', content: 'application { config {} }' })))
        .toMatchInlineSnapshot(`
{
  "files": [
    {
      "content": "application { config {} }",
      "filename": "app.jdl",
      "type": "jdl",
    },
  ],
  "jdlApplications": 1,
  "jdlDefinitions": "application { config {} }",
  "yoRcBlank": true,
}
`);
    });

    it('should extract more than one application from JDL definitions', () => {
      expect(
        extractDataFromInfo(
          markdownDetails({ title: 'JDL definitions', content: 'application { config { baseName first } }' }) +
            markdownDetails({ title: 'JDL definitions', content: 'application { config { baseName second } }' }),
        ),
      ).toMatchInlineSnapshot(`
{
  "files": [
    {
      "content": "application { config { baseName first } }",
      "filename": "app.jdl",
      "type": "jdl",
    },
    {
      "content": "application { config { baseName second } }",
      "filename": "app-1.jdl",
      "type": "jdl",
    },
  ],
  "jdlApplications": 1,
  "jdlDefinitions": "application { config { baseName first } }",
  "yoRcBlank": true,
}
`);
    });
  });

  describe('filterData', () => {
    it('should keep .yo-rc.json files', () => {
      const data = {
        yoRcBlank: true,
        files: [
          { filename: '.yo-rc.json', content: '{}', type: 'yo-rc' as const },
          { filename: 'other.json', content: '{}', type: 'json' as const },
        ],
      };
      expect(filterData(data)).toMatchInlineSnapshot(`
{
  "files": [
    {
      "content": "{}",
      "filename": ".yo-rc.json",
      "type": "yo-rc",
    },
  ],
  "yoRcBlank": true,
}
`);
    });

    it('should keep .jdl files', () => {
      const data = {
        yoRcBlank: true,
        files: [
          { filename: 'app.jdl', content: 'application {}', type: 'jdl' as const },
          { filename: 'app-1.jdl', content: 'application {}', type: 'jdl' as const },
          { filename: 'readme.md', content: 'text', type: 'json' as const },
        ],
      };
      expect(filterData(data)).toMatchInlineSnapshot(`
{
  "files": [
    {
      "content": "application {}",
      "filename": "app.jdl",
      "type": "jdl",
    },
    {
      "content": "application {}",
      "filename": "app-1.jdl",
      "type": "jdl",
    },
  ],
  "yoRcBlank": true,
}
`);
    });

    it('should keep .jhipster/*.json files', () => {
      const data = {
        yoRcBlank: true,
        files: [
          { filename: '.jhipster/User.json', content: '{}', type: 'json' as const },
          { filename: '.jhipster/Person.json', content: '{}', type: 'json' as const },
          { filename: 'other/file.json', content: '{}', type: 'json' as const },
        ],
      };
      expect(filterData(data)).toMatchInlineSnapshot(`
{
  "files": [
    {
      "content": "{}",
      "filename": ".jhipster/User.json",
      "type": "json",
    },
    {
      "content": "{}",
      "filename": ".jhipster/Person.json",
      "type": "json",
    },
  ],
  "yoRcBlank": true,
}
`);
    });

    it('should reject empty .jhipster json filename', () => {
      const data = {
        yoRcBlank: true,
        files: [{ filename: '.jhipster/.json', content: '{}', type: 'json' as const }],
      };
      expect(filterData(data)).toMatchInlineSnapshot(`
{
  "files": [],
  "yoRcBlank": true,
}
`);
    });

    it('should filter out non-matching files', () => {
      const data = {
        yoRcBlank: true,
        files: [
          { filename: 'package.json', content: '{}', type: 'json' as const },
          { filename: 'config.yaml', content: 'key: value', type: 'json' as const },
          { filename: 'README.md', content: 'text', type: 'json' as const },
        ],
      };
      expect(filterData(data)).toMatchInlineSnapshot(`
{
  "files": [],
  "yoRcBlank": true,
}
`);
    });

    it('should handle empty files array', () => {
      const data = {
        yoRcBlank: true,
        files: [],
      };
      expect(filterData(data)).toMatchInlineSnapshot(`
{
  "files": [],
  "yoRcBlank": true,
}
`);
    });

    it('should forbid .jhipster/package.json files', () => {
      const data = {
        yoRcBlank: true,
        files: [
          { filename: '.jhipster/User.json', content: '{}', type: 'json' as const },
          { filename: '.jhipster/package.json', content: '{}', type: 'json' as const },
          { filename: '.jhipster/Authority.json', content: '{}', type: 'json' as const },
        ],
      };
      expect(filterData(data)).toMatchInlineSnapshot(`
{
  "files": [
    {
      "content": "{}",
      "filename": ".jhipster/User.json",
      "type": "json",
    },
    {
      "content": "{}",
      "filename": ".jhipster/Authority.json",
      "type": "json",
    },
  ],
  "yoRcBlank": true,
}
`);
    });

    it('should preserve other properties in InfoData', () => {
      const data = {
        yoRcBlank: false,
        yoRcValid: true,
        yoRcContent: '{"generator-jhipster":{}}',
        jdlApplications: 2,
        files: [
          { filename: '.yo-rc.json', content: '{}', type: 'yo-rc' as const },
          { filename: 'other.json', content: '{}', type: 'json' as const },
        ],
      };
      expect(filterData(data)).toMatchInlineSnapshot(`
{
  "files": [
    {
      "content": "{}",
      "filename": ".yo-rc.json",
      "type": "yo-rc",
    },
  ],
  "jdlApplications": 2,
  "yoRcBlank": false,
  "yoRcContent": "{"generator-jhipster":{}}",
  "yoRcValid": true,
}
`);
    });
  });
});
