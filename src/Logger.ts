import Decrypt from './encryption/Decrypt';
import Encrypt from './encryption/Encrypt';
import File from './files/File';

/**
 * Options for the Logger instance
 */
export interface LoggerOptions {
  /**
   * The name of the logs file
   */
  filename?: string;
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
   * The file that stores all the logs
   */
  public readonly file: File;

  /**
   * General options for this instance
   */
  public readonly options: Required<LoggerOptions>;

  private readonly encrypt: Encrypt;
  private readonly decrypt: Decrypt;

  constructor(options: LoggerOptions, key: Buffer) {
    this.file = new File(options.filename || './db.logs');

    this.options = {
      filename: this.file.filename,
      ...options,
    };

    this.encrypt = new Encrypt(key);
    this.decrypt = new Decrypt(key);
  }

  /**
   * Encrypts and writes a log line to the log file
   * @param {string} log The log line
   * @returns {Promise<void>}
   */
  public write(log: string): Promise<void> {
    return this.file.append(this.encrypt.string(log));
  }

  /**
   * Starts reading from the log file.
   * The content is reversely read line by line
   */
  public async *read(): AsyncGenerator<string> {
    const content = await this.file.read();

    // Split by new lines
    // Note: base64 can not include native line breaks
    const lines = content.split('\n');

    // Remove last blank line
    lines.pop();

    for await (const line of lines.reverse()) {
      // Yield the decrypted log line
      yield this.decrypt.string(line);
    }
  }
}

export default Logger;
