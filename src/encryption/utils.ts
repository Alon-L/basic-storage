import crypto from 'crypto';
import { algorithm } from './constants';

/**
 * Generates a crypto key from a password and a salt
 * @param {string} password The password
 * @param {string} salt The salt
 * @param {number} keylen The length in bytes of the generated key
 * @returns {Buffer}
 */
export const genKey = (password: string, salt: string, keylen = algorithm.keylen): Buffer => {
  return crypto.scryptSync(password, salt, keylen);
};
