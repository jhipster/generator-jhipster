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

import { join } from 'node:path';
import { Duplex } from 'node:stream';

import { upperFirst } from 'lodash-es';
import { loadFile } from 'mem-fs';
import type { MemFsEditorFile } from 'mem-fs-editor';
import { Minimatch } from 'minimatch';

import type { JDLApplicationConfig } from '../../../lib/jdl/core/types/parsing.ts';
import { createImporterFromContent } from '../../../lib/jdl/jdl-importer.ts';
import { mergeYoRcContent } from '../../../lib/utils/yo-rc.ts';
import { GENERATOR_JHIPSTER } from '../../generator-constants.ts';

export const importJDLTransform = ({
  destinationPath,
  jdlStorePath,
  jdlDefinition,
}: {
  destinationPath: string;
  jdlStorePath: string;
  jdlDefinition: JDLApplicationConfig;
}) =>
  Duplex.from(async function* (files: AsyncGenerator<MemFsEditorFile>) {
    const yoRcFilePath = join(destinationPath, '.yo-rc.json');
    const entitiesFolder = join(destinationPath, '.jhipster');
    const entitiesMatcher = new Minimatch(`${entitiesFolder}/*.json`);
    const entityFields: MemFsEditorFile[] = [];

    let jdlStoreFileInMemory: MemFsEditorFile | undefined;
    let yoRcFileInMemory: MemFsEditorFile | undefined;

    for await (const file of files) {
      if (file.path === jdlStorePath) {
        jdlStoreFileInMemory = file;
        yield jdlStoreFileInMemory;
      } else if (file.path === yoRcFilePath) {
        yoRcFileInMemory = file;
      } else if (entitiesMatcher.match(file.path)) {
        entityFields.push(file);
      } else {
        yield file;
      }
    }

    const jdlStoreContents = jdlStoreFileInMemory?.contents ?? (loadFile(jdlStorePath) as any).contents;
    if (!jdlStoreContents) {
      if (yoRcFileInMemory) {
        yield yoRcFileInMemory;
      }
      for (const file of entityFields) {
        yield file;
      }
      return;
    }
    if (entityFields.length > 0) {
      throw new Error('Entities configuration files are not supported by jdlStore');
    }
    const importer = createImporterFromContent(jdlStoreContents.toString(), undefined, jdlDefinition);
    const importState = importer.import();
    const applicationWithEntities = Object.values(importState.exportedApplicationsWithEntities);
    if (applicationWithEntities.length !== 1) {
      throw new Error(`JDL store supports only jdls with 1 application, found ${applicationWithEntities.length}`);
    }

    const { config, namespaceConfigs, entities } = applicationWithEntities[0];
    const yoRcFile = loadFile(yoRcFilePath) as MemFsEditorFile;
    const yoRcContents = yoRcFileInMemory?.contents ?? yoRcFile.contents;

    yoRcFile.contents = Buffer.from(
      JSON.stringify(
        mergeYoRcContent(yoRcContents ? JSON.parse(yoRcContents.toString()) : {}, {
          ...namespaceConfigs,
          [GENERATOR_JHIPSTER]: config,
        }),
        null,
        2,
      ),
    );

    yield yoRcFile;

    for (const entity of entities) {
      const configFile = join(entitiesFolder, `${upperFirst(entity.name)}.json`);
      const file = loadFile(configFile) as MemFsEditorFile;
      file.contents = Buffer.from(JSON.stringify(entity, null, 2));
      yield file;
    }
  });
