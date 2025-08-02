import { Duplex } from 'stream';
import { join } from 'path';
import { loadFile } from 'mem-fs';
import type { MemFsEditorFile } from 'mem-fs-editor';
import { Minimatch } from 'minimatch';
import { upperFirst } from 'lodash-es';
import { GENERATOR_JHIPSTER } from '../../generator-constants.js';
import { createImporterFromContent } from '../../../lib/jdl/jdl-importer.ts';
import { mergeYoRcContent } from '../../../lib/utils/yo-rc.ts';
import type { JDLApplicationConfig } from '../../../lib/jdl/core/types/parsing.js';

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
      throw new Error(`JDL stores supports only jdls  with 1 application, found ${applicationWithEntities.length}`);
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
