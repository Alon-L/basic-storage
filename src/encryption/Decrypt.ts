import crypto, { Decipher } from 'crypto';
import Encryption from './Encryption';
import { algorithm, encoding } from './constants';

const iv = Buffer.alloc(16);

/**
 * Decrypts given data into the {@link encoding.input} encoding
 */
class Decrypt implements Encryption {
  /**
   * The key for the decipher - same key for the cipher used for encrypting that data
   */
  public readonly key: Buffer;

  constructor(key: Buffer) {
    this.key = key;
  }

  /**
   * Decrypts a given string
   * @param {string} str The string to decrypt
   * @returns {string}
   */
  public string(str: string): string {
    const { decipher } = this;

    return decipher.update(str, encoding.output, encoding.input) + decipher.final(encoding.input);
  }

  /**
   * Creates a new decipher
   * @type {Decipher}
   */
  get decipher(): Decipher {
    return crypto.createDecipheriv(algorithm.type, this.key, iv);
  }
}

export default Decrypt;
