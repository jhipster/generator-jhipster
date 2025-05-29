import { applyDerivedProperty } from '../utils/derived-property.js';
import type { CommandConfigScope, JHipsterConfigs } from './types.js';
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
const filteredScopeEntries = (commandsConfigs: JHipsterConfigs, scopes: CommandConfigScope[]) =>
  Object.entries(commandsConfigs).filter(([_key, def]) => scopes.includes(def.scope!));

function loadConfigIntoContext<Context>(
  this: Context,
  options: {
    applyDefaults?: boolean;
    source?: Record<string, any>;
    templatesContext: Record<string, any>;
    commandsConfigs: JHipsterConfigs;
    scopes: CommandConfigScope[];
  },
): void {
  const { applyDefaults, source, templatesContext, commandsConfigs, scopes = ['storage', 'blueprint'] } = options;
  if (commandsConfigs) {
    filteredScopeEntries(commandsConfigs, scopes).forEach(([key, def]) => {
      let configuredValue = source?.[key] ?? templatesContext[key];
      if (applyDefaults && def.default !== undefined && (configuredValue === undefined || configuredValue === null)) {
        if (typeof def.default === 'function') {
          configuredValue = def.default.call(this, source);
        } else {
          configuredValue = def.default;
        }
      }
      templatesContext[key] = configuredValue;
      if (def.choices) {
        applyDerivedProperty(templatesContext, key, def.choices, { addAny: true });
        if (key === 'serviceDiscoveryType') {
          templatesContext.serviceDiscovery = templatesContext.serviceDiscoveryType;
          applyDerivedProperty(templatesContext, 'serviceDiscovery', def.choices, { addAny: true });
        }
      }
    });
  }
}

export function loadCommandConfigsIntoApplication<Context>(
  this: Context,
  options: {
    source: Record<string, any>;
    application: Record<string, any>;
    commandsConfigs: JHipsterConfigs;
  },
): void {
  const { application, commandsConfigs, source } = options;
  loadConfigIntoContext.call(this, {
    source,
    templatesContext: application,
    commandsConfigs,
    scopes: ['storage', 'blueprint'],
  });
}

export function loadCommandConfigsIntoGenerator<Context>(
  this: Context,
  options: {
    commandsConfigs: JHipsterConfigs;
  },
): void {
  const { commandsConfigs } = options;
  loadConfigIntoContext.call(this, {
    source: (this as any).options,
    templatesContext: this as any,
    commandsConfigs,
    scopes: ['storage', 'blueprint'],
  });
}

export function loadCommandConfigsKeysIntoTemplatesContext<Context>(
  this: Context,
  options: {
    templatesContext: Record<string, any>;
    commandsConfigs: JHipsterConfigs;
    scopes?: CommandConfigScope[];
  },
): void {
  const { templatesContext, commandsConfigs, scopes = ['storage', 'blueprint'] } = options;
  if (commandsConfigs) {
    filteredScopeEntries(commandsConfigs, scopes).forEach(([key, def]) => {
      templatesContext[key] = templatesContext[key] ?? undefined;
      if (def.choices) {
        applyDerivedProperty(templatesContext, key, def.choices, { addAny: true });
        if (key === 'serviceDiscoveryType') {
          templatesContext.serviceDiscovery = templatesContext.serviceDiscoveryType;
          applyDerivedProperty(templatesContext, 'serviceDiscovery', def.choices, { addAny: true });
        }
      }
    });
  }
}
