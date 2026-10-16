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
import { createHmac, hkdfSync, randomBytes } from 'node:crypto';

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
    len ??= 50;
    return `SECRET--${len}`;
  }
  return Buffer.from(createSecret(len)).toString('base64');
}

/**
 * A source of bytes derived from a seed, standing for `randomBytes`: the same seed and purpose give the same bytes.
 * HMAC-SHA512 in counter mode, keyed by HKDF-SHA512 of the seed and the purpose.
 * @param seed the value the bytes are derived from, like the creation timestamp of the project
 * @param purpose distinguishes the sources derived from the same seed
 */
export function createReproducibleRandomBytes(seed: string | number, purpose: string): (len: number) => Buffer {
  const key = Buffer.from(hkdfSync('sha512', String(seed), 'jhipster', purpose, 64));
  let counter = 0;
  let pending = Buffer.alloc(0);
  return (len: number) => {
    while (pending.length < len) {
      const block = Buffer.alloc(4);
      block.writeUInt32BE(counter++);
      pending = Buffer.concat([pending, createHmac('sha512', key).update(block).digest()]);
    }
    const bytes = pending.subarray(0, len);
    pending = pending.subarray(len);
    return bytes;
  };
}

/**
 * Generates a hex secret, in the format of createSecret, derived from a seed: the same seed and purpose give the same secret.
 * @param seed the value the secret is derived from, like the creation timestamp of the project
 * @param purpose distinguishes the secrets derived from the same seed
 * @param len the number of derived bytes, defaults to 50
 */
export function createReproducibleSecret(seed: string | number, purpose: string, len = 50): string {
  return createReproducibleRandomBytes(seed, purpose)(len).toString('hex');
}

/**
 * Generates a base64 secret, in the format of createBase64Secret, derived from a seed: the same seed and purpose give the
 * same secret.
 * @param seed the value the secret is derived from, like the creation timestamp of the project
 * @param purpose distinguishes the secrets derived from the same seed
 * @param len the number of derived bytes, defaults to 50
 */
export function createReproducibleBase64Secret(seed: string | number, purpose: string, len = 50): string {
  return Buffer.from(createReproducibleSecret(seed, purpose, len)).toString('base64');
}
