import { execa } from 'execa';
import { mkdir, lstat } from 'fs/promises';
import { dirname } from 'path';
import { ValidationResult } from '../../base/api.mjs';

/**
 * Generate a KeyStore.
 */
// eslint-disable-next-line import/prefer-default-export
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
    return { info: [...result.stderr.split('\n').filter(line => line), `KeyStore '${keyStoreFile}' generated successfully.`] };
  } catch (error) {
    return { debug: error, warning: `Failed to create a KeyStore with 'keytool': ${(error as Error).message}` };
  }
}
