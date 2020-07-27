import { StoragePair } from './Storage';

/**
 * All possible data manipulation operations
 */
export const enum Operation {
  /**
   * Add an item to the Storage, identified by its key
   */
  Set = 'S:',

  /**
   * Remove an item from the Storage
   */
  Remove = 'R:',
}

/**
 * The length of all operations specified in {@link Operation}
 */
const operationLength = 2;

/**
 * Serializes and deserializes log lines
 */
class LogSerializer<TValue> {
  /**
   * The parser used for the log lines
   */
  private readonly parser: JSON;

  constructor(parser: JSON) {
    this.parser = parser;
  }

  /**
   * Deserialize an {@link Operation} type found in a log line
   * @param {string} log The log line
   * @returns {Operation}
   */
  public deserializeOperation(log: string): Operation {
    return log.substr(0, operationLength) as Operation;
  }

  /**
   * Serializes a key and value pair into the writable format: `"<KEY>":<VALUE>`
   * @param {string} key The key
   * @param {T} value The value
   * @returns {string}
   */
  public serializeSet<T extends TValue>(key: string, value: T): string {
    return `"${key}":${this.parser.stringify(value)}`;
  }

  /**
   * Deserializes a log line to a key and a value
   * @param {string} log The log line
   * @returns {StoragePair<T> | null}
   */
  public deserializeSet<T extends TValue>(log: string): StoragePair<T> | null {
    const regex = /"(?<key>\w+)":(?<value>.+)/;

    const matches = log.match(regex);
    if (!matches || !matches.groups) return null;

    const { key, value } = matches.groups;
    return { key, value: this.parser.parse(value) as T };
  }

  /**
   * Serializes a key into the writable format: "<KEY>"
   * @param {string} key The key to serialize
   * @returns {string}
   */
  public serializeRemove(key: string): string {
    return `"${key}"`;
  }

  /**
   * Deserializes a log line into a key
   * @param {string} log The log line
   * @returns {string | null}
   */
  public deserializeRemove(log: string): string | null {
    const regex = /"(?<key>\w+)"/;

    const matches = log.match(regex);
    if (!matches || !matches.groups) return null;

    return matches.groups.key;
  }
}

export default LogSerializer;
