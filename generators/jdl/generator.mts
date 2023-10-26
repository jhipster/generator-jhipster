/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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
import { extname } from 'path';
import { QueuedAdapter } from '@yeoman/adapter';
import * as _ from 'lodash-es';
import { create as createMemFs, type Store as MemFs } from 'mem-fs';
import { create as createMemFsEditor, type MemFsEditor } from 'mem-fs-editor';

import { readFile } from 'fs/promises';
import BaseGenerator from '../base/index.mjs';
import command from './command.mjs';
import { downloadJdlFile } from '../../cli/download.mjs';
import EnvironmentBuilder from '../../cli/environment-builder.mjs';
import { CLI_NAME } from '../../cli/utils.mjs';
import { GENERATOR_APP, GENERATOR_ENTITIES, GENERATOR_WORKSPACES } from '../generator-list.mjs';
import { ApplicationWithEntities, createImporterFromContent } from '../../jdl/jdl-importer.js';
import { GENERATOR_JHIPSTER, JHIPSTER_CONFIG_DIR } from '../generator-constants.mjs';
import statistics from '../statistics.mjs';
import { addApplicationIndex, allNewApplications, customizeForMicroservices } from './internal/index.mjs';
import { mergeYoRcContent } from '../../jdl/index.js';
import { normalizeBlueprintName } from '../base/internal/blueprint.mjs';

const { upperFirst } = _;

/**
 * Add jdl extension to the file
 */
const toJdlFile = file => {
  if (!extname(file)) {
    return `${file}.jdl`;
  }
  return file;
};

type ApplicationWithEntitiesAndPath = ApplicationWithEntities & { folder?: string; sharedFs?: MemFs };

export default class JdlGenerator extends BaseGenerator {
  jdlFiles?: string[];
  inline?: string;
  jdlContents: string[] = [];

  interactive?: boolean;
  jsonOnly?: boolean;
  ignoreApplication?: boolean;
  ignoreDeployments?: boolean;
  skipSampleRepository?: boolean;
  force?: boolean;
  reproducible?: boolean;
  createEnvBuilder = EnvironmentBuilder.createDefaultBuilder;
  existingProject?: boolean;

  applications!: ApplicationWithEntitiesAndPath[];
  exportedApplicationsWithEntities!: Record<string, ApplicationWithEntities>;
  exportedEntities!: any[];
  exportedDeployments!: any[];

  async beforeQueue() {
    if (!this.fromBlueprint) {
      await this.composeWithBlueprints('jdl');
    }
  }

  get initializing() {
    return this.asInitializingTaskGroup({
      loadArguments() {
        this.parseJHipsterArguments(command.arguments);
        if (this.jdlFiles) {
          this.log.verboseInfo('Generating jdls', ...this.jdlFiles);
        }
      },
      loadOptions() {
        this.parseJHipsterOptions(command.options);
      },
      existingProject() {
        this.existingProject = this.jhipsterConfig.baseName !== undefined && (this.config as any).existed;
      },
      checkOptions() {
        if (!this.inline && !this.jdlFiles?.length) {
          throw new Error('At least one jdl file is required.');
        }
      },
    });
  }

  get [BaseGenerator.INITIALIZING]() {
    return this.delegateTasksToBlueprint(() => this.initializing);
  }

  get loading() {
    return this.asLoadingTaskGroup({
      async downloadJdlFiles() {
        if (this.jdlFiles) {
          this.jdlFiles = await Promise.all(
            this.jdlFiles.map(toJdlFile).map(async filename => {
              try {
                this.readDestination(filename);
              } catch {
                this.log.warn(`File not found: ${filename}. Attempting download from jdl-samples repository`);
                const downloadedFile = await downloadJdlFile(filename, { skipSampleRepository: this.skipSampleRepository });
                // The file has null content at mem-fs, update with actual content.
                this.writeDestination(downloadedFile, (await readFile(downloadedFile)).toString());
                return downloadedFile;
              }
              return filename;
            }),
          );
        }
      },
      readJdlFiles() {
        if (this.inline) {
          this.jdlContents.push(this.inline);
        }
        for (const jdlFile of this.jdlFiles ?? []) {
          this.jdlContents.push(this.readDestination(jdlFile)?.toString() ?? '');
        }
      },
    });
  }

