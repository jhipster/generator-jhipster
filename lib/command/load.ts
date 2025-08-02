import { applyDerivedProperty } from '../utils/derived-property.ts';
import type { CommandConfigScope, JHipsterConfigs } from './types.js';

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
