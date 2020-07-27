import crypto, { Decipher } from 'crypto';
import Encryption from './Encryption';

const iv = Buffer.alloc(16);

/**
 * Decrypts given data into the {@link encoding.input} encoding
 */
class Decrypt extends Encryption {
  /**
   * Decrypts a given string
   * @param {string} str The string to decrypt
   * @returns {string}
   */
  public string(str: string): string {
    const { decipher } = this;

    const { input, output } = this.encryption.encoding;

    return decipher.update(str, output, input) + decipher.final(input);
  }

  /**
   * Creates a new decipher
   * @type {Decipher}
   */
  get decipher(): Decipher {
    return crypto.createDecipheriv(this.encryption.algorithm.type, this.key, iv);
  }
}

export default Decrypt;
