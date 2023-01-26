/**
 * Copyright 2013-2023 the original author or authors from the JHipster project.
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

import logger from './objects/logger.js';

/**
 * Displays a deprecation message,for objects.
 * @param deprecationNoticeObject The configuration
 */
export function displayObjectDeprecationMessage({
  deprecatedObject,
  preferredObject,
}: {
  deprecatedObject: string;
  preferredObject: string;
}) {
  logger.warn(getDeprecationMessage(deprecatedObject, preferredObject, 'object'));
}

/**
 * Displays a deprecation message, for methods.
 * @param deprecationNoticeObject The configuration
 */
export function displayMethodDeprecationMessage({
  deprecatedMethod,
  preferredMethod,
}: {
  deprecatedMethod: string;
  preferredMethod: string;
}) {
  logger.warn(getDeprecationMessage(deprecatedMethod, preferredMethod, 'method'));
}

function getDeprecationMessage(deprecated: string, preferred: string, targetType: string) {
  const firstPart = `The ${targetType} '${deprecated}' is deprecated and will be removed in the next major release.`;
  if (!preferred) {
    return firstPart;
  }
  return `${firstPart} Please use '${preferred}' instead.`;
}
