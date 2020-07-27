import crypto, { Cipher } from 'crypto';
import Encryption from './Encryption';

const iv = Buffer.alloc(16);

/**
 * Encrypts given data into the {@link encoding.output} encoding
 */
class Encrypt extends Encryption {
  /**
   * Encrypts a given string
   * @param {string} str The string to encrypt
   * @returns {string}
   */
  public string(str: string): string {
    const { cipher } = this;

    const { input, output } = this.encryption.encoding;

    const encrypted = cipher.update(str, input, output) + cipher.final(output);

    return encrypted + this.encryption.separator;
  }

  /**
   * Creates a new cipher
   * @type {Cipher}
   */
  get cipher(): Cipher {
    return crypto.createCipheriv(this.encryption.algorithm.type, this.key, iv);
  }
}

export default Encrypt;
