/**
 * Interface for {@link Encrypt} and {@link Decrypt}.
 * Contains general properties and methods used for encryption
 */
abstract class Encryption {
  /**
   * The key for the cipher / decipher
   */
  public readonly key: Buffer;

  /**
   * The encryption options
   */
  protected readonly encryption: EncryptionOptions;

  constructor(key: Buffer, encryption: EncryptionOptions) {
    this.key = key;

    this.encryption = encryption;
  }

  /**
   * Encrypts / decrypts a given string
   * @param {string} str The string to encrypt / decrypt
   * @returns {string}
   */
  abstract string(str: string): string;
}

export default Encryption;
