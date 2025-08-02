import { describe, expect } from 'esmocha';
import { readFile } from 'fs/promises';

import { getPackageRoot } from '../../../lib/index.ts';
import { YO_RC_FILE } from '../../generator-constants.js';

import { extractDataFromInfo } from './extract-info.ts';
import { markdownDetails } from './markdown-content.ts';

describe('extract-info', () => {
  it('should extract empty object from the jhipster info template', async () => {
    await expect(extractDataFromInfo((await readFile(getPackageRoot('.github/ISSUE_TEMPLATE/BUG_REPORT.md'))).toString()))
      .toMatchInlineSnapshot(`
{
  "files": [],
  "yoRcBlank": true,
}
`);
  });

  it('should extract info from jhipster info', async () => {
    await expect(
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

  it('should extract info from jhipster info with 2 .yo-rc files', async () => {
    await expect(
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
    {
      "content": "{ "generator-jhipster": { "clientFramework": "angular" } }",
      "filename": "app/.yo-rc.json",
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
    await expect(extractDataFromInfo((await readFile(getPackageRoot('.github/ISSUE_TEMPLATE/BUG_REPORT_JDL.md'))).toString()))
      .toMatchInlineSnapshot(`
{
  "files": [],
  "yoRcBlank": true,
}
`);
  });

  it('should extract empty from non-jdl JDL definitions', async () => {
    await expect(extractDataFromInfo(markdownDetails({ title: 'JDL definitions', content: 'foo' }))).toMatchInlineSnapshot(`
{
  "files": [],
  "yoRcBlank": true,
}
`);
  });

  it('should extract application from JDL definitions', async () => {
    await expect(extractDataFromInfo(markdownDetails({ title: 'JDL definitions', content: 'application { config {} }' })))
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

  it('should extract more than one application from JDL definitions', async () => {
    await expect(
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
