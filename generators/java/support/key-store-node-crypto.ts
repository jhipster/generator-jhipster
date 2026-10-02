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
import { createHash, createHmac, generateKeyPairSync, randomBytes, sign } from 'node:crypto';

const KEY_STORE_ALIAS = 'selfsigned';
const KEY_STORE_PASSWORD = 'password';
const KEY_STORE_VALIDITY_DAYS = 99_999;
const MAC_ITERATIONS = 10_000;

const OID = {
  data: '1.2.840.113549.1.7.1',
  sha256WithRSAEncryption: '1.2.840.113549.1.1.11',
  sha256: '2.16.840.1.101.3.4.2.1',
  organizationName: '2.5.4.10',
  organizationalUnitName: '2.5.4.11',
  commonName: '2.5.4.3',
  friendlyName: '1.2.840.113549.1.9.20',
  localKeyId: '1.2.840.113549.1.9.21',
  x509Certificate: '1.2.840.113549.1.9.22.1',
  pkcs8ShroudedKeyBag: '1.2.840.113549.1.12.10.1.2',
  certBag: '1.2.840.113549.1.12.10.1.3',
} as const;

// A minimal DER encoder, enough for the certificate and the PKCS#12 structures.
const encodeLength = (length: number): Buffer => {
  if (length < 0x80) {
    return Buffer.from([length]);
  }
  const bytes: number[] = [];
  for (let remaining = length; remaining > 0; remaining = Math.floor(remaining / 256)) {
    bytes.unshift(remaining % 256);
  }
  return Buffer.from([0x80 | bytes.length, ...bytes]);
};
const tlv = (tag: number, ...contents: Buffer[]): Buffer => {
  const value = Buffer.concat(contents);
  return Buffer.concat([Buffer.from([tag]), encodeLength(value.length), value]);
};
const sequence = (...contents: Buffer[]) => tlv(0x30, ...contents);
const set = (...contents: Buffer[]) => tlv(0x31, ...contents);
const explicit = (tagNumber: number, ...contents: Buffer[]) => tlv(0xa0 + tagNumber, ...contents);
const octetString = (value: Buffer) => tlv(0x04, value);
const nullValue = () => tlv(0x05);
const utf8String = (value: string) => tlv(0x0c, Buffer.from(value, 'utf8'));
const bmpString = (value: string) => tlv(0x1e, Buffer.from(value, 'utf16le').swap16());
const bitString = (value: Buffer) => tlv(0x03, Buffer.from([0]), value);
/**
 * A positive INTEGER, from its big-endian bytes or a number, whose first byte is from 0x01 to 0x7f. That is all the
 * structures need, so neither the zero byte a set high bit requires nor the removal of leading zeros is implemented.
 */
const integer = (value: Buffer | number): Buffer => {
  const hex = typeof value === 'number' ? value.toString(16) : '';
  const bytes = typeof value === 'number' ? Buffer.from(hex.length % 2 ? `0${hex}` : hex, 'hex') : value;
  if (bytes.length === 0 || bytes[0] === 0 || bytes[0] >= 0x80) {
    throw new Error('Unsupported INTEGER: its first byte must be from 0x01 to 0x7f');
  }
  return tlv(0x02, bytes);
};
const objectIdentifier = (oid: string): Buffer => {
  const [first, second, ...rest] = oid.split('.').map(Number);
  const bytes = [first * 40 + second];
  for (const arc of rest) {
    const base128 = [arc % 128];
    for (let remaining = Math.floor(arc / 128); remaining > 0; remaining = Math.floor(remaining / 128)) {
      base128.unshift(0x80 | (remaining % 128));
    }
    bytes.push(...base128);
  }
  return tlv(0x06, Buffer.from(bytes));
};
// RFC 5280: UTCTime (two-digit year) for dates through 2049, GeneralizedTime from 2050 on, which a 99999 days validity
// reaches.
const time = (date: Date) => {
  const generalized = date
    .toISOString()
    .replace(/\.\d+Z$/, 'Z')
    .replace(/[-:T]/g, '');
  return date.getUTCFullYear() < 2050 ? tlv(0x17, Buffer.from(generalized.slice(2))) : tlv(0x18, Buffer.from(generalized));
};
const algorithmIdentifier = (oid: string) => sequence(objectIdentifier(oid), nullValue());

/**
 * The integrity (MAC) key of a PKCS#12 KeyStore: the PKCS#12 key derivation function (RFC 7292, appendix B.2) with
 * SHA-256, for a key of the size of the hash, which is the first block of the function.
 */