  get [BaseGenerator.LOADING]() {
    return this.delegateTasksToBlueprint(() => this.loading);
  }

  get default() {
    return this.asDefaultTaskGroup({
      insight() {
        statistics.sendSubGenEvent('generator', 'import-jdl');
      },
      async parseJDL() {
        const configuration = {
          applicationName: this.options.baseName ?? (this.existingProject ? this.jhipsterConfig.baseName : undefined),
          databaseType: this.options.db ?? (this.existingProject ? this.jhipsterConfigWithDefaults.prodDatabaseType : undefined),
          applicationType: this.options.applicationType,
          skipUserManagement: this.options.skipUserManagement,
        };

        const importer = createImporterFromContent(this.jdlContents.join('\n'), configuration);

        const importState = importer.import();

        this.exportedDeployments = importState.exportedDeployments;
        this.exportedEntities = importState.exportedEntities;
        this.exportedApplicationsWithEntities = importState.exportedApplicationsWithEntities;

        const applicationsWithEntities = Object.values(importState.exportedApplicationsWithEntities);
        this.applications =
          applicationsWithEntities.length === 1
            ? applicationsWithEntities
            : [
                ...applicationsWithEntities.filter((app: ApplicationWithEntitiesAndPath) => app.config.applicationType === 'gateway'),
                ...applicationsWithEntities.filter((app: ApplicationWithEntitiesAndPath) => app.config.applicationType !== 'gateway'),
              ];
      },
      customizeApplication() {
        for (const app of this.applications) {
          app.config.entities = app.entities.map(entity => entity.name);
        }
        if (this.applications.length > 1) {
          for (const app of this.applications) {
            app.folder = app.config.baseName;
            if (!this.interactive && !this.jsonOnly && !this.ignoreApplication) {
              app.sharedFs = createMemFs();
            }
          }
        }
        addApplicationIndex(this.applications);
        customizeForMicroservices(this.exportedApplicationsWithEntities);
      },
      configure() {
        const nrApplications = this.applications.length;
        const allNew = allNewApplications(this.applications);
        const interactiveFallback = !allNew;

        this.interactive = this.interactive ?? interactiveFallback;
        this.force = this.options.force ?? (nrApplications > 0 && allNew) ? true : undefined;
        this.reproducible = allNew;
      },
      generateJson() {
        if (this.applications.length === 0) {
          this.writeConfig({ entities: this.exportedEntities });
        } else {
          this.writeConfig(...this.applications.map(app => (this.ignoreApplication ? { ...app, config: undefined } : app)));
        }
      },
      async generate() {
        if (this.jsonOnly) {
          return;
        }

        const generatorOptions: any = { defaults: true, reproducible: this.reproducible, force: this.force };

        if (this.ignoreApplication || this.applications.length === 0) {
          if (this.applications.length === 0) {
            const entities = this.exportedEntities;
            await this.composeWithJHipster(GENERATOR_ENTITIES, {
              generatorArgs: entities.map(entity => entity.name),
              generatorOptions,
            });
          } else {
            for (const app of this.applications) {
              await this.composeWithJHipster(GENERATOR_ENTITIES, {
                generatorArgs: app.entities.map(entity => entity.name),
                generatorOptions: {
                  ...generatorOptions,
                  destinationRoot: app.folder ? this.destinationPath(app.folder) : undefined,
                },
              });
            }
          }
        } else if (this.applications.length === 1) {
          this.log.info('Generating 1 application');
          await this.composeWithJHipster(GENERATOR_APP, { generatorOptions });
        } else {
          this.log.info(`Generating ${this.applications.length} applications`);
          await this.composeWithJHipster(GENERATOR_WORKSPACES, {
            generatorOptions: {
              workspacesFolders: this.applications.map(app => app.folder),
              generateApplications: async () => this.runNonInteractive(this.applications, generatorOptions),
            } as any,
          });
        }
      },
    });
  }

