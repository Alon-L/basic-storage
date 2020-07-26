/**
 * Interface for {@link Encrypt} and {@link Decrypt}.
 * Contains general properties and methods used for encryption
 */
interface Encryption {
  /**
   * The key for the cipher / decipher
   */
  readonly key: Buffer;

  /**
   * Encrypts / decrypts a given string
   * @param {string} str The string to encrypt / decrypt
   * @returns {string}
   */
  string(str: string): string;
}

export default Encryption;
