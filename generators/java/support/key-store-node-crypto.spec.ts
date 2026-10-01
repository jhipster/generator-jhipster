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
import { after, before, describe, expect, it } from 'esmocha';
import { execFileSync, spawnSync } from 'node:child_process';
import { X509Certificate, createPrivateKey } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createKeyStore } from './key-store-node-crypto.ts';

type Der = { tag: number; value: Buffer; encoded: Buffer; children: Der[] };

// Decodes the DER elements of a buffer, recursing into constructed elements.
const decodeDer = (buffer: Buffer): Der[] => {
  const elements: Der[] = [];
  for (let offset = 0; offset < buffer.length;) {
    const tag = buffer[offset];
    let length = buffer[offset + 1];
    let start = offset + 2;
    if (length & 0x80) {
      const lengthBytes = length & 0x7f;
      length = buffer.subarray(start, start + lengthBytes).reduce((total, byte) => total * 256 + byte, 0);
      start += lengthBytes;
    }
    const value = buffer.subarray(start, start + length);
    elements.push({ tag, value, encoded: buffer.subarray(offset, start + length), children: tag & 0x20 ? decodeDer(value) : [] });
    offset = start + length;
  }
  return elements;
};

const readKeyStore = (contents: Buffer) => {
  const [pfx] = decodeDer(contents);
  const [, authSafe] = pfx.children;
  // ContentInfo data > [0] > OCTET STRING.
  const [authenticatedSafe] = decodeDer(authSafe.children[1].children[0].value);
  const [certificateBag, keyBag] = authenticatedSafe.children.map(contentInfo => {
    const [safeContents] = decodeDer(contentInfo.children[1].children[0].value);
    const [safeBag] = safeContents.children;
    const [, bagValue, bagAttributes] = safeBag.children;
    const friendlyName = Buffer.from(bagAttributes.children[0].children[1].children[0].value).swap16().toString('utf16le');
    return { value: bagValue.children[0], friendlyName };
  });
  // CertBag > [0] > OCTET STRING.
  const certificate = new X509Certificate(certificateBag.value.children[1].children[0].value);
  return {
    certificate,
    certificateAlias: certificateBag.friendlyName,
    keyAlias: keyBag.friendlyName,
    encryptedKey: keyBag.value.encoded,
  };
};

describe('generator - java - support - key-store-node-crypto', () => {
  describe('createKeyStore', () => {
    const contents = createKeyStore({ packageName: 'com.mycompany.myapp' });
    const keyStore = readKeyStore(contents);

    it('should store the key and the certificate under the selfsigned alias', () => {
      expect(keyStore.keyAlias).toBe('selfsigned');
      expect(keyStore.certificateAlias).toBe('selfsigned');
    });

    it('should encrypt the 2048 bits RSA key of the certificate with the password', () => {
      expect(() => createPrivateKey({ key: keyStore.encryptedKey, format: 'der', type: 'pkcs8', passphrase: 'wrong' })).toThrow();
      const key = createPrivateKey({ key: keyStore.encryptedKey, format: 'der', type: 'pkcs8', passphrase: 'password' });
      expect(key.asymmetricKeyDetails?.modulusLength).toBe(2048);
      expect(keyStore.certificate.checkPrivateKey(key)).toBe(true);
    });

    it('should generate a self-signed certificate for the package, valid for 99999 days', () => {
      const { certificate } = keyStore;
      expect(certificate.subject).toBe('O=com.mycompany.myapp\nOU=Development\nCN=Java Hipster');
      expect(certificate.issuer).toBe(certificate.subject);
      expect(certificate.verify(certificate.publicKey)).toBe(true);
      const days = (certificate.validToDate.getTime() - certificate.validFromDate.getTime()) / (24 * 60 * 60 * 1000);
      expect(Math.round(days)).toBe(99999);
    });

    it('should generate a new key each time', () => {
      const other = readKeyStore(createKeyStore({ packageName: 'com.mycompany.myapp' }));
      expect(other.certificate.publicKey.equals(keyStore.certificate.publicKey)).toBe(false);
    });

    describe('with openssl', () => {
      let folder: string;
      let file: string;
      const opensslAvailable = spawnSync('openssl', ['version']).status === 0;

      before(function () {
        if (!opensslAvailable) {
          this.skip();
        }
        folder = mkdtempSync(join(tmpdir(), 'keystore-'));
        file = join(folder, 'keystore.p12');
        writeFileSync(file, contents);
      });

      after(() => {
        if (folder) {
          rmSync(folder, { recursive: true });
        }
      });

      it('should verify the integrity of the KeyStore with the password', () => {
        expect(() =>
          execFileSync('openssl', ['pkcs12', '-in', file, '-passin', 'pass:password', '-noout'], { stdio: 'pipe' }),
        ).not.toThrow();
        expect(() => execFileSync('openssl', ['pkcs12', '-in', file, '-passin', 'pass:wrong', '-noout'], { stdio: 'pipe' })).toThrow();
      });
    });
  });
});
