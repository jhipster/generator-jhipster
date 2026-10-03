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

import type { ApplicationType } from '../core/application-types.ts';
import { createJDLRuntime, getDefaultRuntime } from '../jdl-config/jdl-runtime.ts';
import type { YoRcJHipsterContent } from '../jhipster/types/yo-rc.ts';
import { readCurrentPathYoRcFile, readEntityFile } from '../utils/yo-rc.ts';

import { type ImportTarget, type JDLFiles, checkSemanticErrors } from './convert-jdl-to-files.ts';
import { astToFiles } from './converters/ast-to-files/ast-to-files.ts';
import { applyCompatibilityDefaults } from './converters/ast-to-files/compatibility-defaults.ts';
import { applyStackConfig } from './converters/ast-to-files/stack-config.ts';
import { writeConfigFile } from './converters/exporters/export-utils.ts';
import type { JDLApplicationConfig, JDLDefinitions, JDLRuntime, ParsedJDLApplications } from './core/parsing/index.ts';
import { parseFromContent, parseFromFiles } from './core/readers/jdl-reader.ts';
import type { JDLJSONBlueprint, JDLJSONMicrofrontend, PostProcessedJDLJSONApplication } from './core/types/exporter.ts';
import type { JSONEntity } from './core/types/json-config.ts';
import { createFolderIfItDoesNotExist, doesFileExist } from './core/utils/file-utils.ts';

const GENERATOR_JHIPSTER = 'generator-jhipster'; // can't use the one of the generator as it circles

type JDLApplicationConfiguration = {
  applicationName?: string;
  applicationType?: ApplicationType;
  application?: {
    [GENERATOR_JHIPSTER]: {
      baseName?: string;
      applicationType?: ApplicationType;
    };
  };
  forSeveralApplications?: boolean;
  /**
   * Returns the deployments without writing their `.yo-rc.json` files, letting the caller write them through its
   * own file system. Deployment files are written to the disk otherwise.
   */
  skipDeploymentFileGeneration?: boolean;
};

/**
 * The definitions of an importer: the application options of a generator, the JHipster definitions completing the others;
 * or definitions, the JHipster ones completing those not passed.
 */
export type JDLImporterDefinitions = JDLApplicationConfig | Partial<JDLDefinitions>;

const getRuntime = (definitions?: JDLImporterDefinitions): JDLRuntime => {
  if (!definitions) return getDefaultRuntime();
  return createJDLRuntime('validatorConfig' in definitions ? { application: definitions } : definitions);
};

/**
 * Creates a new JDL importer from files.
 * There are two ways to create an importer:
 *   - By providing an existing application content, if there's one
 *   - Deprecated: providing some application options
 */
export function createImporterFromFiles(
  files: string[],
  configuration?: JDLApplicationConfiguration,
  definitions?: JDLImporterDefinitions,
) {
  if (!files) {
    throw new Error('Files must be passed to create a new JDL importer.');
  }
  const runtime = getRuntime(definitions);
  const content = parseFromFiles(files, runtime);
  return makeJDLImporter(content, configuration ?? {}, runtime);
}

/**
 * Creates a new JDL importer from a JDL string content.
 * There are two ways to create an importer:
 *   - By providing an existing application content, if there's one
 *   - Deprecated: providing some application options
 */
export function createImporterFromContent(
  jdlString: string,
  configuration?: JDLApplicationConfiguration,
  definitions?: JDLImporterDefinitions,
) {
  if (!jdlString) {
    throw new Error('A JDL content must be passed to create a new JDL importer.');
  }
  const runtime = getRuntime(definitions);
  const content = parseFromContent(jdlString, runtime);
  return makeJDLImporter(content, configuration ?? {}, runtime);
}

export type ApplicationWithEntities = {
  config: {
    blueprints?: JDLJSONBlueprint[];
    microfrontends?: JDLJSONMicrofrontend[];
  } & Record<string, any>;
  namespaceConfigs?: Record<string, Record<string, any>>;
  entities: JSONEntity[];
};

export type ImportState = {
  exportedApplications: PostProcessedJDLJSONApplication[];
  exportedApplicationsWithEntities: Record<string, ApplicationWithEntities>;
  exportedEntities: JSONEntity[];
  exportedDeployments: any[];
};

