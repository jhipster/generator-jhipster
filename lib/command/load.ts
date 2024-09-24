import { upperFirst } from 'lodash-es';
import type { CommandConfigScope, JHipsterConfigs, JHispterChoices } from './types.js';

const prepareChoices = (key: string, choices: JHispterChoices) =>
  choices
    .map(choice => (typeof choice === 'string' ? { value: choice } : choice))
    .filter(choice => choice.value != null)
    .map(choice => ({ ...choice, choiceKey: `${key}${upperFirst(choice.value)}` }));

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
      key = key === 'serviceDiscoveryType' ? 'serviceDiscovery' : key;
      if (def.choices) {
        const choices = prepareChoices(key, def.choices);
        const hasConfiguredValue = configuredValue !== undefined && configuredValue !== null;
        for (const { choiceKey, value: choiceValue } of choices) {
          if (hasConfiguredValue) {
            templatesContext[choiceKey] = configuredValue === choiceValue;
          } else {
            templatesContext[choiceKey] = templatesContext[choiceKey] ?? undefined;
          }
        }
        templatesContext[`${key}Any`] = hasConfiguredValue ? configuredValue !== 'no' : undefined;
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
        for (const { choiceKey } of prepareChoices(key, def.choices)) {
          templatesContext[choiceKey] = templatesContext[choiceKey] ?? undefined;
        }
        templatesContext[`${key}Any`] = templatesContext[`${key}Any`] ?? undefined;
        if (key === 'serviceDiscoveryType') {
          key = 'serviceDiscovery';
          for (const { choiceKey } of prepareChoices(key, def.choices)) {
            templatesContext[choiceKey] = templatesContext[choiceKey] ?? undefined;
          }
          templatesContext[`${key}Any`] = templatesContext[`${key}Any`] ?? undefined;
        }
      }
    });
  }
}
