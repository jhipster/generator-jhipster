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
import type { JHipsterCommandDefinition } from '../../lib/command/index.ts';

/** What the Elasticsearch prompt reads from the heroku generator, set at its initializing priority. */
type HerokuPromptContext = {
  hasHerokuCli: boolean;
  herokuAppExists: boolean;
  herokuElasticsearchPrice: string;
  jhipsterConfigWithDefaults: { searchEngine?: string };
};

const command = {
  configs: {
    skipBuild: {
      description: 'Skips building the application',
      cli: {
        type: Boolean,
      },
      scope: 'none',
    },
    skipDeploy: {
      description: 'Skips deployment to Heroku',
      cli: {
        type: Boolean,
      },
      scope: 'none',
    },
    herokuElasticsearch: {
      description: "Elasticsearch of an app that uses it: your own cluster (external) or Elastic's paid Heroku add-on (foundelasticsearch)",
      cli: {
        type: String,
      },
      prompt: gen => {
        const { hasHerokuCli, herokuAppExists, herokuElasticsearchPrice, jhipsterConfigWithDefaults } =
          gen as unknown as HerokuPromptContext;
        return {
          when: () => hasHerokuCli && !herokuAppExists && jhipsterConfigWithDefaults.searchEngine === 'elasticsearch',
          type: 'select',
          message: 'Which Elasticsearch should the app use?',
          choices: [
            { value: 'external', name: 'My own Elasticsearch, configured after the deployment' },
            // Elastic's add-on is the only Heroku add-on that runs Elasticsearch 9, and it has no free plan
            { value: 'foundelasticsearch', name: `Elastic's Heroku add-on (foundelasticsearch, paid${herokuElasticsearchPrice})` },
          ],
          default: 'external',
        };
      },
      choices: ['external', 'foundelasticsearch'],
      scope: 'storage',
    },
  },
} as const satisfies JHipsterCommandDefinition;

export default command;
