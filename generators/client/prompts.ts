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
import { asPromptingTask } from '../base-application/support/task-type-inference.ts';
import type CoreGenerator from '../base-core/generator.ts';

import type ClientGenerator from './generator.ts';

type Choice = { value: string; name: string };

export const askForClientTheme = asPromptingTask(async function askForClientTheme(this: ClientGenerator, { control }) {
  if (control.existingProject && !this.options.askAnswered) return;

  const config = this.jhipsterConfigWithDefaults;
  const { clientFramework } = config;

  await this.prompt(
    {
      type: 'select',
      name: 'clientTheme',
      when: () => ['angular', 'react', 'vue'].includes(clientFramework!),
      message: 'Would you like to use a Bootswatch theme (https://bootswatch.com/)?',
      choices: async () => {
        const bootswatchChoices = await retrieveBootswatchThemes.call(this, { clientFramework });
        return [
          {
            value: 'none',
            name: 'Default JHipster',
          },
          ...bootswatchChoices,
        ];
      },
      default: config.clientTheme,
    },
    this.config,
  );
});

export const askForClientThemeVariant = asPromptingTask(async function askForClientThemeVariant(this: ClientGenerator, { control }) {
  if (control.existingProject && !this.options.askAnswered) return;
  if ((this.jhipsterConfig.clientTheme ?? 'none') === 'none') {
    return;
  }

  const config = this.jhipsterConfigWithDefaults;
  await this.prompt(
    {
      type: 'select',
      name: 'clientThemeVariant',
      when: () => !this.jhipsterConfig.skipClient,
      message: 'Choose a Bootswatch variant navbar theme (https://bootswatch.com/)?',
      choices: [
        { value: 'primary', name: 'Primary' },
        { value: 'dark', name: 'Dark' },
        { value: 'light', name: 'Light' },
      ],
      default: config.clientThemeVariant,
    },
    this.config,
  );
});

async function retrieveBootswatchThemes(this: CoreGenerator, { clientFramework }: { clientFramework?: string }): Promise<Choice[]> {
  try {
    const response = await fetch(`https://bootswatch.com/api/${clientFramework === 'vue' ? '4' : '5'}.json`);
    const { themes } = (await response.json()) as { themes: { name: string }[] };
    return themes.map(theme => ({
      value: theme.name.toLowerCase(),
      name: theme.name,
    }));
  } catch (error) {
    this.log.warn(error);

    return [
      { value: 'cerulean', name: 'Cerulean' },
      { value: 'cosmo', name: 'Cosmo' },
      { value: 'cyborg', name: 'Cyborg' },
      { value: 'darkly', name: 'Darkly' },
      { value: 'flatly', name: 'Flatly' },
      { value: 'journal', name: 'Journal' },
      { value: 'litera', name: 'Litera' },
      { value: 'lumen', name: 'Lumen' },
      { value: 'lux', name: 'Lux' },
      { value: 'materia', name: 'Materia' },
      { value: 'minty', name: 'Minty' },
      { value: 'morph', name: 'Morph' },
      { value: 'pulse', name: 'Pulse' },
      { value: 'quartz', name: 'Quartz' },
      { value: 'sandstone', name: 'Sandstone' },
      { value: 'simplex', name: 'Simplex' },
      { value: 'sketchy', name: 'Sketchy' },
      { value: 'slate', name: 'Slate' },
      { value: 'solar', name: 'Solar' },
      { value: 'spacelab', name: 'Spacelab' },
      { value: 'superhero', name: 'Superhero' },
      { value: 'united', name: 'United' },
      { value: 'vapor', name: 'Vapor' },
      { value: 'yeti', name: 'Yeti' },
      { value: 'zephyr', name: 'Zephyr' },
    ];
  }
}
