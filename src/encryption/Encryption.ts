import { encoding, algorithm } from './constants';

/**
 * The options for the encryption of the log file and storage file
 */
export interface EncryptionOptions {
  /**
   * The information about the algorithm being used for encryption
   */
  algorithm: typeof algorithm;

  /**
   * The encodings used for encryption and decryption
   */
  encoding: typeof encoding;

  /**
   * The separator string between every log.
   * Note: the separator *MUST* be unable to appear in the encoding output you choose to use
   */
  separator: string;
}

/**
 * Interface for {@link Encrypt} and {@link Decrypt}.
 * Contains general properties and methods used for encryption
 */
export abstract class Encryption {
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