const pkcs12MacKey = (password: string, salt: Buffer, iterations: number): Buffer => {
  // The block size of SHA-256, and the diversifier of a MAC key.
  const blockSize = 64;
  const macKeyId = 3;
  const repeatToBlocks = (bytes: Buffer) => {
    const repeated = Buffer.alloc(blockSize * Math.ceil(bytes.length / blockSize));
    for (let index = 0; index < repeated.length; index++) {
      repeated[index] = bytes[index % bytes.length];
    }
    return repeated;
  };
  // The password as a null-terminated BMPString.
  const passwordBytes = Buffer.concat([Buffer.from(password, 'utf16le').swap16(), Buffer.alloc(2)]);
  let key = createHash('sha256')
    .update(Buffer.alloc(blockSize, macKeyId))
    .update(repeatToBlocks(salt))
    .update(repeatToBlocks(passwordBytes))
    .digest();
  for (let iteration = 1; iteration < iterations; iteration++) {
    key = createHash('sha256').update(key).digest();
  }
  return key;
};

/**
 * The contents of a PKCS#12 KeyStore holding a 2048 bits RSA key and its self-signed certificate, under the `selfsigned`
 * alias and the `password` password, valid for 99999 days, as `keytool -genkey` created it.
 * Built with node crypto only: the key is encrypted with PBES2 (PBKDF2 with HMAC-SHA256, AES-256-CBC) and the KeyStore
 * is protected by an HMAC-SHA256 MAC.
 */
export const createKeyStore = ({ packageName }: { packageName: string }): Buffer => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

  // Most significant first: `CN=Java Hipster, OU=Development, O=<packageName>`.
  const name = sequence(
    ...[
      [OID.organizationName, packageName],
      [OID.organizationalUnitName, 'Development'],
      [OID.commonName, 'Java Hipster'],
    ].map(([oid, value]) => set(sequence(objectIdentifier(oid), utf8String(value)))),
  );
  const notBefore = new Date();
  const notAfter = new Date(notBefore.getTime() + KEY_STORE_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
  const tbsCertificate = sequence(
    // Version 3.
    explicit(0, integer(2)),
    // A positive serial number.
    integer(Buffer.concat([Buffer.from([1]), randomBytes(8)])),
    algorithmIdentifier(OID.sha256WithRSAEncryption),
    name,
    sequence(time(notBefore), time(notAfter)),
    name,
    publicKey.export({ type: 'spki', format: 'der' }),
  );
  const certificate = sequence(
    tbsCertificate,
    algorithmIdentifier(OID.sha256WithRSAEncryption),
    bitString(sign('sha256', tbsCertificate, privateKey)),
  );

  // The same attributes on both bags pair the key with its certificate under the alias.
  const bagAttributes = set(
    sequence(objectIdentifier(OID.friendlyName), set(bmpString(KEY_STORE_ALIAS))),
    sequence(objectIdentifier(OID.localKeyId), set(octetString(createHash('sha1').update(certificate).digest()))),
  );
  // A ContentInfo of type data holding a SafeContents with a single SafeBag.
  const safeContents = (bagId: string, bagValue: Buffer) =>
    sequence(
      objectIdentifier(OID.data),
      explicit(0, octetString(sequence(sequence(objectIdentifier(bagId), explicit(0, bagValue), bagAttributes)))),
    );
  const authenticatedSafe = sequence(
    safeContents(OID.certBag, sequence(objectIdentifier(OID.x509Certificate), explicit(0, octetString(certificate)))),
    // An EncryptedPrivateKeyInfo: PBES2, PBKDF2 with HMAC-SHA256 and AES-256-CBC.
    safeContents(
      OID.pkcs8ShroudedKeyBag,
      privateKey.export({ type: 'pkcs8', format: 'der', cipher: 'aes-256-cbc', passphrase: KEY_STORE_PASSWORD }),
    ),
  );

  const macSalt = randomBytes(20);
  const macKey = pkcs12MacKey(KEY_STORE_PASSWORD, macSalt, MAC_ITERATIONS);
  const mac = createHmac('sha256', macKey).update(authenticatedSafe).digest();
  return sequence(
    integer(3),
    sequence(objectIdentifier(OID.data), explicit(0, octetString(authenticatedSafe))),
    sequence(sequence(algorithmIdentifier(OID.sha256), octetString(mac)), octetString(macSalt), integer(MAC_ITERATIONS)),
  );
};
