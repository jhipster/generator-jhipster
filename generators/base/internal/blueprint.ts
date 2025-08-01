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
import { requireNamespace } from '@yeoman/namespace';

type Blueprint = {
  name: string;
  version?: string;
};

/**
 * @private
 * Splits and normalizes a comma separated list of blueprint names with optional versions.
 * @param {string|any[]} [blueprints] - comma separated list of blueprint names, e.g kotlin,vuewjs@1.0.1. If an array then
 * no processing is performed and it is returned as is.
 * @returns {Array} an array that contains the info for each blueprint
 */
export function parseBlueprints(blueprints?: string | Blueprint[]) {
  if (Array.isArray(blueprints)) {
    return blueprints;
  }
  if (typeof blueprints === 'string') {
    return blueprints
      .split(',')
      .filter(el => el != null && el.length > 0)
      .map(blueprint => parseBlueprintInfo(blueprint));
  }
  return [];
}

/**
 * @private
 * Merges blueprint arrays, keeping order and version priority.
 * @param {...Blueprint[]} [blueprintsToMerge] - Blueprint arrays to be merged.
 * @returns {Blueprint[]} an array that contains the info for each blueprint
 */
export function mergeBlueprints(...blueprintsToMerge: Blueprint[][]): Blueprint[] {
  if (!blueprintsToMerge || blueprintsToMerge.length === 0) {
    return [];
  }
  blueprintsToMerge.forEach(blueprints => {
    if (!Array.isArray(blueprints)) {
      throw new Error('Only arrays are supported.');
    }
  });
  return removeBlueprintDuplicates(blueprintsToMerge.flat());
}

/**
 * @private
 * Remove duplicate blueprints, keeping order and version priority.
 * @param {Blueprint[]} blueprints - Blueprint arrays to be merged.
 * @returns {Blueprint[]} an array that contains the info for each blueprint
 */
export function removeBlueprintDuplicates(blueprints: Blueprint[]): Blueprint[] {
  const uniqueBlueprints = new Map();
  blueprints.forEach(blueprintToAdd => {
    if (uniqueBlueprints.get(blueprintToAdd.name) === undefined) {
      uniqueBlueprints.set(blueprintToAdd.name, blueprintToAdd.version);
    }
  });
  return [...uniqueBlueprints].map(([name, version]) => {
    if (version === undefined) return { name };
    return { name, version };
  });
}

/**
 * @private
 * Normalize blueprint name if needed and also extracts version if defined. If no version is defined then `latest`
 * is used by default.
 * @param {string} blueprint - name of the blueprint and optionally a version, e.g kotlin[@0.8.1]
 * @returns {object} containing the name and version of the blueprint
 */
export function parseBlueprintInfo(blueprint: string): Blueprint {
  let bpName = normalizeBlueprintName(blueprint);
  const idx = bpName.lastIndexOf('@');
  if (idx > 0) {
    // Not scope.
    const version = bpName.slice(idx + 1);
    bpName = bpName.slice(0, idx);
    return {
      name: bpName,
      version,
    };
  }
  return {
    name: bpName,
  };
}

/**
 * @private
 * Normalize blueprint name: prepend 'generator-jhipster-' if needed
 * @param {string} blueprint - name of the blueprint
 * @returns {string} the normalized blueprint name
 */
export function normalizeBlueprintName(blueprint: string): string {
  try {
    const ns = requireNamespace(blueprint);
    if (ns.unscoped.startsWith('generator-jhipster-')) {
      return ns.toString();
    }
    return ns.with({ unscoped: `generator-jhipster-${ns.unscoped}` }).toString();
    // eslint-disable-next-line no-empty
  } catch {}
  if (blueprint?.startsWith('@')) {
    return blueprint;
  }
  if (blueprint && !blueprint.startsWith('generator-jhipster')) {
    return `generator-jhipster-${blueprint}`;
  }
  return blueprint;
}
