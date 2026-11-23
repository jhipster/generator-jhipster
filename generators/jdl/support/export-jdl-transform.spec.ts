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
import { join } from 'node:path';
import { Readable } from 'node:stream';

import type { MemFsEditorFile } from 'mem-fs-editor';

import { exportJDLTransform } from './export-jdl-transform.ts';
import { importJDLTransform } from './import-jdl-transform.ts';

// A directory that does not exist: the transforms read nothing from the disk.
const destinationPath = join(import.meta.dirname, 'not-existing');
const jdlStorePath = join(destinationPath, 'app.jdl');
const yoRcPath = join(destinationPath, '.yo-rc.json');

const toFile = (path: string, contents: string) => ({ path, contents: Buffer.from(contents) }) as MemFsEditorFile;

/** The `.yo-rc.json` after a generation with a jdl store: exported to the jdl store, then imported from it. */
const roundTrip = async (yoRc: Record<string, unknown>) => {
  const exported: MemFsEditorFile[] = await Readable.from([toFile(yoRcPath, JSON.stringify(yoRc))])
    .compose(exportJDLTransform({ destinationPath, jdlStorePath }))
    .toArray();
  const imported: MemFsEditorFile[] = await Readable.from(exported)
    .compose(importJDLTransform({ destinationPath, jdlStorePath }))
    .toArray();
  return JSON.parse(imported.find(file => file.path === yoRcPath)!.contents!.toString());
};

describe('generator - jdl - exportJDLTransform', () => {
  const application = { jdlStore: 'app.jdl', baseName: 'jhipster', jhipsterVersion: '9.4.0' };

  it('keeps an application option', async () => {
    expect(await roundTrip({ 'generator-jhipster': application })).toMatchObject({
      'generator-jhipster': { baseName: 'jhipster', jhipsterVersion: '9.4.0' },
    });
  });

  it('keeps the config of a blueprint', async () => {
    const blueprintConfig = { myRecord: 'value', myObject: { nested: true } };
    expect(await roundTrip({ 'generator-jhipster': application, 'generator-jhipster-foo': blueprintConfig })).toMatchObject({
      'generator-jhipster': { baseName: 'jhipster' },
      'generator-jhipster-foo': blueprintConfig,
    });
  });
});
