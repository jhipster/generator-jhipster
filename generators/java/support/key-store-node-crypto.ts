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
/**
 * The development KeyStore of a generated application, built in memory with `node:crypto` alone.
 *
 * ## What it is for
 *
 * A generated Spring Boot application has a `tls` profile (`application-tls.yml`) that serves HTTPS from
 * `config/tls/keystore.p12`, a PKCS#12 KeyStore with the well-known password `password`, holding a self-signed
 * certificate under the `selfsigned` alias (`server.ssl.key-alias`). It is a development convenience: the file is
 * committed with the application and its password is public, so it gives a working TLS endpoint, not secrecy.
 * Production deployments provide their own KeyStore.
 *
 * `keytool -genkey` used to create that file, which needs a JDK when generating, can only write to the disk and
 * takes about half a second. This module creates an equivalent file in about 50 ms, without a JDK, a child process, a
 * temporary file or a dependency.
 *
 * ## What is delegated to OpenSSL (through node), and what is implemented here
 *
 * Every cryptographic operation is done by `node:crypto`, that is, by the OpenSSL node ships:
 *
 * - the RSA 2048 key pair: `generateKeyPairSync`;
 * - the certificate signature, RSASSA-PKCS1-v1_5 with SHA-256: `sign`;
 * - the encryption of the private key: `privateKey.export` with a cipher and a passphrase, which returns a complete
 *   `EncryptedPrivateKeyInfo` (PBES2: PBKDF2 with HMAC-SHA256, a random salt, 2048 iterations, then AES-256-CBC with
 *   a random initialization vector; salt, iterations and vector are chosen by OpenSSL);
 * - the hashes and the MAC: `createHash`, `createHmac`;
 * - the random values: `randomBytes`.
 *
 * Implemented here, because node has no API for them:
 *
 * - a DER encoder (ITU-T X.690) for the few ASN.1 types the structures need. It only encodes: the module never
 *   parses DER, a KeyStore, or any other input. Definite lengths, tags below 31, and positive integers whose first
 *   byte is below 0x80, anything else is refused with an error;
 * - the X.509 certificate structure (RFC 5280) around the public key and the signature node provides;
 * - the PKCS#12 container (RFC 7292) around the certificate and the encrypted key;
 * - the derivation of the MAC key from the password (RFC 7292, appendix B.2), see `pkcs12MacKey`. It is the only
 *   cryptographic algorithm written here, and it is made of SHA-256 calls only.
 *
 * ## The file, element by element
 *
 * ```
 * PFX                                        RFC 7292, section 4
 * ├─ version                                 3
 * ├─ authSafe: ContentInfo, type data        the contents, in an OCTET STRING:
 * │  └─ AuthenticatedSafe
 * │     ├─ ContentInfo, type data            not encrypted: a certificate is public
 * │     │  └─ SafeContents
 * │     │     └─ SafeBag, type certBag       attributes: friendlyName, localKeyId
 * │     │        └─ CertBag, x509Certificate
 * │     │           └─ Certificate           RFC 5280, see below
 * │     └─ ContentInfo, type data
 * │        └─ SafeContents
 * │           └─ SafeBag, type pkcs8ShroudedKeyBag   attributes: friendlyName, localKeyId
 * │              └─ EncryptedPrivateKeyInfo  RFC 5958, PBES2 of RFC 8018, from node
 * └─ macData
 *    ├─ mac: DigestInfo                      SHA-256, the HMAC of the AuthenticatedSafe
 *    ├─ macSalt                              20 random bytes
 *    └─ iterations                           10000
 * ```
 *
 * The certificate:
 *
 * ```
 * Certificate
 * ├─ tbsCertificate
 * │  ├─ version                              v3 (the value 2)
 * │  ├─ serialNumber                         the byte 01 then 8 random bytes: positive, 64 random bits
 * │  ├─ signature                            sha256WithRSAEncryption
 * │  ├─ issuer                               the same name as the subject: self-signed
 * │  ├─ validity                             now, to now + 99999 days
 * │  ├─ subject                              O=<packageName>, OU=Development, CN=Java Hipster
 * │  └─ subjectPublicKeyInfo                 from node
 * ├─ signatureAlgorithm                      sha256WithRSAEncryption
 * └─ signatureValue                          from node, over the DER of tbsCertificate
 * ```
 *
 * - The name is encoded most significant attribute first, one attribute per relative distinguished name, as
 *   UTF8String. Java prints it in the reverse order: `CN=Java Hipster, OU=Development, O=<packageName>`.
 * - RFC 5280 requires the validity dates through 2049 as UTCTime and from 2050 on as GeneralizedTime, both without
 *   fractional seconds. 99999 days end around the year 2300, so the two dates use different types.
 * - There are no extensions. Without basic constraints, RFC 5280 does not let a version 3 certificate be used as a
 *   certificate authority.
 *
 * The bag attributes are what makes Java and OpenSSL see one entry: both bags carry the same `friendlyName`, the
 * alias, as a BMPString, and the same `localKeyId`. The `localKeyId` is the SHA-1 of the certificate, as OpenSSL
 * writes it; it is an identifier that pairs the key with its certificate, not a security function.
 *
 * ## The integrity of the file
 *
 * The MAC is an HMAC-SHA256 of the DER of the AuthenticatedSafe. Its key is derived from the password with the
 * PKCS#12 key derivation function, 10000 iterations and the salt stored beside the MAC. A reader derives the same key
 * from the password it is given and compares the MAC: a wrong password and a modified file fail the same way.
 *
 * ## Compared to the KeyStore keytool creates
 *
 * Measured on a KeyStore created by the command the generator used to run, with the keytool of JDK 17, both files read
 * with `keytool -list -v` and `openssl pkcs12 -info`:
 *
 * ```
 * keytool -genkey -noprompt -storetype PKCS12 -keyalg RSA -keysize 2048 -alias selfsigned -validity 99999 \
 *   -keystore keystore.p12 -storepass password -keypass password \
 *   -dname "CN=Java Hipster, OU=Development, O=<packageName>, L=, ST=, C="
 * ```
 *
 * What is the same:
 *
 * |                       | keytool and this module                                        |
 * | --------------------- | -------------------------------------------------------------- |
 * | Format                | PKCS#12, one private key entry with a chain of one certificate |
 * | Alias, password       | `selfsigned`, `password`                                       |
 * | Key                   | RSA, 2048 bits, public exponent 65537                          |
 * | Certificate           | X.509 version 3, self-signed, SHA-256 with RSA                 |
 * | Validity              | 99999 days, to the year 2300                                   |
 * | Key encryption scheme | PBES2: PBKDF2 with HMAC-SHA256, AES-256-CBC                    |
 * | Integrity             | HMAC-SHA256, 10000 iterations, 20 bytes salt                   |
 * | Host name             | none: no subjectAltName, and the common name is not a host     |
 *
 * The last line is why a browser warns about the certificate of the `tls` profile, with either KeyStore.
 *
 * What differs, and the consequence of each difference:
 *
 * | | keytool | this module | Consequence |
 * | --- | --- | --- | --- |
 * | Key encryption iterations | 10000 | 2048 | A guess of the password costs less work. |
 * | Certificate bag | encrypted | not encrypted | The certificate is readable without the password. |
 * | Subject and issuer | ends with `L=, ST=, C=` | `CN`, `OU`, `O` only | The name prints shorter. |
 * | SubjectKeyIdentifier | present | absent | None for a certificate that issues no other. |
 * | Serial number | 64 random bits | `01`, then 64 random bits | None: positive and unique in both. |
 * | `localKeyId` | the text `Time <milliseconds>` | SHA-1 of the certificate | None: an opaque identifier. |
 *
 * - Key encryption iterations. PBKDF2 is repeated to make each guess of the password slower. 2048 is the default of
 *   OpenSSL, and `privateKey.export` has no option to change it. Here the password is `password` and is written in
 *   `application-tls.yml`, so there is nothing to guess and nothing is lost. It would be a weakness for a KeyStore
 *   with a secret password: do not use this module for one without encrypting the key with more iterations, which
 *   means building the PBES2 structure here from `pbkdf2Sync` and `createCipheriv`.
 * - Certificate bag. keytool encrypts the certificate with the password too, so its subject, which holds the package
 *   name, and its public key cannot be read from the file without it. A certificate is public by purpose: the
 *   server sends it to every client that connects. Leaving the bag in clear exposes nothing more, and keeps one more
 *   encrypted structure out of this module.
 * - Subject and issuer. keytool was given empty locality, state and country, and wrote them as empty attributes.
 *   They are left out: the certificate reads `CN=Java Hipster, OU=Development, O=<packageName>`. Nothing in the
 *   generated application reads the name; something that compared it to the exact text keytool printed would differ.
 * - SubjectKeyIdentifier. The extension identifies the key of a certificate so that the certificates it issued can
 *   point to it, which helps a client to build a chain. This certificate is its own issuer and issues nothing, there
 *   is no chain to build. `keytool -list -v` prints no `Extensions` block for it.
 * - Serial number and `localKeyId`. Different values of the same kind, read by nothing.
 *
 * Not about the file: keytool needed a JDK when generating and about half a second, wrote to the disk only, and when
 * it was missing the KeyStore was not created, with a warning. This module always creates it.
 *
 * ## How it is checked
 *
 * `key-store-node-crypto.spec.ts` reads the result back with a DER reader of its own and asserts the structure, the
 * algorithms (from object identifiers written in the spec, not computed by this encoder), that the key, the serial
 * number, the salts and the initialization vector change at each call, and loads the file with two independent
 * implementations: the OpenSSL of node (`tls.createSecureContext`), and Java through `keytool -list`, where a JDK is
 * installed. Both verify the MAC, so they check `pkcs12MacKey` against their own implementation.
 *
 * ## When changing it
 *
 * - Keep every cryptographic operation in `node:crypto`. Do not implement a cipher, a signature or a random source.
 * - DER requires the elements of a SET OF in the order of their encoding: the two bag attributes are written in it.
 * - `integer` only encodes the positive values described on it and throws on the others, `time` only whole seconds.
 * - Run the spec with a JDK: Java is the reader that matters, and the keytool tests are skipped without one.
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
