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

import { lstat, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { execa } from 'execa';

import type { ValidationResult } from '../../base-core/api.d.ts';

/**
 * Generate a KeyStore.
 */

export async function generateKeyStore(keyStoreFile: string, { packageName }: { packageName: string }): Promise<ValidationResult> {
  try {
    const stat = await lstat(keyStoreFile);
    if (stat.isFile()) {
      return { info: `KeyStore '${keyStoreFile}' already exists. Leaving unchanged.` };
    }
    throw new Error(`${keyStoreFile} is not a file`);
  } catch {
    /* File doesn't exist */
  }

  await mkdir(dirname(keyStoreFile), { recursive: true });
  const javaHome = process.env.JAVA_HOME;
  const keytoolCmd = javaHome ? `${javaHome}/bin/keytool` : 'keytool';
  try {
    // Generate the PKCS#12 keystore
    const result = await execa(keytoolCmd, [
      '-genkey',
      '-noprompt',
      '-storetype',
      'PKCS12',
      '-keyalg',
      'RSA',
      '-alias',
      'selfsigned',
      '-keystore',
      keyStoreFile,
      '-storepass',
      'password',
      '-keypass',
      'password',
      '-keysize',
      '2048',
      '-validity',
      '99999',
      '-dname',
      `CN=Java Hipster, OU=Development, O=${packageName}, L=, ST=, C=`,
    ]);
    return { info: [...result.stderr.split('\n').filter(Boolean), `KeyStore '${keyStoreFile}' generated successfully.`] };
  } catch (error) {
    return { debug: error, warning: `Failed to create a KeyStore with 'keytool': ${(error as Error).message}` };
  }
}

/**
 * Generates a KeyStore without touching the destination: `keytool` can only write to a file (`-keystore /dev/stdout`
 * is rejected with `keystore file exists, but is empty`), so it is generated in a temporary folder and read back.
 *
 * Lets the caller write the contents through the in-memory file system, which is what `--export-application` needs.
 */
export async function generateKeyStoreContents(
  keyStoreFile: string,
  { packageName }: { packageName: string },
): Promise<{ contents?: Buffer; result: ValidationResult }> {
  const temporaryFolder = await mkdtemp(join(tmpdir(), 'jhipster-keystore-'));
  const temporaryFile = join(temporaryFolder, 'keystore.p12');
  try {
    const result = await generateKeyStore(temporaryFile, { packageName });
    if (!Array.isArray(result.info)) {
      // `keytool` failed, the result holds the warning.
      return { result };
    }
    return {
      contents: await readFile(temporaryFile),
      // Report the destination, not the temporary file the KeyStore was generated into.
      result: { ...result, info: [...result.info.slice(0, -1), `KeyStore '${keyStoreFile}' generated successfully.`] },
    };
  } finally {
    await rm(temporaryFolder, { recursive: true, force: true });
  }
}
