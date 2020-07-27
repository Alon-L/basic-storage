import Logger, { LoggerOptions, LoggerAuth } from './Logger';

/**
 * Options for initializing a {@link Storage} instance
 */
export type StorageOptions = LoggerOptions;

class Storage<TValue = unknown> {
  /**
   * The cache this storage contains
   */
  private readonly cache: Map<string, TValue>;

  /**
   * The logger instance
   */
  private readonly logger: Logger;

  /**
   * The parser for the storage.
   * Stringifies and parses the values received in {@link setItem}
   */
  public parser: JSON;

  constructor(options: Partial<StorageOptions>, auth: LoggerAuth) {
    this.cache = new Map<string, TValue>();

    this.logger = new Logger(options, auth);

    this.parser = JSON;
  }

  /**
   * Returns an item identified by its key if exists, otherwise returns null
   * @param {string} key The key of the item
   * @returns {T | null}
   */
  public getItem<T extends TValue>(key: string): T | null {
    return this.hasItem(key) ? (this.cache.get(key) as T) : null;
  }

  /**
   * Adds an item identified by a key to the storage
   * @param {string} key The identifier of the item
   * @param {T} value The item value
   * @returns {Promise<void>}
   */
  public async setItem<T extends TValue>(key: string, value: T): Promise<void> {
    this.cache.set(key, value);

    await this.logger.write(this.serialize(key, value));
  }

  /**
   * Whether this storage contains an item
   * @param {string} key The key of the item
   * @returns {boolean}
   */
  public hasItem(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Serializes a key and value pair into the writable format: `"<KEY>":<VALUE>`
   * @param {string} key The key
   * @param {T} value The value
   * @returns {string}
   */
  private serialize<T extends TValue>(key: string, value: T): string {
    return `"${key}":${this.parser.stringify(value)}`;
  }
}

export default Storage;
