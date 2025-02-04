/**
 * Copyright 2013-2025 the original author or authors from the JHipster project.
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
import { asWriteFilesSection } from '../base-application/support/index.js';
import { LOCAL_BLUEPRINT_OPTION } from './constants.js';

export const files = asWriteFilesSection<any>({
  baseFiles: [
    {
      condition: ctx => !ctx[LOCAL_BLUEPRINT_OPTION],
      templates: [
        '.github/workflows/generator.yml',
        '.gitignore.jhi.blueprint',
        '.prettierignore.jhi.blueprint',
        { sourceFile: 'eslint.config.js.jhi.blueprint', destinationFile: ctx => `${ctx.eslintConfigFile}.jhi.blueprint` },
        'README.md',
        'tsconfig.json',
        'vitest.config.ts',
        'vitest.test-setup.ts',
        '.blueprint/cli/commands.mjs',
        '.blueprint/generate-sample/command.mjs',
        '.blueprint/generate-sample/generator.mjs',
        '.blueprint/generate-sample/index.mjs',
        // Always write cli for devBlueprint usage
        'cli/cli.cjs',
        { sourceFile: 'cli/cli-customizations.cjs', override: false },
      ],
    },
    {
      condition: ctx => !ctx[LOCAL_BLUEPRINT_OPTION] && ctx.githubWorkflows,
      templates: [
        '.blueprint/github-build-matrix/command.mjs',
        '.blueprint/github-build-matrix/generator.mjs',
        '.blueprint/github-build-matrix/generator.spec.mjs',
        '.blueprint/github-build-matrix/index.mjs',
      ],
    },
    {
      condition: ctx => !ctx[LOCAL_BLUEPRINT_OPTION] && ctx.githubWorkflows && !ctx.skipWorkflows,
      templates: ['.github/workflows/build-cache.yml', '.github/workflows/samples.yml'],
    },
    {
      condition: ctx => !ctx[LOCAL_BLUEPRINT_OPTION] && !ctx.sampleWritten,
      templates: ['.blueprint/generate-sample/templates/samples/sample.jdl'],
    },
    {
      condition: ctx => ctx.commands.length > 0,
      templates: ['cli/commands.cjs'],
    },
  ],
});

export const generatorFiles = asWriteFilesSection<any>({
  generator: [
    {
      path: 'generators/generator',
      to: ctx => `${ctx.application.blueprintsPath}${ctx.generator}`,
      templates: [
        { sourceFile: 'index.mjs', destinationFile: ctx => `index.${ctx.blueprintMjsExtension}` },
        {
          sourceFile: 'command.mjs',
          destinationFile: ctx => `command.${ctx.blueprintMjsExtension}`,
          override: data => !data.ignoreExistingGenerators,
        },
        {
          sourceFile: 'generator.mjs.jhi',
          destinationFile: ctx => `generator.${ctx.blueprintMjsExtension}.jhi`,
          override: data => !data.ignoreExistingGenerators,
        },
        {
          condition: data => !data.generator.startsWith('entity') && !data.application[LOCAL_BLUEPRINT_OPTION],
          sourceFile: 'generator.spec.mjs',
          destinationFile: data => `generator.spec.${data.blueprintMjsExtension}`,
          override: data => !data.ignoreExistingGenerators,
        },
      ],
    },
    {
      path: 'generators/generator',
      to: ctx => `${ctx.application.blueprintsPath}${ctx.generator}`,
      condition(ctx) {
        return !ctx.written && ctx.priorities.find(priority => priority.name === 'writing');
      },
      transform: false,
      templates: [
        {
          sourceFile: 'templates/template-file.ejs',
          destinationFile: ctx => `templates/template-file-${ctx.generator}.ejs`,
        },
      ],
    },
  ],
});
