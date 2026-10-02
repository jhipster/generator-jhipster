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
import { spawnSync } from 'node:child_process';
import { X509Certificate, createPrivateKey } from 'node:crypto';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { connect, createSecureContext, createServer } from 'node:tls';

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

// DER encoded object identifiers, written out rather than computed by the encoder under test.
const OID = {
  sha256: '608648016503040201',
  sha256WithRSAEncryption: '2a864886f70d01010b',
  pbes2: '2a864886f70d01050d',
  pbkdf2: '2a864886f70d01050c',
  hmacWithSHA256: '2a864886f70d0209',
  aes256Cbc: '60864801650304012a',
};
const hex = (element: Der) => element.value.toString('hex');
const toNumber = (element: Der) => element.value.reduce((total, byte) => total * 256 + byte, 0);

const readKeyStore = (contents: Buffer) => {
  const [pfx] = decodeDer(contents);
  const [, authSafe, macData] = pfx.children;
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
    macData,
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

    it('should encode the validity as UTCTime through 2049 and GeneralizedTime from 2050 on, as RFC 5280 requires', () => {
      const [certificate] = decodeDer(keyStore.certificate.raw);
      const [tbsCertificate] = certificate.children;
      const validity = tbsCertificate.children[4];
      // UTCTime notBefore (now), GeneralizedTime notAfter (2300).
      expect(validity.children.map(({ tag }) => tag)).toEqual([0x17, 0x18]);
    });

    it('should sign the certificate with SHA-256 and RSA', () => {
      const [certificate] = decodeDer(keyStore.certificate.raw);
      const [tbsCertificate, signatureAlgorithm] = certificate.children;
      expect(hex(signatureAlgorithm.children[0])).toBe(OID.sha256WithRSAEncryption);
      expect(hex(tbsCertificate.children[2].children[0])).toBe(OID.sha256WithRSAEncryption);
    });

    it('should encrypt the key with PBES2, PBKDF2 with HMAC-SHA256 and AES-256-CBC', () => {
      const [encryptedPrivateKeyInfo] = decodeDer(keyStore.encryptedKey);
      const [encryptionAlgorithm] = encryptedPrivateKeyInfo.children;
      const [algorithm, parameters] = encryptionAlgorithm.children;
      expect(hex(algorithm)).toBe(OID.pbes2);
      const [keyDerivation, encryptionScheme] = parameters.children;
      expect(hex(keyDerivation.children[0])).toBe(OID.pbkdf2);
      const [salt, iterations, ...rest] = keyDerivation.children[1].children;
      expect(salt.value.length).toBeGreaterThanOrEqual(8);
      expect(toNumber(iterations)).toBeGreaterThanOrEqual(2048);
      // The pseudo-random function, SHA-1 when absent.
      expect(hex(rest.at(-1)!.children[0])).toBe(OID.hmacWithSHA256);
      expect(hex(encryptionScheme.children[0])).toBe(OID.aes256Cbc);
      // The initialization vector, an AES block.
      expect(encryptionScheme.children[1].value).toHaveLength(16);
    });

    it('should protect the KeyStore with an HMAC-SHA256 MAC, 10000 iterations and a 20 bytes salt', () => {
      const [mac, salt, iterations] = keyStore.macData.children;
      const [digestAlgorithm, digest] = mac.children;
      expect(hex(digestAlgorithm.children[0])).toBe(OID.sha256);
      expect(digest.value).toHaveLength(32);
      expect(salt.value).toHaveLength(20);
      expect(toNumber(iterations)).toBe(10000);
    });

    it('should generate a new key, serial number and salts each time', () => {
      const other = readKeyStore(createKeyStore({ packageName: 'com.mycompany.myapp' }));
      expect(other.certificate.publicKey.equals(keyStore.certificate.publicKey)).toBe(false);
      expect(other.certificate.serialNumber).not.toBe(keyStore.certificate.serialNumber);
      expect(hex(other.macData.children[1])).not.toBe(hex(keyStore.macData.children[1]));
      const keySaltAndIv = ({ encryptedKey }: typeof keyStore) => {
        const [keyDerivation, encryptionScheme] = decodeDer(encryptedKey)[0].children[0].children[1].children;
        return [hex(keyDerivation.children[1].children[0]), hex(encryptionScheme.children[1])];
      };
      const [salt, iv] = keySaltAndIv(keyStore);
      const [otherSalt, otherIv] = keySaltAndIv(other);
      expect(otherSalt).not.toBe(salt);
      expect(otherIv).not.toBe(iv);
    });

    it('should encode a package name that is long or not ASCII', () => {
      const packageName = `com.exämple.${'a'.repeat(200)}`;
      const longKeyStore = createKeyStore({ packageName });
      expect(readKeyStore(longKeyStore).certificate.subject).toContain(`O=${packageName}\n`);
      expect(() => createSecureContext({ pfx: longKeyStore, passphrase: 'password' })).not.toThrow();
    });

    it('should be loaded by the OpenSSL of node, which verifies its integrity with the password', () => {
      expect(() => createSecureContext({ pfx: contents, passphrase: 'password' })).not.toThrow();
      expect(() => createSecureContext({ pfx: contents, passphrase: 'wrong' })).toThrow('mac verify failure');
      const tampered = Buffer.from(contents);
      tampered[200] ^= 1;
      expect(() => createSecureContext({ pfx: tampered, passphrase: 'password' })).toThrow('mac verify failure');
    });

    it('should serve TLS: only a client trusting the certificate completes the handshake', async () => {
      const server = createServer({ pfx: contents, passphrase: 'password' }, socket => socket.end());
      await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
      const { port } = server.address() as AddressInfo;
      // Resolves with the fingerprint of the certificate of the server, once it is trusted and the handshake is done.
      const handshake = (ca?: string) =>
        new Promise<string>((resolve, reject) => {
          // The certificate names no host, only the trust in it and the key of the server are checked.
          const socket = connect({ host: '127.0.0.1', port, ca, checkServerIdentity: () => undefined }, () => {
            resolve(socket.getPeerCertificate().fingerprint256);
            socket.end();
          });
          socket.on('error', reject);
        });
      try {
        await expect(handshake(keyStore.certificate.toString())).resolves.toBe(keyStore.certificate.fingerprint256);
        await expect(handshake()).rejects.toThrow('self-signed certificate');
      } finally {
        await new Promise(resolve => server.close(resolve));
      }
    });

    describe('with keytool', () => {
      const keytool = process.env.JAVA_HOME ? join(process.env.JAVA_HOME, 'bin', 'keytool') : 'keytool';
      // English output, whatever the locale.
      const list = (file: string, password: string) =>
        spawnSync(keytool, ['-J-Duser.language=en', '-list', '-v', '-keystore', file, '-storepass', password], { encoding: 'utf8' });
      let folder: string | undefined;
      let file: string;

      before(function () {
        // Optional: where there is no JDK, macOS included, which ships a keytool that only asks for one.
        if (spawnSync(keytool, ['-help']).status !== 0) {
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

      it('should be loaded by Java, as a key entry with its certificate', () => {
        const { status, stdout } = list(file, 'password');
        expect(status).toBe(0);
        expect(stdout).toContain('Keystore type: PKCS12');
        expect(stdout).toContain('Your keystore contains 1 entry');
        expect(stdout).toContain('Alias name: selfsigned');
        expect(stdout).toContain('Entry type: PrivateKeyEntry');
        expect(stdout).toContain('Certificate chain length: 1');
        expect(stdout).toContain('Owner: CN=Java Hipster, OU=Development, O=com.mycompany.myapp');
        expect(stdout).toContain('Issuer: CN=Java Hipster, OU=Development, O=com.mycompany.myapp');
        expect(stdout).toContain('Signature algorithm name: SHA256withRSA');
        expect(stdout).toContain('Subject Public Key Algorithm: 2048-bit RSA key');
      });

      it('should be refused by Java with another password', () => {
        expect(list(file, 'wrong').status).not.toBe(0);
      });
    });
  });
});