  get [BaseGenerator.DEFAULT]() {
    return this.delegateTasksToBlueprint(() => this.default);
  }

  get end() {
    return this.asEndTaskGroup({
      async generateDeployments() {
        if (!this.exportedDeployments || this.exportedDeployments.length === 0) {
          this.log.info('No deployment configured');
          return;
        }
        if (this.ignoreDeployments) {
          this.log.info(`Ignoring ${this.exportedDeployments.length} deployments`);
          return;
        }

        this.log.info(`Generating ${this.exportedDeployments.length} deployments`);
        for (const deployment of this.exportedDeployments) {
          const deploymentConfig = deployment[GENERATOR_JHIPSTER];
          const deploymentType = deploymentConfig.deploymentType;
          this.log.debug(`Generating deployment: ${JSON.stringify(deploymentConfig, null, 2)}`);

          await this.composeWithJHipster(deploymentType, {
            generatorOptions: {
              destinationRoot: this.destinationPath(deploymentType),
              force: true,
              skipPrompts: true,
            } as any,
          });
        }
      },
    });
  }

  get [BaseGenerator.END]() {
    return this.delegateTasksToBlueprint(() => this.end);
  }

  async runNonInteractive(applications: ApplicationWithEntitiesAndPath[], options) {
    await Promise.all(
      applications.map(async application => {
        const rootCwd = this.destinationPath();
        const cwd = application.folder ? this.destinationPath(application.folder) : rootCwd;
        const adapter = (this.env.adapter as QueuedAdapter).newAdapter();
        const envOptions: any = { cwd, logCwd: rootCwd, sharedFs: application.sharedFs, adapter };
        const generatorOptions = { ...this.options, ...options, skipPriorities: ['prompting'] };

        // We should not reuse sharedData at non interactive runs
        delete generatorOptions.sharedData;

        // Install should happen at the root of the monorepository. Force skip install at childs.
        if (this.options.monorepository) {
          generatorOptions.skipInstall = true;
        }
        const envBuilder = await this.createEnvBuilder(envOptions);
        const env = envBuilder.getEnvironment();
        await env.run([`${CLI_NAME}:${GENERATOR_APP}`], generatorOptions);
      }),
    );
  }

  writeConfig(...applications: Partial<ApplicationWithEntitiesAndPath>[]) {
    for (const application of applications) {
      const { folder = '', entities = [], sharedFs } = application;
      let { config, namespaceConfigs } = application;

      const appPath = folder ? `${folder}/` : folder;
      const fs: MemFsEditor = sharedFs ? createMemFsEditor(sharedFs) : this.fs;
      if (config) {
        const configFile = this.destinationPath(`${appPath}.yo-rc.json`);
        const oldConfig: any = fs.readJSON(configFile, {});
        if (Array.isArray(config.blueprints)) {
          config = {
            ...config,
            blueprints: config.blueprints.map(({ name, ...remaining }) => ({ ...remaining, name: normalizeBlueprintName(name) })),
          };
        }
        if (namespaceConfigs) {
          namespaceConfigs = Object.fromEntries(
            Object.entries(namespaceConfigs).map(([ns, config]) => [normalizeBlueprintName(ns), config]),
          );
        }

        fs.writeJSON(configFile, mergeYoRcContent(oldConfig, { ...namespaceConfigs, [GENERATOR_JHIPSTER]: config }));
      }
      for (const entity of entities) {
        const configFile = this.destinationPath(`${appPath}${JHIPSTER_CONFIG_DIR}/${upperFirst(entity.name)}.json`);
        const oldConfig: any = fs.readJSON(configFile, {});
        fs.writeJSON(configFile, { ...oldConfig, ...entity });
      }
    }
  }
}
