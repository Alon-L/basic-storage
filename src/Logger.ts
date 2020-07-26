import { createReadStream, promises as fs, ReadStream } from 'fs';
import readline from 'readline';
import Decrypt from './encryption/Decrypt';
import Encrypt from './encryption/Encrypt';
import { genKey } from './encryption/utils';

/**
 * Options for the Logger instance
 */
export interface LoggerOptions {
  /**
   * The name of the logs file
   */
  filename: string;
}

/**
 * Authentication details for the logs' encryption
 */
export interface LoggerAuth {
  /**
   * The password to use for the encryption
   */
  password: string;

  /**
   * The salt to use for the encryption
   */
  salt: string;
}

/**
 * Handles the writing and reading of log lines.
 * All lines are encrypted using {@link Encryption}
 */
class Logger {
  /**
   * General options for this instance
   */
  private readonly options: LoggerOptions;

  /**
   * The key to be passed to ciphers and deciphers for the logs' encryption
   */
  private readonly key: Buffer;

  private readonly encrypt: Encrypt;
  private readonly decrypt: Decrypt;

  constructor(options: Partial<LoggerOptions>, auth: LoggerAuth) {
    this.options = {
      // Filename defaults to 'logs'
      filename: './logs',
      ...options,
    };

    // Generate a key using the given password and salt
    this.key = genKey(auth.password, auth.salt);

    this.encrypt = new Encrypt(this.key);
    this.decrypt = new Decrypt(this.key);
  }

  /**
   * Encrypts and writes a log line to the log file
   * @param {string} log The log line
   * @returns {Promise<void>}
   */
  public write(log: string): Promise<void> {
    return fs.appendFile(this.options.filename, this.encrypt.string(log));
  }

  /**
   * Starts reading from the log file.
   * The content is read line by line
   */
  public async *read(): AsyncGenerator<string> {
    const { input } = this;

    // Read the log file line by line
    const rl = readline.createInterface({
      input,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      // Yield the decrypted log line
      yield this.decrypt.string(line.toString());
    }
  }

  /**
   * Clears the content of the log file
   * @returns {Promise<void>}
   */
  public clear(): Promise<void> {
    return fs.truncate(this.options.filename, 0);
  }

  /**
   * Creates a new read stream for the log file
   * @returns {ReadStream}
   */
  private get input(): ReadStream {
    return createReadStream(this.options.filename);
  }
}

export default Logger;
