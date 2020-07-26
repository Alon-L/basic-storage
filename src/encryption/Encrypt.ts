import crypto, { Cipher } from 'crypto';
import Encryption from './Encryption';
import { algorithm, encoding, separator } from './constants';

const iv = Buffer.alloc(16);

/**
 * Encrypts given data into the {@link encoding.output} encoding
 */
class Encrypt implements Encryption {
  /**
   * The key for the cipher - same key needs to be passed to the decipher
   */
  public readonly key: Buffer;

  constructor(key: Buffer) {
    this.key = key;
  }

  /**
   * Encrypts a given string
   * @param {string} str The string to encrypt
   * @returns {string}
   */
  public string(str: string): string {
    const { cipher } = this;

    const encrypted =
      cipher.update(str, encoding.input, encoding.output) + cipher.final(encoding.output);

    return encrypted + separator;
  }

  /**
   * Creates a new cipher
   * @type {Cipher}
   */
  get cipher(): Cipher {
    return crypto.createCipheriv(algorithm.type, this.key, iv);
  }
}

export default Encrypt;
