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
const stripTemplateLiteral = (value: string): string => (typeof value === 'string' ? value.replace(/\$\{[^}]*\}/g, '') : value);

type Cleanups = Record<string, { oldValue: string; newValue: string }>;

export const sanitizeConfigForNodeApplications = (
  object: any,
  { depth = 0, keyPath }: { depth?: number; keyPath?: string } = {},
): Cleanups => {
  const cleanups: Cleanups = {};
  const descriptors = Object.getOwnPropertyDescriptors(object);
  for (const [key, desc] of Object.entries(descriptors)) {
    const nextKeyPath = `${keyPath ? `${keyPath}.` : ''}${key}`;
    if (typeof desc.value === 'string' && desc.writable) {
      const newValue = stripTemplateLiteral(desc.value);
      if (newValue !== desc.value) {
        cleanups[nextKeyPath] = { oldValue: desc.value, newValue };
        object[key] = newValue;
      }
    }
    if (depth !== 0 && typeof desc.value === 'object' && desc.value !== null) {
      const opts = { depth: depth - 1, keyPath: nextKeyPath } as const;
      if (Array.isArray(desc.value)) {
        for (const item of desc.value.filter(i => typeof i === 'object' && i !== null)) {
          Object.assign(cleanups, sanitizeConfigForNodeApplications(item, opts));
        }
      } else {
        Object.assign(cleanups, sanitizeConfigForNodeApplications(desc.value, opts));
      }
    }
  }
  return cleanups;
};
