import { promises as fs, constants } from 'fs';

/**
 * Represents a file
 */
export class File {
  /**
   * The name of the file
   */
  public readonly filename: string;

  constructor(filename: string) {
    this.filename = filename;
  }

  /**
   * Writes to a file
   * @param {string} data The data to write to the file
   * @returns {Promise<void>}
   */
  public write(data: string): Promise<void> {
    return fs.writeFile(this.filename, data);
  }

  /**
   * Appends content to the end of the file
   * @param {string} data The content to append
   * @returns {Promise<void>}
   */
  public append(data: string): Promise<void> {
    return fs.appendFile(this.filename, data);
  }

  /**
   * Clears a file
   * @returns {Promise<void>}
   */
  public clear(): Promise<void> {
    return fs.truncate(this.filename, 0);
  }

  /**
   * Returns whether the file exists
   * @returns {Promise<boolean>}
   */
  public async exists(): Promise<boolean> {
    try {
      await fs.access(this.filename, constants.F_OK);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Reads the content of the file
   * @returns {Promise<string>}
   */
  public read(): Promise<string> {
    return fs.readFile(this.filename, 'utf8');
  }
}
