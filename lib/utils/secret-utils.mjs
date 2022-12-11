import { randomBytes } from 'crypto';

/**
 * Get a random hex string
 * @param {number} len the length to use, defaults to 50
 */
export function createSecret(len = 50) {
  return randomBytes(len).toString('hex');
}

/**
 * Generates a base64 secret from given string or random hex
 * @param {string} value the value used to get base64 secret
 * @param {number} len the length to use for random hex, defaults to 50
 */
export function createBase64Secret(value = '', len = 50) {
  if (this && this.options && this.options.reproducibleTests) {
    if (value) {
      return `SECRET-${value}-${len}`;
    }
    return `SECRET--${len}`;
  }
  return Buffer.from(value || createSecret(len)).toString('base64');
}