function makeJDLImporter(content: ParsedJDLApplications, configuration: JDLApplicationConfiguration, runtime: JDLRuntime) {
  return {
    /**
     * Processes JDL files and converts them to JSON.
     * @returns {object} the state of the process:
     *          - exportedDeployments: the exported deployments, or an empty list
     *          - exportedApplications: the exported applications, or an empty list
     *          - exportedEntities: the exported entities, or an empty list
     */
    import: (): ImportState => {
      checkSemanticErrors(content, runtime);
      const target = importTarget(content, configuration);
      const { files } = applyStackConfig(applyCompatibilityDefaults(astToFiles(content, runtime), target));
      return toImportState(files, content.applications.length > 1, configuration);
    },
  };
}

/** The application a jdl without application is imported into: the one passed, else the one of the current folder. */
function importTarget(content: ParsedJDLApplications, configuration: JDLApplicationConfiguration): ImportTarget {
  const application = configuration.application?.[GENERATOR_JHIPSTER];
  let applicationName = configuration.applicationName ?? application?.baseName;
  if (content.applications.length === 0 && content.entities.length > 0) {
    applicationName ??= readCurrentPathYoRcFile<{ baseName?: string }>()?.[GENERATOR_JHIPSTER]?.baseName;
    if (!applicationName) {
      // The message of the importer before.
      throw new Error("The JDL object and its application's name are mandatory.");
    }
  }
  return { applicationName, applicationType: configuration.applicationType ?? application?.applicationType };
}

/** An entity written before keeps its changelog date. */
function withExistingEntity(folder: string, entity: JSONEntity): JSONEntity {
  try {
    const fileOnDisk = readEntityFile<JSONEntity>(folder, entity.name);
    if (!entity.annotations?.changelogDate && fileOnDisk?.annotations?.changelogDate) {
      return { ...fileOnDisk, ...entity, annotations: { ...entity.annotations, changelogDate: fileOnDisk.annotations.changelogDate } };
    }
  } catch {
    // A new entity.
  }
  return entity;
}

/**
 * The state of the importer from the json files of the jdl; the deployment files are written, unless skipped.
 * @param severalApplications - whether the jdl declares several applications, whose entities are then in their folders.
 */
function toImportState(files: JDLFiles['files'], severalApplications: boolean, configuration: JDLApplicationConfiguration): ImportState {
  const importState: ImportState = {
    exportedApplications: [],
    exportedApplicationsWithEntities: {},
    exportedEntities: [],
    exportedDeployments: [],
  };
  const entitiesWithoutApplication: JSONEntity[] = [];
  for (const [path, content] of Object.entries(files)) {
    const [folder, ...rest] = path.split('/');
    if (folder === '.jhipster') {
      entitiesWithoutApplication.push(content as JSONEntity);
    } else if (content[GENERATOR_JHIPSTER]?.deploymentType) {
      if (!configuration.skipDeploymentFileGeneration) writeDeploymentFile(folder, content);
      importState.exportedDeployments.push(content);
    } else if (rest[0] === '.yo-rc.json') {
      const { [GENERATOR_JHIPSTER]: config, ...namespaceConfigs } = content;
      const namespaces = Object.keys(namespaceConfigs).length > 0 ? { namespaceConfigs } : {};
      importState.exportedApplications.push({ [GENERATOR_JHIPSTER]: config, ...namespaces });
      importState.exportedApplicationsWithEntities[config.baseName] = { config, ...namespaces, entities: [] };
    } else {
      const entity = withExistingEntity(severalApplications ? folder : '', content as JSONEntity);
      importState.exportedApplicationsWithEntities[folder].entities.push(entity);
      if (!importState.exportedEntities.some(({ name }) => name === entity.name)) {
        importState.exportedEntities.push(entity);
      }
    }
  }
  for (const entity of entitiesWithoutApplication) {
    importState.exportedEntities.push(withExistingEntity('', entity));
  }
  // The applications listing entities come first, as the importer listed them.
  const applicationsWithEntities = Object.entries(importState.exportedApplicationsWithEntities);
  const listsEntities = ([, { config }]: (typeof applicationsWithEntities)[number]) => config.entities?.length > 0;
  importState.exportedApplicationsWithEntities = Object.fromEntries([
    ...applicationsWithEntities.filter(application => listsEntities(application)),
    ...applicationsWithEntities.filter(application => !listsEntities(application)),
  ]);
  return importState;
}

/** Writes the `.yo-rc.json` of a deployment in the folder named after its type, merged with the one there. */
function writeDeploymentFile(folder: string, deployment: Record<string, any>) {
  if (doesFileExist(folder)) {
    throw new Error(`A file named '${folder}' already exists, so a folder of the same name can't be created for the application.`);
  }
  createFolderIfItDoesNotExist(folder);
  writeConfigFile(deployment as YoRcJHipsterContent, join(folder, '.yo-rc.json'));
}
