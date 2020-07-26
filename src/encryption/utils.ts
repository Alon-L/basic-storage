import crypto from 'crypto';
import { algorithm } from './constants';

/**
 * Generates a crypto key from a password and a salt
 * @param {string} password The password
 * @param {string} salt The salt
 * @returns {Buffer}
 */
export const genKey = (password: string, salt: string): Buffer => {
  return crypto.scryptSync(password, salt, algorithm.keylen);
};
