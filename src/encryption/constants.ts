import { HexBase64BinaryEncoding, Utf8AsciiBinaryEncoding } from 'crypto';

/**
 * The information about the algorithm being used for encryption
 */
export const algorithm = {
  /**
   * The type of the algorithm that is being used
   */
  type: 'aes128',

  /**
   * The length of the key required for this algorithm type
   */
  keylen: 16,
};

/**
 * The encodings used for encryption and decryption
 */
export const encoding = {
  /**
   * The encoding for the decoded data
   */
  input: 'utf8' as Utf8AsciiBinaryEncoding,

  /**
   * The encoding for the encoded data
   */
  output: 'base64' as HexBase64BinaryEncoding,
};

/**
 * A separator string between every log
 */
export const separator = '\n';
