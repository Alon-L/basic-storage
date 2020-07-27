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
  private readonly serializer: LogSerializer<TValue>;

  /**
   * Array of keys that were removed from the Storage in the log file
   */
  private readonly removedKeys: string[] = [];

  constructor(options: Partial<StorageOptions>, auth: LoggerAuth) {
    this.cache = new Map<string, TValue>();

    this.logger = new Logger(options, this.key);

    this.file = new StorageFile(this, options.filename || './db');

    this.options = {
      filename: this.file.filename,
      logger: this.logger.options,
      parser: JSON,
      ...options,
    };

    this.serializer = new LogSerializer(this.options.parser);

    this.removedKeys = [];
  }

  /**
   * Load all data from the logs and saved JSON
   * @returns {Promise<this>}
   */
  public async load(): Promise<this> {
    await this.loadLogs();
    await this.loadJSON();

    // Save the updated data
    await this.saveJSON();

    return this;
  }

  /**
   * Loads all logs in the log file to the cache
   * @returns {Promise<void>}
   */
  private async loadLogs(): Promise<void> {
    if (!(await this.logger.file.exists())) return;

    // Iterate over all lines in the log file
    for await (const log of this.logger.read()) {
      const operation = this.serializer.deserializeOperation(log);

      switch (operation) {
        // Set operation - add the item to the storage
        case Operation.Set: {
          const deserialized = this.serializer.deserializeSet(log);

          if (!deserialized) {
            throw new Error('The serialized data in your log file is badly formatted!');
          }

          const { key, value } = deserialized;

          // Check whether the item is removed in a future log - do not add it to the storage
          if (this.removedKeys.includes(key)) continue;

          // Check whether the item was already loaded
          if (this.hasItem(key)) continue;

          // Add the item to the cache without writing it to the log file
          await this.setItem(key, value, false);

          break;
        }
        // Remove operation - prevent future set operations from setting the item identified by its key
        case Operation.Remove: {
          const key = this.serializer.deserializeRemove(log);

          if (!key) {
            throw new Error('The serialized data in your log file is badly formatted!');
          }

          // Add the removed key to the removed keys array
          this.removedKeys.push(key);

          break;
        }
      }
    }
  }

  /**
   * Loads all items inside the JSON file onto the cache
   * @returns {Promise<void>}
   */
  public async loadJSON(): Promise<void> {
    if (!(await this.file.exists())) return;

    const content = await this.file.read();

    const parsed: Record<string, TValue> = JSON.parse(content || '{}');

    for (const [key, value] of Object.entries(parsed)) {
      // Check whether the item was removed in a log
      if (this.removedKeys.includes(key)) continue;

      // Check whether the item was already loaded from the log file - the latest version
      if (this.hasItem(key)) continue;

      // Add the item to the cache without writing it the log file
      await this.setItem(key, value, false);
    }
  }

  /**
   * Saves the cache to the JSON file
   * @returns {Promise<void>}
   */
  public async saveJSON(): Promise<void> {
    await this.file.write(JSON.stringify(this.toJSON()));

    // Clear the log file since it has no use anymore
    if (!(await this.logger.file.exists())) return;
    await this.logger.file.clear();
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
   * @param {boolean} log Whether to log the pair item to the log file
   * @returns {Promise<void>}
   */
  public async setItem<T extends TValue>(key: string, value: T, log = true): Promise<void> {
    this.cache.set(key, value);

    if (log) {
      await this.logger.write(Operation.Set + this.serializer.serializeSet(key, value));
    }
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
