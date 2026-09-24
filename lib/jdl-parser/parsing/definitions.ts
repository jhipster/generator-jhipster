/**
 * Copyright 2013-2026 the original author or authors from the JHipster project.
 * Licensed under the Apache License, Version 2.0.
 */
import type { JDLApplicationConfig, JDLOptionsDefinition } from '../types/parsing.ts';

/** Definitions may retain legacy validator keys without making the lexer know option names. */
export const findConfigValidation = (config: JDLApplicationConfig, name: string) => {
  const legacyName = config.tokenConfigs?.find(token => token.pattern === name)?.name;
  const upperSnakeCase = name
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
  for (const key of [name, legacyName, upperSnakeCase]) {
    if (key !== undefined && Object.hasOwn(config.validatorConfig, key)) return config.validatorConfig[key];
  }
  return undefined;
};

/** Match a canonical name, a custom statement keyword or one of its deprecated aliases. */
export const findOptionDefinition = (definition: JDLOptionsDefinition, keyword: string) =>
  Object.entries(definition.configs).find(
    ([name, { jdl }]) => (jdl.keyword ?? name) === keyword || jdl.deprecatedKeywords?.includes(keyword),
  );
