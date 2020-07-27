import crypto, { HexBase64Latin1Encoding } from 'crypto';

/**
 * The data for the checksum generation
 */
export const checksum = {
  /**
   * The type of algorithm to use for the checksum hash
   */
  algorithm: 'md5',

  /**
   * The type of encoding to store the checksum hash in
   */
  encoding: 'base64' as HexBase64Latin1Encoding,
};

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
    return crypto.createHash(checksum.algorithm).update(str, 'utf8').digest(checksum.encoding);
  }
}

export default Checksum;
