import { LogSerializer, Operation } from './LogSerializer';
import { Logger, LoggerAuth, LoggerOptions } from './Logger';
import { EncryptionOptions, algorithm, encoding, separator, genKey } from './encryption';
import { StorageFile } from './files';

/**
 * Options for initializing a {@link Storage} instance
 */
export interface StorageOptions {
  /**
   * The name of the storage output file
   */
  filename?: string;

  /**
   * The options for the storage's logger
   */
  logger?: LoggerOptions;

  /**
   * The parser used for stringifying and parsing the saved logs
   */
  parser?: JSON;

  /**
   * The options for the encryption of the log file and storage file
   */
  encryption?: Partial<EncryptionOptions>;
}

/**
 * Full storage options, stored in {@link Storage.options}
 */
export type FullStorageOptions = Required<StorageOptions> & {
  encryption: Required<EncryptionOptions>;
};

/**
 * Type for key and value pairs found in the storage cache
 */
export interface StoragePair<T> {
  /**
   * The item's key
   */
  key: string;

  /**
   * The item's value
   */
  value: T;
}

/**
 * The main interface of the library.
 * Capable of caching, saving and loading storage data
 */
export class Storage<TValue = unknown> {
  /**
   * The key used for encrypting the log file and storage file
   */
  public readonly key: Buffer;

  /**
   * The cache this storage contains
   */
  private readonly cache: Map<string, TValue>;

  /**
   * The logger instance
   */
  private readonly logger: Logger;

  /**
   * The options for this storage instance
   */
  public readonly options: FullStorageOptions;

  /**
   * The file that contains the storage data
   */
  private readonly file: StorageFile;

  /**
   * LogSerializer instance to serialize and deserialize logs
   */
  private readonly serializer: LogSerializer<TValue>;

  /**
   * Array of keys that were removed from the Storage in the log file
   */
  private readonly removedKeys: string[] = [];

  constructor(auth: LoggerAuth, options?: StorageOptions) {
    this.cache = new Map<string, TValue>();

    this.options = {
      filename: './db',
      parser: JSON,
      logger: {
        filename: './db.logs',
      },
      ...options,
      encryption: {
        algorithm: {
          type: algorithm.type,
          keylen: algorithm.keylen,
        },
        encoding,
        separator,
        ...options?.encryption,
      },
    };

    // Generate a key using the given password and salt
    this.key = genKey(auth.password, auth.salt, this.options.encryption.algorithm.keylen);

    this.logger = new Logger(this.options.logger, this.options.encryption, this.key);

    this.file = new StorageFile(this, this.options.filename);

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

          // Check whether the item was already loaded
          if (this.hasItem(key)) continue;

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
    await this.file.write(JSON.stringify(this));

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
    return this.cache.get(key) as T || null;
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
   * Removes an item from the storage
   * @param {string} key The key of the item
   * @param {boolean} log Whether to log the removed item
   */
  public async removeItem(key: string, log = true): Promise<void> {
    this.cache.delete(key);

    if (log) {
      await this.logger.write(Operation.Remove + this.serializer.serializeRemove(key));
    }
  }

  /**
   * Clears the cached data in the storage
   * @returns {void}
   */
  public async clear(): Promise<void> {
    await this.cache.clear();
    await this.saveJSON();
  }

  /**
   * The size of the storage's cache
   * @type {number}
   */
  public get size(): number {
    return this.cache.size;
  }

  /**
   * Converts the cached map into JSON
   * @returns {Record<string, TValue>}
   */
  public toJSON(): Record<string, TValue> {
    return [...this.cache].reduce((obj, [key, val]) => {
      obj[key] = val;
      return obj;
    }, {} as Record<string, TValue>);
  }
}
