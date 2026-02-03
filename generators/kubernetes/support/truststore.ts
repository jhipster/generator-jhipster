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
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { execa } from 'execa';

const resolveKeytoolCommand = () => {
  const javaHome = process.env.JAVA_HOME;
  return javaHome ? join(javaHome, 'bin', 'keytool') : 'keytool';
};

export async function rekeyTruststoreBase64({
  base64,
  currentPassword,
  newPassword,
}: {
  base64: string;
  currentPassword: string;
  newPassword: string;
}): Promise<string> {
  if (newPassword === currentPassword) {
    return base64;
  }

  const tempDir = await mkdtemp(join(tmpdir(), 'jhipster-truststore-'));
  const truststorePath = join(tempDir, 'truststore.jks');

  try {
    await writeFile(truststorePath, Buffer.from(base64, 'base64'));

    await execa(resolveKeytoolCommand(), [
      '-storepasswd',
      '-keystore',
      truststorePath,
      '-storepass',
      currentPassword,
      '-new',
      newPassword,
    ]);

    const updatedTruststore = await readFile(truststorePath);
    return updatedTruststore.toString('base64');
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}
