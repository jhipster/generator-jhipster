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
import { join } from 'node:path';
import { Readable } from 'node:stream';

import type { MemFsEditorFile } from 'mem-fs-editor';

import { buildJDLApplicationConfig } from '../../../lib/jdl-config/jhipster-jdl-config.ts';

import { importJDLTransform } from './import-jdl-transform.ts';

// A directory that does not exist: the transform reads nothing from the disk.
const destinationPath = join(import.meta.dirname, 'not-existing');
const jdlStorePath = join(destinationPath, 'app.jdl');

/** The `.yo-rc.json` the transform writes from a jdl store. */
const importYoRc = async (jdl: string, definitions: Omit<Parameters<typeof importJDLTransform>[0], 'destinationPath' | 'jdlStorePath'>) => {
  const jdlStore = { path: jdlStorePath, contents: Buffer.from(jdl) } as MemFsEditorFile;
  const files: MemFsEditorFile[] = await Readable.from([jdlStore])
    .compose(importJDLTransform({ destinationPath, jdlStorePath, ...definitions }))
    .toArray();
  const yoRc = files.find(file => file.path === join(destinationPath, '.yo-rc.json'))!;
  return JSON.parse(yoRc.contents!.toString());
};

describe('generator - jdl - importJDLTransform', () => {
  // The application definitions of a generator with one more option; `jdlDefinition`, application only, is deprecated.
  const application = buildJDLApplicationConfig({
    baseName: { description: 'Application name', jdl: { type: 'string', tokenType: 'NAME' }, scope: 'storage' },
    myOption: { description: 'My option', jdl: { type: 'boolean', tokenType: 'BOOLEAN' }, scope: 'storage' },
  });
  const jdl = 'application { config { baseName foo myOption true } }';

  it('rejects an option unknown to the JHipster definitions', async () => {
    await expect(importYoRc(jdl, {})).rejects.toThrow(/myOption/);
  });

  it('imports with the jdl definitions', async () => {
    expect(await importYoRc(jdl, { jdlDefinitions: { application } })).toMatchObject({
      'generator-jhipster': { baseName: 'foo', myOption: true },
    });
  });

  it('imports with the deprecated application definitions', async () => {
    expect(await importYoRc(jdl, { jdlDefinition: application })).toMatchObject({
      'generator-jhipster': { baseName: 'foo', myOption: true },
    });
  });
});
