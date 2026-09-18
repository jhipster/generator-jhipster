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
import type CoreGenerator from '../../base-core/generator.ts';

type Choice = { value: string; name: string };

/** Used when the Bootswatch API cannot be reached, so the prompt still offers the known themes. */
const offlineThemes: Choice[] = [
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

/**
 * Bootswatch themes offered by the `clientTheme` prompt.
 * Vue uses Bootstrap 4, the other clients use Bootstrap 5.
 */
export const retrieveBootswatchThemes = async (generator: CoreGenerator, clientFramework?: string): Promise<Choice[]> => {
  try {
    const response = await fetch(`https://bootswatch.com/api/${clientFramework === 'vue' ? '4' : '5'}.json`);
    const { themes } = (await response.json()) as { themes: { name: string }[] };
    return themes.map(theme => ({
      value: theme.name.toLowerCase(),
      name: theme.name,
    }));
  } catch (error) {
    generator.log.warn(error);

    return offlineThemes;
  }
};
