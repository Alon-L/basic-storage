import crypto, { HexBase64Latin1Encoding } from 'crypto';

/**
 * The type of algorithm to use for the checksum hash
 */
export const algorithm = 'md5';

/**
 * The type of encoding to store the checksum hash in
 */
export const encoding: HexBase64Latin1Encoding = 'base64';

/**
 * Handles checksum generation
 */
class Checksum {
  /**
   * Generates a checksum hash for a string
   * @param {string} str The string to generate a checksum for
   * @returns {string}
   */
  static generate(str: string): string {
    return crypto.createHash(algorithm).update(str, 'utf8').digest(encoding);
  }
}

export default Checksum;
