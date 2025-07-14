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
import { randomBytes } from 'crypto';

/**
 * Get a random hex string
 * @param {number} len the length to use, defaults to 50
 */
export function createSecret(len = 50): string {
  return randomBytes(len).toString('hex');
}

/**
 * Generates a base64 secret from given string or random hex
 * @param secret the value used to get base64 secret
 */
export function convertSecretToBase64(secret: string) {
  return Buffer.from(secret).toString('base64');
}

/**
 * Generates a base64 secret from given string or random hex
 * @param len the length to use for random hex, defaults to 50
 * @param reproducible generate a reproducible content
 */
export function createBase64Secret(len?: number, reproducible?: boolean): string;
export function createBase64Secret(reproducible?: boolean): string;
export function createBase64Secret(len?: number | boolean, reproducible = false): string {
  if (typeof len === 'boolean') {
    reproducible = len;
    len = undefined;
  }
  if (reproducible) {
    len = len ?? 50;
    return `SECRET--${len}`;
  }
  return Buffer.from(createSecret(len)).toString('base64');
}
